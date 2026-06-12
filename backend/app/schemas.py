from pydantic import BaseModel

# Home Screen
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

# Start Sit
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
    ranking: str
    def_rank: str              # just def_rank for now
    reasoning: str          

class CompareResponse(BaseModel):
    players: list[ComparePlayer]
    rankings: str
    starting_player: str
    summary: str            # "Start Chase. Here's why..."

# Trade Evals
class TradeRequest(BaseModel):
    give: str     # players you're giving (player_ids seperated by a colon)
    get: str      # players you're getting
    league_id: str
    # season: int # hardcoded in fantasy pros and espn rn
    current_week: int

class PlayerInfo(BaseModel):
    position: str
    team: str | None
    age: float | None
    years_of_experience: int | None

class FantasyCalcStats(BaseModel):
    value: int
    overallRank: int
    positionRank: int
    trend30Day: int
    redraftDynastyValueDifference: int
    redraftValue: int
    maybeMovingStandardDeviation: int | None
    tier: int | None
    adp: float | None
    tradeFrequency: float | None

class TradePlayer(BaseModel):
    name: str
    side: str           # "give" or "get"
    info: PlayerInfo
    ros_ranking: dict | None
    fantasy_calc_stats: FantasyCalcStats

class RosterPlayer(BaseModel):
    name: str
    info: PlayerInfo
    ros_ranking: dict | None
    fantasy_calc_stats: FantasyCalcStats

class TradeResponse(BaseModel):
    verdict: str        # "accept" "decline" "counter"
    summary: str
    players: list[TradePlayer]