from fastapi import FastAPI

from app.routers import receipts

app = FastAPI(title="Receipt Scanner API")

app.include_router(receipts.router)

@app.get("/")
def read_root():
    return {"status": "ok"}
