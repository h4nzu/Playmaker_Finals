"""
Contact message storage handler - persists messages to JSON file
"""
import json
import os
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

# Path to data directory and contact messages file
DATA_DIR = Path(__file__).parent.parent / "data"
CONTACT_MESSAGES_FILE = DATA_DIR / "contact_messages.json"


def ensure_data_directory():
    """Ensure data directory exists"""
    DATA_DIR.mkdir(exist_ok=True)


def load_messages() -> List[Dict[str, Any]]:
    """Load all contact messages from JSON file"""
    ensure_data_directory()
    
    if not CONTACT_MESSAGES_FILE.exists():
        return []
    
    try:
        with open(CONTACT_MESSAGES_FILE, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        logger.error(f"Error loading messages: {e}")
        return []


def save_messages(messages: List[Dict[str, Any]]):
    """Save contact messages to JSON file"""
    ensure_data_directory()
    
    try:
        with open(CONTACT_MESSAGES_FILE, 'w') as f:
            json.dump(messages, f, indent=2)
    except IOError as e:
        logger.error(f"Error saving messages: {e}")
        raise


def add_message(name: str, email: str, subject: str, message: str) -> Dict[str, Any]:
    """Add a new contact message"""
    messages = load_messages()
    
    # Generate ID based on timestamp (milliseconds)
    message_id = int(datetime.now().timestamp() * 1000)
    
    new_message = {
        "id": message_id,
        "name": name,
        "email": email,
        "subject": subject,
        "message": message,
        "timestamp": datetime.now().isoformat() + "Z",
        "status": "unread"
    }
    
    messages.append(new_message)
    save_messages(messages)
    
    logger.info(f"New contact message received from {name} ({email})")
    return new_message


def get_message(message_id: int) -> Dict[str, Any] | None:
    """Get a specific message by ID"""
    messages = load_messages()
    for msg in messages:
        if msg["id"] == message_id:
            return msg
    return None


def update_message_status(message_id: int, status: str) -> Dict[str, Any] | None:
    """Update message status (read/unread)"""
    messages = load_messages()
    
    for msg in messages:
        if msg["id"] == message_id:
            msg["status"] = status
            save_messages(messages)
            logger.info(f"Message {message_id} marked as {status}")
            return msg
    
    return None


def delete_message(message_id: int) -> bool:
    """Delete a message by ID"""
    messages = load_messages()
    original_count = len(messages)
    messages = [msg for msg in messages if msg["id"] != message_id]
    
    if len(messages) < original_count:
        save_messages(messages)
        logger.info(f"Message {message_id} deleted")
        return True
    
    return False


def get_all_messages() -> List[Dict[str, Any]]:
    """Get all messages"""
    return load_messages()


def get_unread_count() -> int:
    """Get count of unread messages"""
    messages = load_messages()
    return sum(1 for msg in messages if msg.get("status") == "unread")
