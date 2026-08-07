"""
Auth Router — profile fetching (Supabase handles all auth/token logic).
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from core.security import verify_token, get_current_user_id, security
from core.supabase_client import get_supabase_admin
from models.user import UserProfile

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me", response_model=UserProfile)
async def get_me(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Return the authenticated user's profile."""
    payload = verify_token(credentials)
    user_id = get_current_user_id(payload)

    supabase = get_supabase_admin()
    resp = (
        supabase.table("profiles")
        .select("*")
        .eq("id", user_id)
        .single()
        .execute()
    )

    if not resp.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    row = resp.data
    return UserProfile(
        id=row["id"],
        email=row["email"],
        full_name=row.get("full_name"),
        avatar_url=row.get("avatar_url"),
        analyses_count=row.get("analyses_count") or 0,
        created_at=row["created_at"],
    )
