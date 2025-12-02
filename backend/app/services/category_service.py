from typing import List, Dict
from app.models.receipt import ReceiptCategory

class CategoryService:
    """Service for automatically assigning categories to receipts based on extracted data."""
    
    CATEGORY_KEYWORDS: Dict[ReceiptCategory, List[str]] = {
        ReceiptCategory.GROCERY: [
            "grocery", "supermarket", "mart", "store", "provisions",
            "reliance", "dmart", "big bazaar", "more", "star bazaar",
            "vegetables", "fruits", "dairy", "milk"
        ],
        ReceiptCategory.RESTAURANT: [
            "restaurant", "cafe", "coffee", "dine", "kitchen", "hotel",
            "mcdonald", "kfc", "subway", "pizza", "domino", "starbucks",
            "food", "meal", "breakfast", "lunch", "dinner"
        ],
        ReceiptCategory.PETROL: [
            "petrol", "diesel", "fuel", "gas", "bharat petroleum", "bp",
            "indian oil", "hp", "shell", "essar", "reliance petroleum"
        ],
        ReceiptCategory.PHARMACY: [
            "pharmacy", "medical", "chemist", "drugstore", "apollo",
            "medicine", "tablet", "capsule", "syrup", "ointment"
        ],
        ReceiptCategory.ELECTRONICS: [
            "electronics", "mobile", "laptop", "computer", "croma",
            "reliance digital", "vijay sales", "samsung", "apple",
            "tv", "phone", "tablet", "gadget", "charger"
        ],
        ReceiptCategory.FOOD_DELIVERY: [
            "swiggy", "zomato", "uber eats", "food delivery", "dunzo",
            "delivery", "online food"
        ],
        ReceiptCategory.PARKING: [
            "parking", "park", "valet"
        ],
        ReceiptCategory.TOLL: [
            "toll", "fastag", "highway"
        ]
    }
    
    @classmethod
    def assign_category(cls, receipt_data: dict) -> str:
        """
        Automatically assign a category based on receipt data.
        
        Args:
            receipt_data: Dictionary containing store_name, items, and other receipt details
            
        Returns:
            Category string (one of ReceiptCategory enum values)
        """
        store_name = (receipt_data.get("store_name") or "").lower()
        
        items_text = ""
        items = receipt_data.get("items", [])
        if items:
            items_text = " ".join([
                item.get("name", "").lower() 
                for item in items 
                if isinstance(item, dict) and item.get("name")
            ])
        
        searchable_text = f"{store_name} {items_text}"
        
        for category, keywords in cls.CATEGORY_KEYWORDS.items():
            for keyword in keywords:
                if keyword in searchable_text:
                    return category.value
        
        return ReceiptCategory.GENERAL.value
    
    @classmethod
    def validate_category(cls, category: str) -> bool:
        """
        Validate if a category string is valid.
        
        Args:
            category: Category string to validate
            
        Returns:
            True if valid, False otherwise
        """
        try:
            ReceiptCategory(category)
            return True
        except ValueError:
            return False
    
    @classmethod
    def get_all_categories(cls) -> List[str]:
        """Get list of all valid categories."""
        return [cat.value for cat in ReceiptCategory]
