"""
Cryptography & Network Security module.
Handles password hashing (bcrypt), JWT token management, and route protection.
"""

import bcrypt
import jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, Header

SECRET_KEY = "smart-healthcare-dL-rL-cNs-2024-secure-key"
ALGORITHM = "HS256"
TOKEN_EXPIRY_HOURS = 24


def hash_password(password: str) -> str:
    """Hash a password using bcrypt with auto-generated salt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its bcrypt hash."""
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def create_token(data: dict) -> str:
    """Create a JWT token with expiration."""
    payload = {
        **data,
        "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXPIRY_HOURS),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token."""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")


async def get_current_user(authorization: str = Header(None)) -> dict:
    """FastAPI dependency to extract and validate the current user from JWT."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated. Please provide a valid token.")
    token = authorization.split(" ")[1]
    return decode_token(token)
