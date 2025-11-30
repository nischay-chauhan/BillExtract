from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter(
    prefix="/receipts",
    tags=["receipts"],
    responses={404: {"description": "Not found"}},
)

@router.post("/upload_receipt")
async def upload_receipt(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    return {"message": "file received", "filename": file.filename}
