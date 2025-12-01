from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from app.services.gemini_service import extract_receipt_data
from app.services.receipts_service import save_receipt, get_receipt_by_id, get_all_receipts, update_receipt
from pydantic import BaseModel
from typing import Optional, List
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
async def upload_receipt(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    content = await file.read()
    logger.info(f"Received image upload: {file.filename}, size: {len(content)} bytes")
    
    # Direct Gemini extraction
    try:
        receipt_data = extract_receipt_data(content)
        logger.info(f"Gemini extraction completed: store={receipt_data.get('store_name')}, total={receipt_data.get('total')}")
    except Exception as e:
        logger.error(f"Gemini extraction failed: {str(e)}")
        receipt_data = {}
    
    # Save to MongoDB
    # Passing empty string for OCR text and 0.0 for confidence as we removed those steps
    try:
        saved_receipt = await save_receipt(receipt_data, "", 0.0)
        receipt_id = saved_receipt.get("_id")
        logger.info(f"Receipt saved to MongoDB with ID: {receipt_id}")
    except Exception as e:
        logger.error(f"MongoDB save failed: {str(e)}")
        receipt_id = None
    
    # Return structured JSON
    return {
        "extracted": receipt_data,
        "confidence": 0.0,
        "status": "processed",
        "receipt_id": receipt_id
    }

@router.get("/receipt/{id}")
async def get_receipt(id: str):
    """
    Fetch a single receipt by ID.
    """
    logger.info(f"Fetching receipt with ID: {id}")
    receipt = await get_receipt_by_id(id)
    
    if not receipt:
        logger.warning(f"Receipt not found: {id}")
        raise HTTPException(status_code=404, detail="Receipt not found")
    
    logger.info(f"Receipt retrieved successfully: {id}")
    return receipt

@router.get("/receipts")
async def get_receipts(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page")
):
    """
    Fetch paginated list of receipts.
    """
    logger.info(f"Fetching receipts: page={page}, limit={limit}")
    skip = (page - 1) * limit
    receipts = await get_all_receipts(skip=skip, limit=limit)
    
    logger.info(f"Retrieved {len(receipts)} receipts")
    return {
        "page": page,
        "limit": limit,
        "receipts": receipts,
        "count": len(receipts)
    }

@router.put("/receipt/{id}")
async def update_receipt_endpoint(id: str, request: UpdateReceiptRequest):
    """
    Update receipt data by ID.
    """
    logger.info(f"Updating receipt: {id}")
    
    # Convert Pydantic model to dict, excluding None values
    update_data = request.dict(exclude_none=True)
    
    # Convert items to dict format if present
    if "items" in update_data:
        update_data["items"] = [item.dict() for item in request.items]
    
    logger.info(f"Received update request for {id}: {request.dict()}")
    logger.info(f"Processed update data: {update_data}")
    
    try:
        updated_receipt = await update_receipt(id, update_data)
        
        if not updated_receipt:
            logger.warning(f"Receipt not found: {id}")
            raise HTTPException(status_code=404, detail="Receipt not found")
        
        logger.info(f"Receipt updated successfully: {id}")
        return updated_receipt
    except Exception as e:
        logger.error(f"Failed to update receipt: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update receipt: {str(e)}")
