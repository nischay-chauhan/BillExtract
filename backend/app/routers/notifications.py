"""
Notifications Router

Handles push token registration and notification management.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from bson import ObjectId

from app.models.notification import (
    PushTokenCreate, 
    PushToken, 
    Notification, 
    NotificationResponse,
    NotificationCreate
)
from app.models.user import TokenData
from app.utils.auth import get_current_user
from app.utils.db import get_database
from app.services.push_service import send_notification_to_user
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
    responses={404: {"description": "Not found"}},
)


@router.post("/register-token", status_code=status.HTTP_201_CREATED)
async def register_push_token(
    token_data: PushTokenCreate,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Register a push notification token for the current user.
    """
    db = await get_database()
    
    # Get user ID from email
    user = await db.users.find_one({"email": current_user.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = str(user["_id"])
    
    # Check if token already exists
    existing = await db.push_tokens.find_one({
        "user_id": user_id,
        "token": token_data.token
    })
    
    if existing:
        # Update existing token to active
        await db.push_tokens.update_one(
            {"_id": existing["_id"]},
            {"$set": {"active": True, "platform": token_data.platform}}
        )
        logger.info(f"Push token reactivated for user: {current_user.email}")
        return {"message": "Token registered successfully", "status": "reactivated"}
    
    # Create new token
    push_token = {
        "user_id": user_id,
        "token": token_data.token,
        "platform": token_data.platform,
        "created_at": datetime.utcnow(),
        "active": True
    }
    
    await db.push_tokens.insert_one(push_token)
    logger.info(f"Push token registered for user: {current_user.email}")
    
    return {"message": "Token registered successfully", "status": "created"}


@router.delete("/unregister-token")
async def unregister_push_token(
    token: str,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Unregister (deactivate) a push notification token.
    """
    db = await get_database()
    
    # Get user ID
    user = await db.users.find_one({"email": current_user.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = str(user["_id"])
    
    # Deactivate the token
    result = await db.push_tokens.update_one(
        {"user_id": user_id, "token": token},
        {"$set": {"active": False}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Token not found")
    
    logger.info(f"Push token unregistered for user: {current_user.email}")
    return {"message": "Token unregistered successfully"}


@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    limit: int = 50,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get notifications for the current user.
    """
    db = await get_database()
    
    # Get user ID
    user = await db.users.find_one({"email": current_user.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = str(user["_id"])
    
    # Fetch notifications
    cursor = db.notifications.find(
        {"user_id": user_id}
    ).sort("sent_at", -1).limit(limit)
    
    notifications = []
    async for doc in cursor:
        notifications.append(NotificationResponse(
            id=str(doc["_id"]),
            title=doc["title"],
            body=doc["body"],
            data=doc.get("data"),
            sent_at=doc["sent_at"],
            read=doc.get("read", False)
        ))
    
    return notifications


@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Mark a notification as read.
    """
    db = await get_database()
    
    try:
        obj_id = ObjectId(notification_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid notification ID")
    
    result = await db.notifications.update_one(
        {"_id": obj_id},
        {"$set": {"read": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification marked as read"}


@router.post("/send-test")
async def send_test_notification(
    current_user: TokenData = Depends(get_current_user)
):
    """
    Send a test notification to the current user.
    """
    db = await get_database()
    
    # Get user ID
    user = await db.users.find_one({"email": current_user.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = str(user["_id"])
    
    result = await send_notification_to_user(
        db=db,
        user_id=user_id,
        title="Test Notification 🔔",
        body="This is a test notification from Bill Extractor!",
        data={"type": "test"}
    )
    
    return result
