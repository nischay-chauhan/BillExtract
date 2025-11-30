from datetime import datetime
from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, Field

class ReceiptCategory(str, Enum):
    GROCERY = "grocery"
    RESTAURANT = "restaurant"
    PETROL = "petrol"
    PHARMACY = "pharmacy"
    ELECTRONICS = "electronics"
    FOOD_DELIVERY = "food_delivery"
    PARKING = "parking"
    TOLL = "toll"
    GENERAL = "general"

class Item(BaseModel):
    name: Optional[str] = None
    qty: Optional[float] = None
    price: Optional[float] = None

class FuelInfo(BaseModel):
    fuel_type: Optional[str] = None
    quantity_liters: Optional[float] = None
    rate_per_liter: Optional[float] = None
    amount: Optional[float] = None

class Receipt(BaseModel):
    store_name: Optional[str] = None
    address: Optional[str] = None
    date: Optional[str] = None  # Keeping as string for flexibility, can be parsed later
    category: Optional[ReceiptCategory] = None
    subtotal: Optional[float] = None
    tax: Optional[float] = None
    total: Optional[float] = None
    payment_method: Optional[str] = None
    
    items: List[Item] = Field(default_factory=list)
    fuel_info: Optional[FuelInfo] = None
    
    raw_ocr_text: str = ""
    confidence: float = 0.0
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        use_enum_values = True
