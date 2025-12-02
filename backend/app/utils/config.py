import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://nischay228074_db_user:kL47SVaZkzTCAizY@cluster0.uywfrq9.mongodb.net/?appName=Cluster0")
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS = 7

settings = Settings()

