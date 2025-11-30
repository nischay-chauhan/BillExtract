from fastapi import APIRouter, UploadFile, File, HTTPException
from app.utils.preprocess import preprocess_image
from app.services.ocr import extract_text
from app.services.gemini_service import extract_receipt_data
from app.utils.confidence import calculate_confidence

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
    
    try:
        processed_image = preprocess_image(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image preprocessing failed: {str(e)}")
    
    try:
        raw_text = extract_text(processed_image)
    except Exception as e:
        raw_text = ""
    
    try:
        receipt_data = extract_receipt_data(processed_image, raw_text)
    except Exception as e:
        print(f"Gemini extraction failed: {e}")
        receipt_data = {}
    
    confidence_score, confidence_status = calculate_confidence(receipt_data, raw_text)
    
    return {
        "message": "file received and processed", 
        "filename": file.filename, 
        "original_size": len(content), 
        "processed_size": len(processed_image),
        "raw_ocr_text": raw_text,
        "receipt_data": receipt_data,
        "confidence": {
            "score": confidence_score,
            "status": confidence_status
        }
    }
