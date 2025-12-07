from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Depends
from app.services.gemini_service import extract_receipt_data
from app.services.receipts_service import save_receipt, get_receipt_by_id, get_all_receipts, update_receipt, delete_receipt
from app.services.category_service import CategoryService
from pydantic import BaseModel
from typing import Optional, List
from app.utils.auth import get_current_user
from app.models.user import TokenData
from app.services.auth_service import get_user_by_email
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/receipts",
    tags=["receipts"],
    responses={404: {"description": "Not found"}},
)

# Pydantic models for request validation
class ReceiptItem(BaseModel):
    name: str
    quantity: float
    price: float

class UpdateReceiptRequest(BaseModel):
    store_name: Optional[str] = None
    date: Optional[str] = None
    total: Optional[float] = None
    items: Optional[List[ReceiptItem]] = None
    payment_method: Optional[str] = None
    category: Optional[str] = None


@router.post("/upload_receipt")
async def upload_receipt(
    file: UploadFile = File(...),
    token_data: TokenData = Depends(get_current_user)
):
    """Upload and extract receipt data. Requires authentication."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Get user from token
    user = await get_user_by_email(token_data.email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    content = await file.read()
    logger.info(f"Received image upload from user {user.email}: {file.filename}, size: {len(content)} bytes")
    
    # Direct Gemini extraction
    try:
        receipt_data = extract_receipt_data(content)
        logger.info(f"Gemini extraction completed: store={receipt_data.get('store_name')}, total={receipt_data.get('total')}")
    except Exception as e:
        logger.error(f"Gemini extraction failed: {str(e)}")
        receipt_data = {}
    
    if receipt_data:
        gemini_category = receipt_data.get('category')
        
        if gemini_category and CategoryService.validate_category(gemini_category):
            logger.info(f"Gemini assigned category: {gemini_category}")
        else:
            category = CategoryService.assign_category(receipt_data)
            receipt_data['category'] = category
            logger.info(f"Auto-assigned category (fallback): {category}")

        if not receipt_data.get('date'):
            from datetime import datetime
            current_date = datetime.now().strftime("%Y-%m-%d")
            receipt_data['date'] = current_date
            logger.info(f"Date missing, defaulted to: {current_date}")
    
    try:
        saved_receipt = await save_receipt(receipt_data, "", 0.0, user.id)
        receipt_id = saved_receipt.get("_id")
        logger.info(f"Receipt saved to MongoDB with ID: {receipt_id} for user: {user.email}")
    except Exception as e:
        logger.error(f"MongoDB save failed: {str(e)}")
        receipt_id = None
    
    return {
        "extracted": receipt_data,
        "confidence": 0.0,
        "status": "processed",
        "receipt_id": receipt_id
    }


@router.get("/receipt/{id}")
async def get_receipt(
    id: str,
    token_data: TokenData = Depends(get_current_user)
):
    """
    Fetch a single receipt by ID. Requires authentication.
    """
    user = await get_user_by_email(token_data.email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    logger.info(f"User {user.email} fetching receipt with ID: {id}")
    receipt = await get_receipt_by_id(id, user.id)
    
    if not receipt:
        logger.warning(f"Receipt not found or access denied: {id} for user {user.email}")
        raise HTTPException(status_code=404, detail="Receipt not found")
    
    logger.info(f"Receipt retrieved successfully: {id}")
    return receipt

@router.get("/receipts")
async def get_receipts(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    token_data: TokenData = Depends(get_current_user)
):
    """
    Fetch paginated list of receipts for the authenticated user.
    """
    user = await get_user_by_email(token_data.email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    logger.info(f"User {user.email} fetching receipts: page={page}, limit={limit}")
    skip = (page - 1) * limit
    receipts = await get_all_receipts(user.id, skip=skip, limit=limit)
    
    logger.info(f"Retrieved {len(receipts)} receipts for user {user.email}")
    return {
        "page": page,
        "limit": limit,
        "receipts": receipts,
        "count": len(receipts)
    }

@router.put("/receipt/{id}")
async def update_receipt_endpoint(
    id: str,
    request: UpdateReceiptRequest,
    token_data: TokenData = Depends(get_current_user)
):
    """
    Update receipt data by ID. Requires authentication.
    """
    user = await get_user_by_email(token_data.email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    logger.info(f"User {user.email} updating receipt: {id}")
    
    update_data = request.dict(exclude_none=True)
    
    if "items" in update_data:
        update_data["items"] = [item.dict() for item in request.items]
    
    logger.info(f"Received update request for {id}: {request.dict()}")
    logger.info(f"Processed update data: {update_data}")
    
    try:
        updated_receipt = await update_receipt(id, update_data, user.id)
        
        if not updated_receipt:
            logger.warning(f"Receipt not found or access denied: {id} for user {user.email}")
            raise HTTPException(status_code=404, detail="Receipt not found")
        
        logger.info(f"Receipt updated successfully: {id}")
        return updated_receipt
    except Exception as e:
        logger.error(f"Failed to update receipt: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update receipt: {str(e)}")

@router.patch("/receipt/{id}/category")
async def update_receipt_category(
    id: str,
    category: str,
    token_data: TokenData = Depends(get_current_user)
):
    """
    Update receipt category by ID. Requires authentication.
    
    Args:
        id: Receipt ID
        category: New category value (must be valid ReceiptCategory)
    """
    user = await get_user_by_email(token_data.email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    if not CategoryService.validate_category(category):
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid category. Must be one of: {CategoryService.get_all_categories()}"
        )
    
    logger.info(f"User {user.email} updating category for receipt {id} to {category}")
    
    try:
        updated_receipt = await update_receipt(id, {"category": category}, user.id)
        
        if not updated_receipt:
            logger.warning(f"Receipt not found or access denied: {id} for user {user.email}")
            raise HTTPException(status_code=404, detail="Receipt not found")
        
        logger.info(f"Category updated successfully: {id}")
        return updated_receipt
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update category: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update category: {str(e)}")


@router.delete("/receipt/{id}")
async def delete_receipt_endpoint(
    id: str,
    token_data: TokenData = Depends(get_current_user)
):
    """
    Delete a receipt by ID. Requires authentication.
    Only the owner of the receipt can delete it.
    """
    user = await get_user_by_email(token_data.email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    logger.info(f"User {user.email} deleting receipt: {id}")
    
    try:
        deleted = await delete_receipt(id, user.id)
        
        if not deleted:
            logger.warning(f"Receipt not found or access denied: {id} for user {user.email}")
            raise HTTPException(status_code=404, detail="Receipt not found")
        
        logger.info(f"Receipt deleted successfully: {id}")
        return {"message": "Receipt deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete receipt: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete receipt: {str(e)}")

