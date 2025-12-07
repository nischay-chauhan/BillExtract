from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field
from enum import Enum


class Platform(str, Enum):
    EXPO = "expo"
    IOS = "ios"
    ANDROID = "android"


class PushTokenCreate(BaseModel):
    """Request model to register a push token"""
    token: str
    platform: Platform = Platform.EXPO


class PushToken(BaseModel):
    """Push token stored in database"""
    id: str = Field(alias="_id")
    user_id: str
    token: str
    platform: Platform
    created_at: datetime = Field(default_factory=datetime.utcnow)
    active: bool = True

    class Config:
        populate_by_name = True


class NotificationCreate(BaseModel):
    """Request model to create a notification"""
    title: str
    body: str
    data: Optional[Dict[str, Any]] = None


class Notification(BaseModel):
    """Notification stored in database"""
    id: str = Field(alias="_id")
    user_id: str
    title: str
    body: str
    data: Optional[Dict[str, Any]] = None
    sent_at: datetime = Field(default_factory=datetime.utcnow)
    read: bool = False

    class Config:
        populate_by_name = True


class NotificationResponse(BaseModel):
    """Response model for notification"""
    id: str
    title: str
    body: str
    data: Optional[Dict[str, Any]] = None
    sent_at: datetime
    read: bool
