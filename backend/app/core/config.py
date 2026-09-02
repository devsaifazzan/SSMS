from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://ssms_user:ssms_password@localhost:5432/ssms_db"
    SECRET_KEY: str = "super_secret_key_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
