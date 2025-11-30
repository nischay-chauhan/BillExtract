from motor.motor_asyncio import AsyncIOMotorClient
from app.utils.config import settings

class Database:
    client: AsyncIOMotorClient = None

db = Database()

async def get_database():
    if db.client is None:
        db.client = AsyncIOMotorClient(settings.MONGO_URI)
    return db.client.get_database()

async def close_mongo_connection():
    if db.client:
        db.client.close()
