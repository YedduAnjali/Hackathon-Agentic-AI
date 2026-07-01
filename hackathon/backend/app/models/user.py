"""User model and database operations."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId
from app.core.database import Database


class UserBase(BaseModel):
    """Base user schema."""
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr


class UserCreate(UserBase):
    """User creation schema."""
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    """User login schema."""
    email: EmailStr
    password: str


class User(UserBase):
    """User response schema."""
    id: str = Field(alias="_id")
    createdAt: datetime
    lastLogin: Optional[datetime] = None
    role: str = "user"

    class Config:
        populate_by_name = True


class UserInDB(User):
    """User in database with password hash."""
    passwordHash: str


class UserCollection:
    """User collection operations."""
    
    COLLECTION_NAME = "users"
    
    @classmethod
    async def create_user(cls, user_data: UserCreate, password_hash: str) -> dict:
        """Create a new user in the database."""
        db = Database.get_database()
        
        # Check if user already exists
        existing_user = await db[cls.COLLECTION_NAME].find_one(
            {"email": user_data.email}
        )
        if existing_user:
            raise ValueError("User with this email already exists")
        
        user_doc = {
            "name": user_data.name,
            "email": user_data.email,
            "passwordHash": password_hash,
            "createdAt": datetime.utcnow(),
            "lastLogin": None,
            "role": "user"
        }
        
        result = await db[cls.COLLECTION_NAME].insert_one(user_doc)
        user_doc["_id"] = result.inserted_id
        return user_doc
    
    @classmethod
    async def get_user_by_email(cls, email: str) -> Optional[dict]:
        """Get user by email."""
        db = Database.get_database()
        user = await db[cls.COLLECTION_NAME].find_one(
            {"email": email}
        )
        return user
    
    @classmethod
    async def get_user_by_id(cls, user_id: str) -> Optional[dict]:
        """Get user by ID."""
        db = Database.get_database()
        try:
            user = await db[cls.COLLECTION_NAME].find_one(
                {"_id": ObjectId(user_id)}
            )
            return user
        except Exception:
            return None
    
    @classmethod
    async def update_last_login(cls, user_id: str) -> None:
        """Update last login timestamp."""
        db = Database.get_database()
        try:
            await db[cls.COLLECTION_NAME].update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"lastLogin": datetime.utcnow()}}
            )
        except Exception:
            pass
