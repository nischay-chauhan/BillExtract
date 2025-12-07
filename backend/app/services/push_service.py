"""
Expo Push Notification Service

Handles sending push notifications via Expo Push API.
Docs: https://docs.expo.dev/push-notifications/sending-notifications/
"""

import httpx
from typing import List, Optional, Dict, Any
from datetime import datetime


EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


async def send_expo_push(
    tokens: List[str],
    title: str,
    body: str,
    data: Optional[Dict[str, Any]] = None,
    badge: Optional[int] = None,
    sound: str = "default"
) -> Dict[str, Any]:
    """
    Send push notification via Expo Push API.
    
    Args:
        tokens: List of Expo push tokens (ExponentPushToken[xxx])
        title: Notification title
        body: Notification body text
        data: Optional data payload
        badge: Badge count (iOS only)
        sound: Notification sound
    
    Returns:
        Response from Expo Push API
    """
    messages = []
    
    for token in tokens:
        message = {
            "to": token,
            "title": title,
            "body": body,
            "sound": sound,
        }
        
        if data:
            message["data"] = data
        
        if badge is not None:
            message["badge"] = badge
            
        messages.append(message)
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            EXPO_PUSH_URL,
            json=messages,
            headers={
                "Accept": "application/json",
                "Accept-Encoding": "gzip, deflate",
                "Content-Type": "application/json",
            }
        )
        
        return response.json()


async def send_notification_to_user(
    db,
    user_id: str,
    title: str,
    body: str,
    data: Optional[Dict[str, Any]] = None,
    save_to_db: bool = True
) -> Dict[str, Any]:
    """
    Send push notification to a specific user.
    
    Args:
        db: Database connection
        user_id: User's ID
        title: Notification title
        body: Notification body
        data: Optional data payload
        save_to_db: Whether to save notification to database
    
    Returns:
        Result of the push operation
    """
    # Get user's active push tokens
    push_tokens_collection = db.push_tokens
    cursor = push_tokens_collection.find({
        "user_id": user_id,
        "active": True
    })
    
    tokens = []
    async for doc in cursor:
        tokens.append(doc["token"])
    
    if not tokens:
        return {"success": False, "error": "No active push tokens for user"}
    
    # Send push notification
    result = await send_expo_push(tokens, title, body, data)
    
    # Save notification to database
    if save_to_db:
        notifications_collection = db.notifications
        await notifications_collection.insert_one({
            "user_id": user_id,
            "title": title,
            "body": body,
            "data": data,
            "sent_at": datetime.utcnow(),
            "read": False
        })
    
    return {"success": True, "result": result}


async def send_receipt_processed_notification(
    db,
    user_id: str,
    receipt_id: str,
    store_name: str
) -> Dict[str, Any]:
    """
    Send notification when a receipt is processed successfully.
    """
    return await send_notification_to_user(
        db=db,
        user_id=user_id,
        title="Receipt Processed! 🎉",
        body=f"Your receipt from {store_name} has been processed successfully.",
        data={
            "type": "receipt_processed",
            "receipt_id": receipt_id
        }
    )
