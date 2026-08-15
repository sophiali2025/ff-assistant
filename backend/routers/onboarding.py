from fastapi import APIRouter, Header, HTTPException
from app.schemas import (
    CompleteOnboardingRequest,
    CompleteOnboardingResponse,
    SwitchLeagueRequest,
    SwitchLeagueResponse,
)
from services.supabase import (
    supabase,
    get_auth_token,
    verify_token_and_get_user_id,
)

router = APIRouter()


@router.post("/complete", response_model=CompleteOnboardingResponse)
async def complete_onboarding(
    request: CompleteOnboardingRequest,
    authorization: str = Header(None),
):
    """
    Complete onboarding for a new user.

    Creates user record and initial league record in the database.
    Requires authentication token in Authorization header.
    """
    # Validate auth token and get user ID
    token = get_auth_token(authorization)
    user_id = await verify_token_and_get_user_id(token)

    try:
        # Insert into users table
        user_response = supabase.table("users").insert({
            "id": user_id,
            "sleeper_username": request.sleeper_username,
            "sleeper_user_id": request.sleeper_user_id,
        }).execute()

        if not user_response.data:
            raise HTTPException(status_code=500, detail="Failed to create user record")

        # Insert into leagues table
        league_response = supabase.table("leagues").insert({
            "user_id": user_id,
            "league_id": request.league_id,
            "league_name": request.league_name,
            "season": request.season,
            "num_teams": request.num_teams,
            "scoring_format": request.scoring_format,
            "num_qbs": request.num_qbs,
            "num_wrs": request.num_wrs,
            "num_rbs": request.num_rbs,
            "num_tes": request.num_tes,
            "num_flex": request.num_flex,
            "num_bench": request.num_bench,
            "sleeper_roster_id": request.sleeper_roster_id,
            "is_active": True,
        }).execute()

        if not league_response.data:
            raise HTTPException(status_code=500, detail="Failed to create league record")

        return CompleteOnboardingResponse(
            success=True,
            message="Onboarding completed successfully",
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error during onboarding: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to complete onboarding: {str(e)}")


@router.post("/switch-league", response_model=SwitchLeagueResponse)
async def switch_league(
    request: SwitchLeagueRequest,
    authorization: str = Header(None),
):
    """
    Switch active league for an existing user.

    If the league already exists for this user, activates it.
    If not, creates a new league record and activates it.
    Deactivates all other leagues for the user.
    Requires authentication token in Authorization header.
    """
    # Validate auth token and get user ID
    token = get_auth_token(authorization)
    user_id = await verify_token_and_get_user_id(token)

    try:
        # Check if league already exists for this user
        existing_response = supabase.table("leagues").select("id").eq("user_id", user_id).eq("league_id", request.league_id).execute()

        if existing_response.data and len(existing_response.data) > 0:
            # League exists - deactivate all leagues then activate target
            supabase.table("leagues").update({"is_active": False}).eq("user_id", user_id).execute()

            supabase.table("leagues").update({"is_active": True}).eq("user_id", user_id).eq("league_id", request.league_id).execute()

            return SwitchLeagueResponse(
                success=True,
                message="League activated successfully",
            )
        else:
            # League doesn't exist - deactivate all leagues then insert new one
            supabase.table("leagues").update({"is_active": False}).eq("user_id", user_id).execute()

            insert_response = supabase.table("leagues").insert({
                "user_id": user_id,
                "league_id": request.league_id,
                "league_name": request.league_name,
                "season": request.season,
                "num_teams": request.num_teams,
                "scoring_format": request.scoring_format,
                "num_qbs": request.num_qbs,
                "num_wrs": request.num_wrs,
                "num_rbs": request.num_rbs,
                "num_tes": request.num_tes,
                "num_flex": request.num_flex,
                "num_bench": request.num_bench,
                "sleeper_roster_id": request.sleeper_roster_id,
                "is_active": True,
            }).execute()

            if not insert_response.data:
                raise HTTPException(status_code=500, detail="Failed to create league record")

            return SwitchLeagueResponse(
                success=True,
                message="League created and activated successfully",
            )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error switching league: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to switch league: {str(e)}")
