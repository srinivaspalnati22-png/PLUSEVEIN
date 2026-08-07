from supabase import create_client, Client
from core.config import settings

# Admin client — uses service_role key, never exposed to frontend
_supabase_admin: Client | None = None


def get_supabase_admin() -> Client:
    global _supabase_admin
    if _supabase_admin is None:
        _supabase_admin = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
    return _supabase_admin
