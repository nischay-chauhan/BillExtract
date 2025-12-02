from datetime import datetime
from app.utils.db import get_database
from collections import defaultdict
from typing import Optional

async def get_monthly_analytics(user_id: str):
    """
    Returns spending totals grouped by month (YYYY-MM) for a specific user.
    """
    db = await get_database()
    receipts_collection = db.receipts
    
    cursor = receipts_collection.find({"user_id": user_id})
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


async def get_category_analytics(user_id: str):
    """
    Returns spending totals grouped by category for a specific user.
    """
    db = await get_database()
    receipts_collection = db.receipts
    
    cursor = receipts_collection.find({"user_id": user_id})
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


async def get_spending_by_category(user_id: str, start_date: Optional[str] = None, end_date: Optional[str] = None):
    """
    Returns spending totals grouped by category for a specific user,
    optionally filtered by date range.
    
    Args:
        user_id: User ID to filter receipts
        start_date: Optional start date in ISO format (YYYY-MM-DD)
        end_date: Optional end date in ISO format (YYYY-MM-DD)
    
    Returns:
        List of dicts with category, total, and count
    """
    db = await get_database()
    receipts_collection = db.receipts
    
    # Build query
    query = {"user_id": user_id}
    
    # Add date filtering if provided
    if start_date or end_date:
        date_filter = {}
        if start_date:
            date_filter["$gte"] = datetime.fromisoformat(start_date)
        if end_date:
            # Set end_date to the end of the day (23:59:59) to include all receipts from that day
            end_dt = datetime.fromisoformat(end_date)
            end_dt = end_dt.replace(hour=23, minute=59, second=59, microsecond=999999)
            date_filter["$lte"] = end_dt
        query["created_at"] = date_filter
    
    cursor = receipts_collection.find(query)
    receipts = await cursor.to_list(length=None)
    
    category_data = defaultdict(lambda: {"total": 0.0, "count": 0})
    
    for receipt in receipts:
        total = receipt.get("total", 0)
        category = receipt.get("category") or "general"
        
        if total:
            try:
                if isinstance(total, str):
                    # Remove commas and convert to float
                    total = float(total.replace(',', ''))
                elif not isinstance(total, (int, float)):
                    # Skip if not a number
                    continue
                    
                category_data[category]["total"] += float(total)
                category_data[category]["count"] += 1
            except (ValueError, TypeError):
                # Skip invalid totals
                continue
    
    result = [
        {
            "category": category,
            "total": data["total"],
            "count": data["count"]
        }
        for category, data in sorted(category_data.items(), key=lambda x: x[1]["total"], reverse=True)
    ]
    
    return result

