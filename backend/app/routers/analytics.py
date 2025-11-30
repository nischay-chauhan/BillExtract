from fastapi import APIRouter
from app.services.analytics_service import get_monthly_analytics, get_category_analytics

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
    responses={404: {"description": "Not found"}},
)

@router.get("/monthly")
async def monthly_analytics():
    """
    Get spending totals grouped by month (YYYY-MM).
    Returns list sorted by month (newest first).
    """
    result = await get_monthly_analytics()
    return {"data": result}

@router.get("/category")
async def category_analytics():
    """
    Get spending totals grouped by category.
    Returns list sorted by total (highest first).
    """
    result = await get_category_analytics()
    return {"data": result}
