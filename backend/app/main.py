from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import receipts, analytics

app = FastAPI(title="Receipt Scanner API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development (restrict in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(receipts.router)
app.include_router(analytics.router)

@app.get("/")
def read_root():
    return {"status": "ok"}
