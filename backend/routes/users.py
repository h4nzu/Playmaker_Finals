"""
User routes for handling registration, login, and admin management
"""
from fastapi import APIRouter, HTTPException, status
import logging
from models import UserRegisterRequest, UserLoginRequest, UserResponse, UserList
import user_storage

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserRegisterRequest):
    """
    Register a new user
    
    - **name**: User's full name
    - **email**: User's email address (must be unique)
    - **password**: User's password (min 6 characters)
    """
    try:
        new_user = user_storage.register_user(
            name=user_data.name,
            email=user_data.email,
            password=user_data.password
        )
        
        logger.info(f"User registered: {user_data.email}")
        return new_user
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error registering user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user"
        )


@router.post("/login", response_model=UserResponse)
async def login_user(user_data: UserLoginRequest):
    """
    Login a user
    
    - **email**: User's email address
    - **password**: User's password
    """
    try:
        user = user_storage.authenticate_user(
            email=user_data.email,
            password=user_data.password
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        logger.info(f"User logged in: {user_data.email}")
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error logging in user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to login"
        )


@router.get("/list", response_model=UserList)
async def get_all_users():
    """
    Get all registered users (Admin only)
    """
    try:
        users = user_storage.get_all_users()
        return {
            "data": users,
            "total": len(users)
        }
    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch users"
        )
