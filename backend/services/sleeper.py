import httpx

# --- What is httpx? ---
# httpx is Python's equivalent of fetch() in JavaScript. It lets your
# backend make HTTP requests to other servers (in this case, Sleeper's API).
#
# Why does the backend call Sleeper instead of the mobile app calling
# Sleeper directly? This is a common pattern called a "backend proxy":
#   1. Keeps API logic in one place (the backend)
#   2. Later, if Sleeper requires auth or rate-limiting, you handle it
#      server-side without updating the mobile app
#   3. You can reshape the response before sending it to the frontend

SLEEPER_BASE_URL = "https://api.sleeper.app/v1"


def get_user(username: str):
    """Fetch a Sleeper user by username.

    Sleeper endpoint: GET /v1/user/{username}
    Returns: { user_id, username, display_name, avatar }
    """
    response = httpx.get(f"{SLEEPER_BASE_URL}/user/{username}")
    response.raise_for_status()  # raises an exception on 4xx/5xx errors
    return response.json()

def get_rosters(league_id: str):
    response = httpx.get(f"{SLEEPER_BASE_URL}/league/{league_id}/rosters")
    response.raise_for_status()

    # response.json() parses the HTTP response body into a Python list.
    # Without this, `rosters` would be a Response object, not the actual data.
    return response.json()

def get_matchups(league_id: str, week: int):
    response = httpx.get(f"{SLEEPER_BASE_URL}/league/{league_id}/matchups/{week}")
    response.raise_for_status()

    return response.json()

def get_users_in_league(league_id: str):
    response = httpx.get(f"{SLEEPER_BASE_URL}/league/{league_id}/users")
    response.raise_for_status()

    return response.json()

    

