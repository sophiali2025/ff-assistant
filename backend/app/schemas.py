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

class CompareRequest(BaseModel):
    players: str       # list of player_ids seperated by a colon
    league_id: str
    week: int
    season: int

class PlayerStat(BaseModel):
    def_rank: str           
    game_total: float       
    spread: str             # "CIN -3.5"
    weather: str            # "clear" or "wind 18mph"

class ComparePlayer(BaseModel):
    player: str             # name
    rank: int               
    verdict: str            # "start" "ok" or "sit"
    projection: float       
    # stats: PlayerStat
    stats: str              # just def_rank for now
    reasoning: str          

class CompareResponse(BaseModel):
    players: list[ComparePlayer]
    rankings: str
    starting_player: str
    summary: str            # "Start Chase. Here's why..."