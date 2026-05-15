from pydantic import BaseModel

class Player(BaseModel):
    player_id: str
    name: str
    position: str        # QB, RB, WR, TE, K, DEF
    team: str
    status: str          # active, questionable, doubtful, out
    points_this_week: float
    projected_points: float
    is_starter: bool
    slot: str            # QB, RB, WR, TE, FLX, K, DEF

class TeamScore(BaseModel):
    name: str
    actual_points: float
    proj_points: float

class Matchup(BaseModel):
    week: int
    my_team: TeamScore
    opp_team: TeamScore