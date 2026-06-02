"""
Contact message storage handler - PostgreSQL version
"""
from datetime import datetime
from typing import List, Dict, Any, Optional
import logging
from database import get_connection

logger = logging.getLogger(__name__)


def add_message(name: str, email: str, subject: str, message: str) -> Dict[str, Any]:
    message_id = int(datetime.now().timestamp() * 1000)
    timestamp = datetime.now().isoformat() + "Z"

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO contact_messages (id, name, email, subject, message, timestamp, status)
                   VALUES (%s, %s, %s, %s, %s, %s, 'unread')""",
                (message_id, name, email, subject, message, timestamp)
            )
        conn.commit()
        logger.info(f"New contact message from {name} ({email})")
        return {"id": message_id, "name": name, "email": email, "subject": subject,
                "message": message, "timestamp": timestamp, "status": "unread"}
    finally:
        conn.close()


def get_all_messages() -> List[Dict[str, Any]]:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM contact_messages ORDER BY timestamp DESC")
            return cur.fetchall()
    finally:
        conn.close()


def get_message(message_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM contact_messages WHERE id = %s", (message_id,))
            return cur.fetchone()
    finally:
        conn.close()


def update_message_status(message_id: int, status: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE contact_messages SET status = %s WHERE id = %s RETURNING *",
                (status, message_id)
            )
            msg = cur.fetchone()
        conn.commit()
        return dict(msg) if msg else None
    finally:
        conn.close()


def delete_message(message_id: int) -> bool:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM contact_messages WHERE id = %s", (message_id,))
            deleted = cur.rowcount > 0
        conn.commit()
        return deleted
    finally:
        conn.close()


def get_unread_count() -> int:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) as count FROM contact_messages WHERE status = 'unread'")
            return cur.fetchone()["count"]
    finally:
        conn.close()