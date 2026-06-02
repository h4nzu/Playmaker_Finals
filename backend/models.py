"""
Pydantic models for data validation and serialization
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr


class Team(BaseModel):
    """Team data model"""
    id: int
    abbreviation: str
    full_name: str
    city: str
    conference: str = "Unknown"
    division: str = "Unknown"
    logo_url: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "abbreviation": "ATL",
                "full_name": "Atlanta Hawks",
                "city": "Atlanta",
                "conference": "East",
                "division": "Southeast",
                "logo_url": "https://cdn.nba.com/logos/nba/1610612737/primary/L/logo.svg"
            }
        }


class Competitor(BaseModel):
    """Competitor in a game (team with score)"""
    team: Team
    score: int


class Game(BaseModel):
    """Game data model"""
    id: str
    date: str
    status: str
    home_team: Team
    visitor_team: Team
    home_team_score: Optional[int] = None
    visitor_team_score: Optional[int] = None
    venue: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "401547123",
                "date": "2025-05-12T19:00Z",
                "status": "Final",
                "home_team": {
                    "id": 1,
                    "abbreviation": "ATL",
                    "full_name": "Atlanta Hawks",
                    "city": "Atlanta",
                    "conference": "East",
                    "division": "Southeast"
                },
                "visitor_team": {
                    "id": 2,
                    "abbreviation": "BOS",
                    "full_name": "Boston Celtics",
                    "city": "Boston",
                    "conference": "East",
                    "division": "Atlantic"
                },
                "home_team_score": 115,
                "visitor_team_score": 110
            }
        }


class Player(BaseModel):
    """Player data model"""
    id: str
    first_name: str
    last_name: str
    position: str
    team: Team
    height: Optional[str] = None
    weight: Optional[int] = None
    jersey_number: Optional[str] = None
    college: Optional[str] = None
    country: Optional[str] = None
    draft_year: Optional[str] = None
    draft_round: Optional[str] = None
    draft_number: Optional[str] = None
    image_url: Optional[str] = None
    stats: Optional[Dict[str, Any]] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "203999",
                "first_name": "Nikola",
                "last_name": "Jokic",
                "position": "C",
                "team": {
                    "id": 8,
                    "abbreviation": "DEN",
                    "full_name": "Denver Nuggets",
                    "city": "Denver",
                    "conference": "West",
                    "division": "Northwest"
                },
                "height": "6-11",
                "weight": 284,
                "image_url": None
            }
        }


class GameList(BaseModel):
    """List of games response"""
    data: List[Game]
    total: int = 0
    

class TeamList(BaseModel):
    """List of teams response"""
    data: List[Team]
    total: int = 0


class PlayerList(BaseModel):
    """Paginated player list response"""
    data: List[Player]
    total: int = 0
    next_cursor: Optional[str] = None
    

class HealthResponse(BaseModel):
    """Health check response with cache stats"""
    status: str = "healthy"
    cache_stats: Dict[str, Any]
    api_sources: List[str] = ["nba_api", "espn"]
    

class ErrorResponse(BaseModel):
    """Error response"""
    error: str
    fallback_data: Optional[Any] = None
    offline_mode: bool = False


# Contact Message Models
class ContactMessageRequest(BaseModel):
    """Contact message request model"""
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    subject: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1, max_length=5000)
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "subject": "Website Inquiry",
                "message": "I have a question about the platform..."
            }
        }


class ContactMessage(BaseModel):
    """Contact message model"""
    id: int
    name: str
    email: str
    subject: str
    message: str
    timestamp: str
    status: str = "unread"  # unread or read
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1779996815182,
                "name": "John Doe",
                "email": "john@example.com",
                "subject": "Website Inquiry",
                "message": "I have a question about the platform...",
                "timestamp": "2026-05-28T19:33:35.182Z",
                "status": "read"
            }
        }


class ContactMessageList(BaseModel):
    """List of contact messages response"""
    data: List[ContactMessage]
    total: int = 0


# User Models
class UserRegisterRequest(BaseModel):
    """User registration request model"""

    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=6)

    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "password": "securepassword123"
            }
        }


class UserLoginRequest(BaseModel):
    """User login request model"""

    email: EmailStr
    password: str = Field(..., min_length=1)

    class Config:
        json_schema_extra = {
            "example": {
                "email": "john@example.com",
                "password": "securepassword123"
            }
        }


class UserResponse(BaseModel):
    """User response model (without password)"""

    id: int
    name: str
    email: str
    created_at: str
    profile_pic: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1234567890,
                "name": "John Doe",
                "email": "john@example.com",
                "created_at": "2026-05-28T19:33:35.182Z",
                "profile_pic": "https://example.com/avatar.jpg"
            }
        }


class User(BaseModel):
    """User model for admin"""

    id: int
    name: str
    email: str
    password: Optional[str] = None
    profile_pic: Optional[str] = None
    created_at: str
    updated_at: str

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1234567890,
                "name": "John Doe",
                "email": "john@example.com",
                "password": "$2b$12$...",
                "created_at": "2026-05-28T19:33:35.182Z",
                "updated_at": "2026-05-28T19:33:35.182Z"
            }
        }


class UserList(BaseModel):
    """List of users response"""

    data: List[User]
    total: int = 0