"""Authentication API routes."""
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from app.models.user import UserCreate, UserLogin
from app.auth.controller import AuthController
from app.auth.middleware import get_current_user
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/signup")
async def signup(user_data: UserCreate):
    """
    Sign up a new user.
    
    Returns:
        - user: User information
        - token: JWT access token
    """
    result = await AuthController.signup(user_data)
    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content=result
    )


@router.post("/login")
async def login(login_data: UserLogin):
    """
    Log in a user.
    
    Returns:
        - user: User information
        - token: JWT access token
    """
    result = await AuthController.login(login_data)
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content=result
    )


@router.get("/me")
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Get current authenticated user information.
    
    Requires: Authorization header with Bearer token
    """
    try:
        user_info = await AuthController.get_current_user_info(current_user["sub"])
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "User information retrieved",
                "user": user_info
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get me error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.post("/logout")
async def logout(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Logout user.
    
    Note: Token invalidation is handled client-side by removing token from storage.
    """
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "message": "Logout successful"
        }
    )
