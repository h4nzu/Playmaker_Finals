"""
User storage handler - PostgreSQL version
"""
import os
from datetime import datetime
from typing import List, Dict, Any, Optional
import logging
from passlib.context import CryptContext
from database import get_connection

logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    # bcrypt silently truncates at 72 bytes; enforce it explicitly
    truncated = password.encode("utf-8")[:72].decode("utf-8", errors="ignore")
    return pwd_context.hash(truncated)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    truncated = plain_password.encode("utf-8")[:72].decode("utf-8", errors="ignore")
    return pwd_context.verify(truncated, hashed_password)


def user_exists(email: str) -> bool:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM users WHERE LOWER(email) = LOWER(%s)", (email,))
            return cur.fetchone() is not None
    finally:
        conn.close()


def register_user(name: str, email: str, password: str) -> Dict[str, Any]:
    if user_exists(email):
        raise ValueError(f"User with email {email} already exists")

    user_id = int(datetime.now().timestamp() * 1000)
    now = datetime.now().isoformat() + "Z"

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO users (id, name, email, password, profile_pic, created_at, updated_at)
                   VALUES (%s, %s, %s, %s, '', %s, %s)""",
                (user_id, name, email, hash_password(password), now, now)
            )
        conn.commit()
        logger.info(f"New user registered: {name} ({email})")
        return {"id": user_id, "name": name, "email": email, "created_at": now}
    finally:
        conn.close()


def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(%s)", (email,))
            user = cur.fetchone()
        if not user:
            logger.warning(f"Login attempt for non-existent user: {email}")
            return None
        if not verify_password(password, user["password"]):
            logger.warning(f"Failed login attempt: {email}")
            return None
        logger.info(f"User authenticated: {email}")
        return {"id": user["id"], "name": user["name"], "email": user["email"], "created_at": user["created_at"]}
    finally:
        conn.close()


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, name, email, profile_pic, created_at, updated_at FROM users WHERE LOWER(email) = LOWER(%s)", (email,))
            return cur.fetchone()
    finally:
        conn.close()


def get_all_users() -> List[Dict[str, Any]]:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, name, email, profile_pic, created_at, updated_at FROM users")
            return cur.fetchall()
    finally:
        conn.close()


def delete_user(user_id: int) -> bool:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
            deleted = cur.rowcount > 0
        conn.commit()
        return deleted
    finally:
        conn.close()


def update_user_name(email: str, new_name: str) -> Dict[str, Any]:
    now = datetime.now().isoformat() + "Z"
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE users SET name = %s, updated_at = %s WHERE LOWER(email) = LOWER(%s) RETURNING id, name, email, created_at",
                (new_name, now, email)
            )
            user = cur.fetchone()
        conn.commit()
        if not user:
            raise ValueError(f"User not found: {email}")
        return dict(user)
    finally:
        conn.close()


def update_user_password(email: str, new_password: str) -> Dict[str, Any]:
    now = datetime.now().isoformat() + "Z"
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE users SET password = %s, updated_at = %s WHERE LOWER(email) = LOWER(%s) RETURNING id, name, email, created_at",
                (hash_password(new_password), now, email)
            )
            user = cur.fetchone()
        conn.commit()
        if not user:
            raise ValueError(f"User not found: {email}")
        return dict(user)
    finally:
        conn.close()


def update_user_profile_pic(email: str, profile_pic_url: str) -> Dict[str, Any]:
    now = datetime.now().isoformat() + "Z"
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE users SET profile_pic = %s, updated_at = %s WHERE LOWER(email) = LOWER(%s) RETURNING id, name, email, profile_pic, created_at",
                (profile_pic_url, now, email)
            )
            user = cur.fetchone()
        conn.commit()
        if not user:
            raise ValueError(f"User not found: {email}")
        return dict(user)
    finally:
        conn.close()


def get_user_count() -> int:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) as count FROM users")
            return cur.fetchone()["count"]
    finally:
        conn.close()