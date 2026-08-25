import { supabase } from './supabase';

// The base URL comes from our .env file. In Expo, any env variable
// that starts with EXPO_PUBLIC_ is available in your code via
// process.env. This lets us change the URL without editing code.
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Toggle this to enable/disable projection API calls.
// Set to false to avoid burning API calls during development.
const PROJECTIONS_ENABLED = true;

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

// ========== Onboarding API Calls ==========
// These call the Sleeper API directly (public API, no auth needed)

export async function validateSleeperUsername(username) {
  try {
    const response = await fetch(`${API_URL}/user/${username}/id`);

    if (!response.ok) {
      throw new Error('Username not found');
    }

    const data = await response.json();
    return data.user_id; // Returns Sleeper user ID
  } catch (error) {
    console.error('Error validating username:', error);
    throw error;
  }
}

export async function getUserLeagues(sleeperUserId, season) {
  try {
    const response = await fetch(`${API_URL}/user/${sleeperUserId}/leagues/${season}`);

    if (!response.ok) {
      throw new Error('Failed to fetch leagues');
    }

    const data = await response.json();
    return data; // Returns array of league objects
  } catch (error) {
    console.error('Error fetching leagues:', error);
    throw error;
  }
}

export async function getUserRoster(leagueId, sleeperUserId) {
  try {
    const response = await fetch(`${API_URL}/roster/${leagueId}/${sleeperUserId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch roster');
    }

    const roster = await response.json();
    return roster; // Returns roster object with roster_id
  } catch (error) {
    console.error('Error fetching roster:', error);
    throw error;
  }
}

// Helper to get auth token from Supabase session
async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No active session');
  }
  return session.access_token;
}

export async function completeOnboarding(onboardingData) {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${API_URL}/onboarding/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(onboardingData),
    });

    if (!response.ok) {
      throw new Error('Failed to complete onboarding');
    }

    return await response.json();
  } catch (error) {
    console.error('Error completing onboarding:', error);
    throw error;
  }
}

export async function switchLeague(leagueData) {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${API_URL}/onboarding/switch-league`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(leagueData),
    });

    if (!response.ok) {
      throw new Error('Failed to switch league');
    }

    return await response.json();
  } catch (error) {
    console.error('Error switching league:', error);
    throw error;
  }
}

// ========== User Data Helper ==========
// This fetches the current user's Sleeper data from the database.
// It's called "lazy loading" because we fetch it only when needed,
// not on app startup.

async function getActiveUserData() {
  // 1. Get the currently authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // 2. Fetch user's Sleeper data from database
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('sleeper_user_id')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    throw new Error('User data not found in database');
  }

  // 3. Fetch active league
  const { data: leagueData, error: leagueError } = await supabase
    .from('leagues')
    .select('league_id, sleeper_roster_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (leagueError || !leagueData) {
    throw new Error('No active league found');
  }

  // 4. Return the IDs that used to be hardcoded
  return {
    userId: userData.sleeper_user_id,
    leagueId: leagueData.league_id,
    rosterId: leagueData.sleeper_roster_id,
  };
}

// ========== Existing API Calls ==========

export async function fetchMatchup(week, season) {
  // Get user's dynamic data from database
  const { userId, leagueId, rosterId } = await getActiveUserData();

  // 1. get my matchup + my team name at the same time.
  // Promise.all runs them in parallel (faster than one-by-one).
  const [myResponse, myTeamResponse] = await Promise.all([
    fetch(`${API_URL}/matchup/${leagueId}/${week}/${rosterId}`),
    fetch(`${API_URL}/team/${leagueId}/${userId}`),
  ]);
  if (!myResponse.ok) throw new Error(`Failed to fetch my matchup: ${myResponse.status}`);
  if (!myTeamResponse.ok) throw new Error(`Failed to fetch my team: ${myTeamResponse.status}`);

  const myMatchup = await myResponse.json();
  const myTeam = await myTeamResponse.json();

  // Check if there's a matchup this week (could be null for playoffs/bye weeks or no roster yet)
  if (!myMatchup || !myMatchup.matchup_id) {
    return {
      week: week,
      my_team: { name: myTeam?.team_name ?? 'My Team', points: myMatchup?.points ?? null, projected_points: null },
      opponent: { name: 'No Matchup', points: null, projected_points: null },
    };
  }

  // 2. get opponent's matchup (needs matchup_id from step 1)
  const oppResponse = await fetch(`${API_URL}/matchup/${leagueId}/${week}/${rosterId}/${myMatchup.matchup_id}`);
  if (!oppResponse.ok) throw new Error(`Failed to fetch opponent matchup: ${oppResponse.status}`);
  const oppMatchup = await oppResponse.json();

  // 3. get opponent's team name and (if enabled) both teams' projected totals
  let myProjected = null;
  let oppProjected = null;

  if (PROJECTIONS_ENABLED) {
    const [oppTeamResponse, myProjResponse, oppProjResponse] = await Promise.all([
      fetch(`${API_URL}/team/${leagueId}/roster/${oppMatchup.roster_id}`),
      fetch(`${API_URL}/projection/roster/${leagueId}/${rosterId}/${week}?season=${season}`),
      fetch(`${API_URL}/projection/roster/${leagueId}/${oppMatchup.roster_id}/${week}?season=${season}`),
    ]);
    if (!oppTeamResponse.ok) throw new Error(`Failed to fetch opponent team: ${oppTeamResponse.status}`);
    const oppTeam = await oppTeamResponse.json();
    const myProj = await myProjResponse.json();
    const oppProj = await oppProjResponse.json();
    myProjected = myProj.projected_points ?? null;
    oppProjected = oppProj.projected_points ?? null;

    return {
      week: week,
      my_team: { name: myTeam.team_name, points: myMatchup.points ?? null, projected_points: myProjected },
      opponent: { name: oppTeam.team_name, points: oppMatchup.points ?? null, projected_points: oppProjected },
    };
  }

  // Projections disabled — still need opponent team name
  const oppTeamResponse = await fetch(`${API_URL}/team/${leagueId}/roster/${oppMatchup.roster_id}`);
  if (!oppTeamResponse.ok) throw new Error(`Failed to fetch opponent team: ${oppTeamResponse.status}`);
  const oppTeam = await oppTeamResponse.json();

  // 4. combine into the shape our WeeklyMatch component expects
  return {
    week: week,
    my_team: { name: myTeam.team_name, points: myMatchup.points ?? null, projected_points: null },
    opponent: { name: oppTeam.team_name, points: oppMatchup.points ?? null, projected_points: null },
  };
}

export async function fetchRoster(week, season) {
  // Get user's dynamic data from database
  const { userId, leagueId, rosterId } = await getActiveUserData();

  // Get league roster settings from database
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  const { data: leagueSettings, error: leagueError } = await supabase
    .from('leagues')
    .select('num_qbs, num_rbs, num_wrs, num_tes, num_flex')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (leagueError || !leagueSettings) {
    throw new Error('League settings not found');
  }

  // 1. Get roster (player IDs) and matchup (points) in parallel.
  // The roster tells us WHO is on the team. The matchup tells us
  // how many points each player scored this week.
  const [rosterResponse, matchupResponse] = await Promise.all([
    fetch(`${API_URL}/roster/${leagueId}/${userId}`),
    fetch(`${API_URL}/matchup/${leagueId}/${week}/${rosterId}`),
  ]);
  if (!rosterResponse.ok) throw new Error(`Failed to fetch roster: ${rosterResponse.status}`);
  if (!matchupResponse.ok) throw new Error(`Failed to fetch matchup: ${matchupResponse.status}`);

  const roster = await rosterResponse.json();
  const matchup = await matchupResponse.json();

  // Check if roster exists and has players (return empty array if no roster yet)
  if (!roster || !roster.players || roster.players.length === 0) {
    return [];
  }

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
    const projResponse = await fetch(`${API_URL}/projection/batch/${week}?sleeper_ids=${ids}&season=${season}`);
    const projData = await projResponse.json();
    Object.assign(projectionsById, projData.projections ?? {});
  }

  // 4. Build the starters list (in order) with correct slots.
  // Use league settings to determine which positions are flex
  const { num_qbs, num_rbs, num_wrs, num_tes, num_flex } = leagueSettings;
  const flexStartIndex = num_qbs + num_rbs + num_wrs + num_tes;
  const flexEndIndex = flexStartIndex + num_flex;

  const starters = roster.starters.map((id, index) => {
    const detail = detailsById[id];

    // Skip if player details are missing
    if (!detail) {
      return null;
    }

    let slot;

    // Check if this index is in the FLEX range
    if (index >= flexStartIndex && index < flexEndIndex) {
      slot = "FLX";
    } else {
      // Use the player's actual position for non-flex slots
      slot = detail.position ?? "??";
    }

    return {
      player_id: id,
      name: `${detail.first_name} ${detail.last_name}`,
      position: detail.position ?? "??",
      slot,
      status: detail.injury_status?.toLowerCase() ?? "active",
      points_this_week: matchup?.players_points?.[id] ?? null,
      projected_points: projectionsById[id] ?? 0,
    };
  }).filter(Boolean);

  // 5. Build the bench list — everyone in players who isn't a starter.
  const starterSet = new Set(roster.starters);
  const bench = roster.players
    .filter((id) => !starterSet.has(id))
    .map((id) => {
      const detail = detailsById[id];

      // Skip if player details are missing
      if (!detail) {
        return null;
      }

      return {
        player_id: id,
        name: `${detail.first_name} ${detail.last_name}`,
        position: detail.position ?? "??",
        slot: "BN",
        status: detail.injury_status?.toLowerCase() ?? "active",
        points_this_week: matchup?.players_points?.[id] ?? null,
        projected_points: projectionsById[id] ?? 0,
      };
    })
    .filter(Boolean);

  // 6. Return starters first, then bench — that's the natural roster order.
  return [...starters, ...bench];
}

// POST /ai/compare/claude — sends selected player IDs to the AI
// comparison endpoint. Unlike GET requests where data goes in the URL,
// POST requests send data in the request body as JSON.
export async function comparePlayersClaude(playerIds, week, season) {
  // Get auth token for authenticated request
  const token = await getAuthToken();

  // Get user's dynamic data from database
  const { leagueId } = await getActiveUserData();

  // Join the array of IDs into a colon-separated string.
  // e.g. ["4042", "4046", "8183"] → "4042:4046:8183"
  const players = playerIds.join(":");

  const response = await fetch(`${API_URL}/ai/compare/claude`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      players,
      league_id: leagueId,
      week: week,
      season: season,
    }),
  });
  if (!response.ok) throw new Error(`Compare failed: ${response.status}`);
  return await response.json();
}

export async function fetchMatchupContext(playerId, week) {
  const response = await fetch(`${API_URL}/startsit/matchup_context/${playerId}/${week}`);
  if (!response.ok) throw new Error(`Failed to fetch matchup context: ${response.status}`);
  return await response.json();
}

export async function fetchPlayerNews(playerId) {
  const response = await fetch(`${API_URL}/news/${playerId}`);
  const data = await response.json();
  return data["news impact"] ?? data["recent news"] ?? "no news";
}

// Search for players by name. The backend matches names that START
// with the query (e.g. "ja" matches "Ja'Marr Chase" and "Josh Jacobs").
// Returns up to 20 results sorted by search rank (most relevant first).
export async function searchPlayers(query) {
  const response = await fetch(`${API_URL}/trades/players/search?q=${query}`);
  if (!response.ok) throw new Error(`Search failed: ${response.status}`);
  return await response.json();
}

// Fetch complete display stats for a player (for waiver screen).
// Returns player info, projected points, waiver stats, and rankings.
export async function fetchDisplayStats(playerId, week) {
  const response = await fetch(`${API_URL}/waivers/display_stats/${playerId}/${week}`);
  if (!response.ok) throw new Error(`Display stats failed: ${response.status}`);
  return await response.json();
}

// Send trade player IDs to Claude for evaluation. Returns a verdict
// (accept/decline/counter) and a summary explanation.
export async function evaluateTrade(givePlayerIds, getPlayerIds, week, season) {
  // Get auth token for authenticated request
  const token = await getAuthToken();

  // Get user's dynamic data from database
  const { userId, leagueId } = await getActiveUserData();

  const response = await fetch(`${API_URL}/ai/evaluate_trade/claude`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      give: givePlayerIds.join(":"),
      get: getPlayerIds.join(":"),
      league_id: leagueId,
      user_id: userId,
      season: season,
      current_week: week,
    }),
  });
  if (!response.ok) throw new Error(`Trade eval failed: ${response.status}`);
  return await response.json();
}

// Send waiver player ID to Claude for evaluation. Returns a verdict
// (add/don't add), summary, and suggested drop players.
export async function evaluateWaiver(playerId, week, season) {
  // Get auth token for authenticated request
  const token = await getAuthToken();

  // Get user's dynamic data from database
  const { userId, leagueId } = await getActiveUserData();

  const response = await fetch(`${API_URL}/ai/evaluate_waiver/claude`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      player: playerId,
      league_id: leagueId,
      user_id: userId,
      season: season,
      current_week: week,
    }),
  });
  if (!response.ok) throw new Error(`Waiver eval failed: ${response.status}`);
  return await response.json();
}
