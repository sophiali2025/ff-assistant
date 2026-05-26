// The base URL comes from our .env file. In Expo, any env variable
// that starts with EXPO_PUBLIC_ is available in your code via
// process.env. This lets us change the URL without editing code.
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Hardcoded for now
const USERNAME = "sophiali";
const USER_ID = "1130559048241356800"
const LEAGUE_ID = "1267619828559007744";
const WEEK = 17
const ROSTER_ID = 5

// Toggle this to enable/disable projection API calls.
// Set to false to avoid burning API calls during development.
const PROJECTIONS_ENABLED = false;

// --- What is fetch? ---
// fetch() is built into JavaScript. It makes HTTP requests (like
// visiting a URL in your browser, but from code). It returns a
// Promise — an object that represents a value that isn't available
// yet but will be in the future (because the network request takes
// time). We use `await` to pause until the Promise resolves.

// --- What is async/await? ---
// When a function is marked `async`, it can use `await` inside it.
// `await` pauses the function until the Promise resolves, then gives
// you the actual value. Without await, you'd get a Promise object
// instead of the data you want.

export async function fetchMatchup() {
  // 1. get my matchup + my team name at the same time.
  // Promise.all runs them in parallel (faster than one-by-one).
  const [myResponse, myTeamResponse] = await Promise.all([
    fetch(`${API_URL}/matchup/${LEAGUE_ID}/${WEEK}/${ROSTER_ID}`),
    fetch(`${API_URL}/team/${LEAGUE_ID}/${USER_ID}`),
  ]);
  if (!myResponse.ok) throw new Error(`Failed to fetch my matchup: ${myResponse.status}`);
  if (!myTeamResponse.ok) throw new Error(`Failed to fetch my team: ${myTeamResponse.status}`);

  const myMatchup = await myResponse.json();
  const myTeam = await myTeamResponse.json();

  // 2. get opponent's matchup (needs matchup_id from step 1)
  const oppResponse = await fetch(`${API_URL}/matchup/${LEAGUE_ID}/${WEEK}/${ROSTER_ID}/${myMatchup.matchup_id}`);
  if (!oppResponse.ok) throw new Error(`Failed to fetch opponent matchup: ${oppResponse.status}`);
  const oppMatchup = await oppResponse.json();

  // 3. get opponent's team name and (if enabled) both teams' projected totals
  let myProjected = 0;
  let oppProjected = 0;

  if (PROJECTIONS_ENABLED) {
    const [oppTeamResponse, myProjResponse, oppProjResponse] = await Promise.all([
      fetch(`${API_URL}/team/${LEAGUE_ID}/roster/${oppMatchup.roster_id}`),
      fetch(`${API_URL}/projection/roster/${LEAGUE_ID}/${ROSTER_ID}/${WEEK}`),
      fetch(`${API_URL}/projection/roster/${LEAGUE_ID}/${oppMatchup.roster_id}/${WEEK}`),
    ]);
    if (!oppTeamResponse.ok) throw new Error(`Failed to fetch opponent team: ${oppTeamResponse.status}`);
    const oppTeam = await oppTeamResponse.json();
    const myProj = await myProjResponse.json();
    const oppProj = await oppProjResponse.json();
    myProjected = myProj.projected_points ?? 0;
    oppProjected = oppProj.projected_points ?? 0;

    return {
      week: WEEK,
      my_team: { name: myTeam.team_name, points: myMatchup.points, projected_points: myProjected },
      opponent: { name: oppTeam.team_name, points: oppMatchup.points, projected_points: oppProjected },
    };
  }

  // Projections disabled — still need opponent team name
  const oppTeamResponse = await fetch(`${API_URL}/team/${LEAGUE_ID}/roster/${oppMatchup.roster_id}`);
  if (!oppTeamResponse.ok) throw new Error(`Failed to fetch opponent team: ${oppTeamResponse.status}`);
  const oppTeam = await oppTeamResponse.json();

  // 4. combine into the shape our WeeklyMatch component expects
  return {
    week: WEEK,
    my_team: { name: myTeam.team_name, points: myMatchup.points, projected_points: 0 },
    opponent: { name: oppTeam.team_name, points: oppMatchup.points, projected_points: 0 },
  };
}

export async function fetchRoster() {
  // 1. Get roster (player IDs) and matchup (points) in parallel.
  // The roster tells us WHO is on the team. The matchup tells us
  // how many points each player scored this week.
  const [rosterResponse, matchupResponse] = await Promise.all([
    fetch(`${API_URL}/roster/${LEAGUE_ID}/${USER_ID}`),
    fetch(`${API_URL}/matchup/${LEAGUE_ID}/${WEEK}/${ROSTER_ID}`),
  ]);
  if (!rosterResponse.ok) throw new Error(`Failed to fetch roster: ${rosterResponse.status}`);
  if (!matchupResponse.ok) throw new Error(`Failed to fetch matchup: ${matchupResponse.status}`);

  const roster = await rosterResponse.json();
  const matchup = await matchupResponse.json();

  // 2. Fetch details for every player on the roster in parallel.
  // roster.players is an array of IDs like ["4042", "4046", ...].
  // We call GET /player/{id} for each one, all at the same time.
  const playerResponses = await Promise.all(
    roster.players.map((id) => fetch(`${API_URL}/player/${id}`))
  );
  const playerDetails = await Promise.all(
    playerResponses.map((r) => r.json())
  );

  // 3. Build a lookup: player_id → player details (player_id is
  // now a key), so we can quickly find any player's info without
  // looping each time.
  const detailsById = {};
  roster.players.forEach((id, i) => {
    detailsById[id] = playerDetails[i];
  });

  // 3.5. Fetch projected points for all players in a single batch call (if enabled).
  // Sends all Sleeper IDs joined by ":" to /projection/batch/{week},
  // which makes one FantasyPros API call instead of 15+ separate ones.
  const projectionsById = {};
  if (PROJECTIONS_ENABLED) {
    const ids = roster.players.join(":");
    const projResponse = await fetch(`${API_URL}/projection/batch/${WEEK}?sleeper_ids=${ids}`);
    const projData = await projResponse.json();
    Object.assign(projectionsById, projData.projections ?? {});
  }

  // 4. Build the starters list (in order) with correct slots.
  // roster.starters is ordered: positions 1-6 use the player's
  // position, 7th and 8th are FLEX, then K and DEF follow.
  const starters = roster.starters.map((id, index) => {
    const detail = detailsById[id];
    let slot;
    if (index === 6 || index === 7) {
      slot = "FLX";
    } else {
      // Use the player's fantasy position (QB, RB, WR, etc.)
      slot = detail.position ?? "??";
    }

    return {
      player_id: id,
      name: `${detail.first_name} ${detail.last_name}`,
      slot,
      status: detail.injury_status?.toLowerCase() ?? "active",
      points_this_week: matchup.players_points?.[id] ?? 0,
      projected_points: projectionsById[id] ?? 0,
    };
  });

  // 5. Build the bench list — everyone in players who isn't a starter.
  const starterSet = new Set(roster.starters);
  const bench = roster.players
    .filter((id) => !starterSet.has(id))
    .map((id) => {
      const detail = detailsById[id];
      return {
        player_id: id,
        name: `${detail.first_name} ${detail.last_name}`,
        slot: "BN",
        status: detail.injury_status?.toLowerCase() ?? "active",
        points_this_week: matchup.players_points?.[id] ?? 0,
        projected_points: projectionsById[id] ?? 0,
      };
    });

  // 6. Return starters first, then bench — that's the natural roster order.
  return [...starters, ...bench];
}

export async function fetchPlayerNews(playerId) {
  const response = await fetch(`${API_URL}/news/${playerId}`);
  const data = await response.json();
  return data["news impact"] ?? data["recent news"] ?? "no news";
}
