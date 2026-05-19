from fastapi import FastAPI
from .mock_data import MOCK_ROSTER, MOCK_MATCHUP
from main import app

@app.get("/roster/{league_id}")
def get_roster(league_id: str):
    return MOCK_ROSTER.get(league_id)

@app.get("/matchup/{league_id}")
def get_matchup(league_id: str):
    return MOCK_MATCHUP.get(league_id)

@app.get("/player/{league_id}/{player_id}")
def get_player(league_id: str, player_id: str):
    roster = MOCK_ROSTER.get(league_id, [])
    roster_by_id = {p["player_id"]: p for p in roster}
    return roster_by_id.get(player_id)


# @app.get("/posts")
# def get_all_posts(limit: int = None):   # if not none, have to have the query parameter
#     if limit:
#         return list(text_posts.values())[:limit]
#     return text_posts

# @app.get("/posts/{id}")
# def get_post(id: int) -> PostResponse:
#     if id not in text_posts:
#         raise HTTPException(status_code=404, detail= "Post Not Found")
#     return text_posts.get(id)