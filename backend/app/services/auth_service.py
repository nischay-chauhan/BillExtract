from typing import Optional
from app.utils.db import get_database
from app.models.user import UserCreate, UserInDB
from app.utils.auth import get_password_hash, verify_password
from bson import ObjectId
from datetime import datetime

async def create_user(user: UserCreate) -> UserInDB:
    """
    Create a new user in the database.
    
    Args:
        user: UserCreate model with email and password
        
    Returns:
        UserInDB: Created user with hashed password
        
    Raises:
        ValueError: If user with email already exists
    """
    db = await get_database()
    users_collection = db.users
    
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise ValueError("User with this email already exists")
    
    # Hash the password
    hashed_password = get_password_hash(user.password)
    
    # Create user document
    user_doc = {
        "email": user.email,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Insert into database
    result = await users_collection.insert_one(user_doc)
    
    # Create index on email for faster lookups
    await users_collection.create_index("email", unique=True)
    
    # Return the created user
    user_doc["_id"] = str(result.inserted_id)
    return UserInDB(**user_doc)

async def get_user_by_email(email: str) -> Optional[UserInDB]:
    """
    Retrieve a user by email.
    
    Args:
        email: User's email address
        
    Returns:
        UserInDB if found, None otherwise
    """
    db = await get_database()
    users_collection = db.users
    
    user = await users_collection.find_one({"email": email})
    
    if user:
        user["_id"] = str(user["_id"])
        return UserInDB(**user)
    
    return None

async def get_user_by_id(user_id: str) -> Optional[UserInDB]:
    """
    Retrieve a user by ID.
    
    Args:
        user_id: User's MongoDB ObjectId as string
        
    Returns:
        UserInDB if found, None otherwise
    """
    db = await get_database()
    users_collection = db.users
    
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    
    if user:
        user["_id"] = str(user["_id"])
        return UserInDB(**user)
    
    return None

async def authenticate_user(email: str, password: str) -> Optional[UserInDB]:
    """
    Authenticate a user with email and password.
    
    Args:
        email: User's email
        password: Plain text password
        
    Returns:
        UserInDB if authentication successful, None otherwise
    """
    user = await get_user_by_email(email)
    
    if not user:
        return None
    
    if not verify_password(password, user.hashed_password):
        return None
    
    return user
