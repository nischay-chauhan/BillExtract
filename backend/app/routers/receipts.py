from fastapi import APIRouter, UploadFile, File, HTTPException
from app.utils.preprocess import preprocess_image
from app.services.ocr import extract_text
from app.services.gemini_service import extract_receipt_data
from app.utils.confidence import calculate_confidence
from app.services.receipts_service import save_receipt

router = APIRouter(
    prefix="/receipts",
    tags=["receipts"],
    responses={404: {"description": "Not found"}},
)

@router.post("/upload_receipt")
async def upload_receipt(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    content = await file.read()
    
    # Step 1: Preprocess
    try:
        processed_image = preprocess_image(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image preprocessing failed: {str(e)}")
    
    # Step 2: OCR
    try:
        raw_text = extract_text(processed_image)
    except Exception as e:
        raw_text = ""
    
    # Step 3: Gemini extraction
    try:
        receipt_data = extract_receipt_data(processed_image, raw_text)
    except Exception as e:
        print(f"Gemini extraction failed: {e}")
        receipt_data = {}
    
    # Step 4: Confidence scoring
    confidence_score, confidence_status = calculate_confidence(receipt_data, raw_text)
    
    # Step 5: Save to MongoDB
    try:
        saved_receipt = await save_receipt(receipt_data, raw_text, confidence_score)
        receipt_id = saved_receipt.get("_id")
    except Exception as e:
        print(f"MongoDB save failed: {e}")
        receipt_id = None
    
    # Return combined structured JSON
    return {
        "extracted": receipt_data,
        "confidence": confidence_score,
        "status": confidence_status,
        "receipt_id": receipt_id
    }
