from fastapi import FastAPI
from .mock_data import MOCK_ROSTER, MOCK_MATCHUP

app = FastAPI()

@app.get("/roster/{league_id}")
def get_roster(league_id: int):
    return MOCK_ROSTER

@app.get("/matchup/{league_id}")
def get_matchup (league_id: int):
    return MOCK_MATCHUP

@app.get("/player/{player_id}")
def get_player (player_id: int):
    roster_by_id = {p["player_id"]: p for p in MOCK_ROSTER}
    player = roster_by_id.get(player_id) 
    return player


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