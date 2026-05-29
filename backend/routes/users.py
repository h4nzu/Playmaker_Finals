"""
User routes for handling user registration, login, and admin management
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
import logging
from models import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    User,
    UserList
)
import user_storage

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/users", tags=["users"])


class UpdateUsernameRequest:
    def __init__(self, email: str, new_name: str):
        self.email = email
        self.new_name = new_name


class UpdatePasswordRequest:
    def __init__(self, email: str, old_password: str, new_password: str):
        self.email = email
        self.old_password = old_password
        self.new_password = new_password


class UpdateProfilePicRequest:
    def __init__(self, email: str, profile_pic_url: str):
        self.email = email
        self.profile_pic_url = profile_pic_url


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserRegisterRequest):
    """
    Register a new user

    - **name**: User's full name
    - **email**: User's email address (must be unique)
    - **password**: User's password (min 6 characters)
    """

    try:
        # Check if user already exists
        if user_storage.user_exists(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists"
            )

        # Register new user
        new_user = user_storage.register_user(
            name=user_data.name,
            email=user_data.email,
            password=user_data.password
        )

        logger.info(f"User registered: {user_data.email}")

        # Return success response with redirect path
        return JSONResponse(
            status_code=201,
            content={
                "success": True,
                "message": "Account created successfully",
                "redirect": "/login",
                "user": new_user
            }
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )

    except Exception as e:
        logger.error(f"Error registering user: {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user. Please try again later."
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
            detail="Failed to login. Please try again later."
        )


# =========================
# ADMIN ENDPOINTS
# =========================

@router.get("/all", response_model=UserList)
async def get_all_users():
    """
    Get all registered users
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


@router.get("/{email}", response_model=User)
async def get_user(email: str):
    """
    Get a single user by email
    """

    try:
        user = user_storage.get_user_by_email(email)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return user

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Error fetching user: {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user"
        )


@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user(user_id: int):
    """
    Delete a user by ID (admin only)
    """

    try:
        success = user_storage.delete_user(user_id)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        logger.info(f"User {user_id} deleted")

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "User deleted successfully"
            }
        )

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Error deleting user: {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user"
        )


@router.put("/update-username", response_model=UserResponse)
async def update_username(email: str, new_name: str):
    """
    Update user's username/name
    
    - **email**: User's email address
    - **new_name**: New username/name
    """
    
    try:
        user = user_storage.get_user_by_email(email)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        updated_user = user_storage.update_user_name(email, new_name)
        
        logger.info(f"Username updated for: {email}")
        
        return updated_user
        
    except HTTPException:
        raise
        
    except Exception as e:
        logger.error(f"Error updating username: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update username"
        )


@router.put("/update-password", status_code=status.HTTP_200_OK)
async def update_password(email: str, old_password: str, new_password: str):
    """
    Update user's password
    
    - **email**: User's email address
    - **old_password**: Current password (for verification)
    - **new_password**: New password
    """
    
    try:
        # Verify old password
        user = user_storage.authenticate_user(email, old_password)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid current password"
            )
        
        updated_user = user_storage.update_user_password(email, new_password)
        
        logger.info(f"Password updated for: {email}")
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Password updated successfully",
                "user": updated_user
            }
        )
        
    except HTTPException:
        raise
        
    except Exception as e:
        logger.error(f"Error updating password: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password"
        )


@router.put("/update-profile-pic", response_model=UserResponse)
async def update_profile_pic(email: str, profile_pic_url: str):
    """
    Update user's profile picture
    
    - **email**: User's email address
    - **profile_pic_url**: URL to profile picture
    """
    
    try:
        user = user_storage.get_user_by_email(email)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        updated_user = user_storage.update_user_profile_pic(email, profile_pic_url)
        
        logger.info(f"Profile picture updated for: {email}")
        
        return updated_user
        
    except HTTPException:
        raise
        
    except Exception as e:
        logger.error(f"Error updating profile picture: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile picture"
        )
