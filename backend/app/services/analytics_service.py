from datetime import datetime
from app.utils.db import get_database
from collections import defaultdict

async def get_monthly_analytics():
    """
    Returns spending totals grouped by month (YYYY-MM).
    """
    db = await get_database()
    receipts_collection = db.receipts
    
    cursor = receipts_collection.find({})
    receipts = await cursor.to_list(length=None)
    
    monthly_totals = defaultdict(float)
    
    for receipt in receipts:
        total = receipt.get("total")
        created_at = receipt.get("created_at")
        
        if total and created_at:
            # Format as YYYY-MM
            month_key = created_at.strftime("%Y-%m")
            monthly_totals[month_key] += total

    result = [
        {"month": month, "total": total}
        for month, total in sorted(monthly_totals.items(), reverse=True)
    ]
    
    return result

async def get_category_analytics():
    """
    Returns spending totals grouped by category.
    """
    db = await get_database()
    receipts_collection = db.receipts
    
    cursor = receipts_collection.find({})
    receipts = await cursor.to_list(length=None)
    
    category_totals = defaultdict(float)
    
    for receipt in receipts:
        total = receipt.get("total")
        category = receipt.get("category")
        
        if total:
            cat = category if category else "uncategorized"
            category_totals[cat] += total
    
    result = [
        {"category": category, "total": total}
        for category, total in sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
    ]
    
    return result
