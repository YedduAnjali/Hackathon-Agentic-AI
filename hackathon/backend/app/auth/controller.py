"""Authentication controller."""
from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from app.models.user import UserCreate, UserLogin, UserCollection
from app.auth.utils import AuthUtils
from app.models.user import User
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


class AuthController:
    """Authentication business logic."""
    
    @staticmethod
    async def signup(user_data: UserCreate) -> Dict[str, Any]:
        """Register a new user."""
        try:
            # Hash password
            password_hash = AuthUtils.hash_password(user_data.password)
            
            # Create user in database
            user_doc = await UserCollection.create_user(user_data, password_hash)
            
            # Create JWT token
            token = AuthUtils.create_access_token(
                str(user_doc["_id"]),
                user_doc["email"]
            )
            
            return {
                "message": "User created successfully",
                "user": {
                    "id": str(user_doc["_id"]),
                    "name": user_doc["name"],
                    "email": user_doc["email"]
                },
                "token": token
            }
        except ValueError as e:
            if "already exists" in str(e):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=str(e)
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        except Exception as e:
            logger.error(f"Signup error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )
    
    @staticmethod
    async def login(login_data: UserLogin) -> Dict[str, Any]:
        """Authenticate user and return token."""
        try:
            # Find user by email
            user_doc = await UserCollection.get_user_by_email(login_data.email)
            
            if not user_doc:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
            
            # Verify password
            if not AuthUtils.verify_password(
                login_data.password,
                user_doc["passwordHash"]
            ):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
            
            # Update last login
            await UserCollection.update_last_login(str(user_doc["_id"]))
            
            # Create JWT token
            token = AuthUtils.create_access_token(
                str(user_doc["_id"]),
                user_doc["email"]
            )
            
            return {
                "message": "Login successful",
                "user": {
                    "id": str(user_doc["_id"]),
                    "name": user_doc["name"],
                    "email": user_doc["email"]
                },
                "token": token
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Login error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )
    
    @staticmethod
    async def get_current_user_info(user_id: str) -> Dict[str, Any]:
        """Get current user information."""
        try:
            user_doc = await UserCollection.get_user_by_id(user_id)
            
            if not user_doc:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            return {
                "id": str(user_doc["_id"]),
                "name": user_doc["name"],
                "email": user_doc["email"],
                "createdAt": user_doc["createdAt"].isoformat(),
                "lastLogin": user_doc.get("lastLogin").isoformat() if user_doc.get("lastLogin") else None,
                "role": user_doc.get("role", "user")
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Get user error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )
