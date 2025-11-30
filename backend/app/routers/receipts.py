from fastapi import APIRouter, UploadFile, File, HTTPException
from app.utils.preprocess import preprocess_image

router = APIRouter(
    prefix="/receipts",
    tags=["receipts"],
    responses={404: {"description": "Not found"}},
)

@router.post("/upload_receipt")
async def upload_receipt(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Read file content
    content = await file.read()
    
    # Preprocess image
    try:
        processed_image = preprocess_image(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image preprocessing failed: {str(e)}")
    
    return {"message": "file received and preprocessed", "filename": file.filename, "original_size": len(content), "processed_size": len(processed_image)}
