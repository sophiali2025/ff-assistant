import os
from supabase import create_client, Client
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

# Initialize Supabase client (singleton pattern)
supabase: Client = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_KEY"]
)


# Database query helpers

async def get_user_sleeper_id(user_id: str) -> str:
    response = supabase.table("users").select("sleeper_user_id").eq("id", user_id).single().execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")

    return response.data["sleeper_user_id"]


async def get_active_league(user_id: str) -> dict:
    response = supabase.table("leagues").select("*").eq("user_id", user_id).eq("is_active", True).single().execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="No active league found for user")

    return response.data


async def verify_league_ownership(user_id: str, league_id: str) -> dict:
    response = supabase.table("leagues").select("*").eq("user_id", user_id).eq("league_id", league_id).execute()

    if not response.data or len(response.data) == 0:
        raise HTTPException(status_code=403, detail="Access denied to this league")

    return response.data[0]


async def get_user_leagues(user_id: str) -> list[dict]:
    response = supabase.table("leagues").select("*").eq("user_id", user_id).execute()

    return response.data if response.data else []


# Auth helpers

def get_auth_token(authorization: str | None) -> str | None:
    """
    Extract JWT token from Authorization header.

    Args:
        authorization: Value of Authorization header (e.g., "Bearer <token>")

    Returns:
        Token string without "Bearer " prefix, or None if header missing
    """
    if not authorization:
        return None

    # Strip "Bearer " prefix if present
    if authorization.startswith("Bearer "):
        return authorization[7:]

    return authorization


async def verify_token_and_get_user_id(token: str | None) -> str:
    """
    Validate JWT token and extract user ID.

    Args:
        token: JWT token string (without "Bearer " prefix)

    Returns:
        User ID if token is valid

    Raises:
        HTTPException 401 if token is missing or invalid
    """
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        response = supabase.auth.get_user(token)

        if not response.user:
            raise HTTPException(status_code=401, detail="Invalid authentication token")

        return response.user.id
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
