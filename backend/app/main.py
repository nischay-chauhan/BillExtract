from fastapi import FastAPI

app = FastAPI(title="Receipt Scanner API")

@app.get("/")
def read_root():
    return {"status": "ok"}
