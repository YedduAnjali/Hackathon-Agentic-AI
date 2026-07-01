"""Configuration management for the Agentic AI backend."""
import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Server
    PORT: int = 5000
    HOST: str = "0.0.0.0"
    
    # Hugging Face
    HF_API_KEY: Optional[str] = None
    HF_MODEL: str = "meta-llama/Meta-Llama-3-8B-Instruct"
    HUGGINGFACE_API_KEY: Optional[str] = None  # Alias for HF_API_KEY
    
    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017/agentic_ai"
    
    # n8n
    N8N_WEBHOOK_URL: str = "http://localhost:5678/webhook/agent"
    N8N_WEBHOOK_BASE_URL: Optional[str] = None  # Alias for N8N_WEBHOOK_URL
    
    # Environment
    NODE_ENV: str = "development"
    
    # JWT Authentication
    JWT_SECRET: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 24
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Instantiate settings
settings = Settings()

