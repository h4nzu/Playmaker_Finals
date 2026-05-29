"""
Contact routes for handling contact form submissions
"""
from fastapi import APIRouter, HTTPException, status
import logging
from models import ContactMessageRequest, ContactMessage, ContactMessageList
import contact_storage

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/contact", tags=["contact"])


@router.post("", response_model=ContactMessage, status_code=status.HTTP_201_CREATED)
async def submit_contact_message(message_data: ContactMessageRequest):
    """
    Submit a new contact message
    
    - **name**: Sender's name
    - **email**: Sender's email address
    - **subject**: Message subject
    - **message**: Message content
    """
    try:
        # Add message to storage
        new_message = contact_storage.add_message(
            name=message_data.name,
            email=message_data.email,
            subject=message_data.subject,
            message=message_data.message
        )
        
        logger.info(f"Contact message received from {message_data.name}")
        return new_message
    except Exception as e:
        logger.error(f"Error submitting contact message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit message. Please try again later."
        )


@router.get("/messages", response_model=ContactMessageList)
async def get_all_messages():
    """
    Get all contact messages (Admin only in production)
    """
    try:
        messages = contact_storage.get_all_messages()
        return {
            "data": messages,
            "total": len(messages)
        }
    except Exception as e:
        logger.error(f"Error fetching messages: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch messages"
        )


@router.get("/messages/{message_id}", response_model=ContactMessage)
async def get_message(message_id: int):
    """
    Get a specific contact message by ID
    """
    try:
        message = contact_storage.get_message(message_id)
        if not message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )
        return message
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch message"
        )


@router.patch("/messages/{message_id}/read", response_model=ContactMessage)
async def mark_as_read(message_id: int):
    """
    Mark a message as read
    """
    try:
        message = contact_storage.update_message_status(message_id, "read")
        if not message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )
        return message
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update message"
        )


@router.delete("/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(message_id: int):
    """
    Delete a contact message
    """
    try:
        success = contact_storage.delete_message(message_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )
        logger.info(f"Message {message_id} deleted")
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete message"
        )
