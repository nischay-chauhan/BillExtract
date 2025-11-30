from datetime import datetime
from app.utils.db import get_database
from app.models.receipt import Receipt
from bson import ObjectId

async def save_receipt(receipt_data: dict, raw_ocr_text: str, confidence_score: float) -> dict:
    """
    Saves a receipt to MongoDB.
    
    Args:
        receipt_data: Extracted receipt data
        raw_ocr_text: Raw OCR text
        confidence_score: Confidence score
        
    Returns:
        dict: Saved receipt with MongoDB ID
    """
    db = await get_database()
    receipts_collection = db.receipts
    
    # Prepare document
    receipt_doc = {
        **receipt_data,
        "raw_ocr_text": raw_ocr_text,
        "confidence": confidence_score,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Insert into MongoDB
    result = await receipts_collection.insert_one(receipt_doc)
    
    # Return the saved document with ID
    receipt_doc["_id"] = str(result.inserted_id)
    
    return receipt_doc

async def get_receipt_by_id(receipt_id: str) -> dict:
    """
    Retrieves a receipt by ID.
    
    Args:
        receipt_id: MongoDB ObjectId as string
        
    Returns:
        dict: Receipt document or None
    """
    db = await get_database()
    receipts_collection = db.receipts
    
    receipt = await receipts_collection.find_one({"_id": ObjectId(receipt_id)})
    
    if receipt:
        receipt["_id"] = str(receipt["_id"])
        
    return receipt

async def get_all_receipts(skip: int = 0, limit: int = 100) -> list:
    """
    Retrieves all receipts with pagination.
    
    Args:
        skip: Number of documents to skip
        limit: Maximum number of documents to return
        
    Returns:
        list: List of receipt documents
    """
    db = await get_database()
    receipts_collection = db.receipts
    
    cursor = receipts_collection.find().skip(skip).limit(limit).sort("created_at", -1)
    receipts = await cursor.to_list(length=limit)
    
    for receipt in receipts:
        receipt["_id"] = str(receipt["_id"])
        
    return receipts

async def delete_receipt(receipt_id: str) -> bool:
    """
    Deletes a receipt by ID.
    
    Args:
        receipt_id: MongoDB ObjectId as string
        
    Returns:
        bool: True if deleted, False otherwise
    """
    db = await get_database()
    receipts_collection = db.receipts
    
    result = await receipts_collection.delete_one({"_id": ObjectId(receipt_id)})
    
    return result.deleted_count > 0
