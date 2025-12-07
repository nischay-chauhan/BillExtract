from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import receipts, analytics, auth, notifications

app = FastAPI(title="Receipt Scanner API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(receipts.router)
app.include_router(analytics.router)
app.include_router(notifications.router)

@app.get("/")
def read_root():
    return {"status": "ok"}

