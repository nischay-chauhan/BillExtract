from fastapi import APIRouter, Depends, HTTPException
from app.services.analytics_service import get_monthly_analytics, get_category_analytics
from app.utils.auth import get_current_user
from app.models.user import TokenData
from app.services.auth_service import get_user_by_email

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
    responses={404: {"description": "Not found"}},
)

@router.get("/monthly")
async def monthly_analytics(token_data: TokenData = Depends(get_current_user)):
    """
    Get spending totals grouped by month (YYYY-MM) for the authenticated user.
    Returns list sorted by month (newest first).
    """
    user = await get_user_by_email(token_data.email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    result = await get_monthly_analytics(user.id)
    return {"data": result}

@router.get("/category")
async def category_analytics(token_data: TokenData = Depends(get_current_user)):
    """
    Get spending totals grouped by category for the authenticated user.
    Returns list sorted by total (highest first).
    """
    user = await get_user_by_email(token_data.email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    result = await get_category_analytics(user.id)
    return {"data": result}

@router.get("/spending_by_category")
async def spending_by_category(
    start_date: str = None,
    end_date: str = None,
    token_data: TokenData = Depends(get_current_user)
):
    """
    Get spending totals grouped by category with optional date range filtering.
    
    Query params:
        start_date: Optional start date (YYYY-MM-DD)
        end_date: Optional end date (YYYY-MM-DD)
    
    Returns list sorted by total (highest first).
    """
    user = await get_user_by_email(token_data.email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    from app.services.analytics_service import get_spending_by_category
    result = await get_spending_by_category(user.id, start_date, end_date)
    return {"data": result}
