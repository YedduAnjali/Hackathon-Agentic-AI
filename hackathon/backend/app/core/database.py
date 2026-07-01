"""MongoDB database connection and management."""
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    """MongoDB database connection manager."""
    
    client: AsyncIOMotorClient = None
    database = None
    
    @classmethod
    async def connect(cls):
        """Connect to MongoDB."""
        if cls.client is None:
            try:
                cls.client = AsyncIOMotorClient(settings.MONGODB_URI)
                # Test connection
                await cls.client.admin.command('ping')
                # Get database name from URI or use default
                db_name = settings.MONGODB_URI.split('/')[-1].split('?')[0]
                cls.database = cls.client[db_name]
                logger.info("✅ MongoDB connected for memory storage")
            except ConnectionFailure as e:
                logger.error(f"❌ MongoDB connection error: {e}")
                raise
    
    @classmethod
    async def disconnect(cls):
        """Disconnect from MongoDB."""
        if cls.client:
            cls.client.close()
            cls.client = None
            cls.database = None
            logger.info("MongoDB disconnected")
    
    @classmethod
    def get_database(cls):
        """Get the database instance."""
        if cls.database is None:
            raise RuntimeError("Database not connected. Call Database.connect() first.")
        return cls.database


# Initialize database connection
async def init_db():
    """Initialize database connection."""
    await Database.connect()


async def close_db():
    """Close database connection."""
    await Database.disconnect()
