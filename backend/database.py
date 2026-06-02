"""
PostgreSQL database connection using Railway's DATABASE_URL
"""
import os
import psycopg2
import psycopg2.extras
import logging

logger = logging.getLogger(__name__)

def get_connection():
    """Get a database connection from DATABASE_URL env var"""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL environment variable is not set")
    return psycopg2.connect(database_url, cursor_factory=psycopg2.extras.RealDictCursor)


def init_db():
    """Create tables if they don't exist"""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id BIGINT PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    profile_pic TEXT DEFAULT '',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS contact_messages (
                    id BIGINT PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    subject TEXT NOT NULL,
                    message TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    status TEXT DEFAULT 'unread'
                )
            """)
        conn.commit()
        logger.info("✅ Database tables ready")
    finally:
        conn.close()