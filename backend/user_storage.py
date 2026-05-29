"""
User storage handler - persists users to JSON file with hashed passwords
"""
import json
import os
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional
import logging
from passlib.context import CryptContext

logger = logging.getLogger(__name__)

# Path to data directory and users file
DATA_DIR = Path(__file__).parent.parent / "data"
USERS_FILE = DATA_DIR / "users.json"

# Password hashing configuration
# Using argon2 as primary for better security and compatibility
pwd_context = CryptContext(
    schemes=["argon2", "bcrypt"],
    deprecated="auto"
)


def ensure_data_directory():
    """Ensure data directory exists"""
    DATA_DIR.mkdir(exist_ok=True)


def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    return pwd_context.verify(plain_password, hashed_password)


def load_users() -> List[Dict[str, Any]]:
    """Load all users from JSON file"""
    ensure_data_directory()
    
    if not USERS_FILE.exists():
        return []
    
    try:
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        logger.error(f"Error loading users: {e}")
        return []


def save_users(users: List[Dict[str, Any]]):
    """Save users to JSON file"""
    ensure_data_directory()
    
    try:
        with open(USERS_FILE, 'w') as f:
            json.dump(users, f, indent=2)
    except IOError as e:
        logger.error(f"Error saving users: {e}")
        raise


def user_exists(email: str) -> bool:
    """Check if a user with given email already exists"""
    users = load_users()
    return any(user["email"].lower() == email.lower() for user in users)


def register_user(name: str, email: str, password: str) -> Dict[str, Any]:
    """Register a new user"""
    if user_exists(email):
        raise ValueError(f"User with email {email} already exists")
    
    users = load_users()
    
    # Generate ID based on timestamp (milliseconds)
    user_id = int(datetime.now().timestamp() * 1000)
    
    new_user = {
        "id": user_id,
        "name": name,
        "email": email,
        "password": hash_password(password),  # Hash the password
        "created_at": datetime.now().isoformat() + "Z",
        "updated_at": datetime.now().isoformat() + "Z"
    }
    
    users.append(new_user)
    save_users(users)
    
    logger.info(f"New user registered: {name} ({email})")
    return {
        "id": new_user["id"],
        "name": new_user["name"],
        "email": new_user["email"],
        "created_at": new_user["created_at"]
    }


def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate a user by email and password"""
    users = load_users()
    
    for user in users:
        if user["email"].lower() == email.lower():
            if verify_password(password, user["password"]):
                logger.info(f"User authenticated: {email}")
                # Return user without password
                return {
                    "id": user["id"],
                    "name": user["name"],
                    "email": user["email"],
                    "created_at": user["created_at"]
                }
            else:
                logger.warning(f"Failed login attempt: {email}")
                return None
    
    logger.warning(f"Login attempt for non-existent user: {email}")
    return None


def get_user(user_id: int) -> Optional[Dict[str, Any]]:
    """Get a specific user by ID (for admin)"""
    users = load_users()
    for user in users:
        if user["id"] == user_id:
            # Return user with password for admin (they need to see it)
            return user
    return None


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get a specific user by email"""
    users = load_users()
    for user in users:
        if user["email"].lower() == email.lower():
            return user
    return None


def get_all_users() -> List[Dict[str, Any]]:
    """Get all users (for admin dashboard)"""
    return load_users()


def delete_user(user_id: int) -> bool:
    """Delete a user by ID (admin function)"""
    users = load_users()
    original_count = len(users)
    users = [user for user in users if user["id"] != user_id]
    
    if len(users) < original_count:
        save_users(users)
        logger.info(f"User {user_id} deleted")
        return True
    
    return False


def update_user(user_id: int, name: Optional[str] = None, email: Optional[str] = None, password: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Update user information (admin function)"""
    users = load_users()
    
    for user in users:
        if user["id"] == user_id:
            if name:
                user["name"] = name
            if email:
                user["email"] = email
            if password:
                user["password"] = hash_password(password)
            
            user["updated_at"] = datetime.now().isoformat() + "Z"
            save_users(users)
            logger.info(f"User {user_id} updated")
            return user
    
    return None


def get_user_count() -> int:
    """Get total number of registered users"""
    users = load_users()
    return len(users)
