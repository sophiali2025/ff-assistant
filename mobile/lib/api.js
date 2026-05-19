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

  // 3. get opponent's team name (needs roster_id from step 2)
  const oppTeamResponse = await fetch(`${API_URL}/team/${LEAGUE_ID}/roster/${oppMatchup.roster_id}`);
  if (!oppTeamResponse.ok) throw new Error(`Failed to fetch opponent team: ${oppTeamResponse.status}`);
  const oppTeam = await oppTeamResponse.json();

  // 4. combine into the shape our WeeklyMatch component expects
  return {
    week: WEEK,
    my_team: {
      name: myTeam.team_name,
      points: myMatchup.points,
    },
    opponent: {
      name: oppTeam.team_name,
      points: oppMatchup.points,
    },
  };
}

export async function fetchRoster() {
  const response = await fetch(`${API_URL}/roster/${LEAGUE_ID}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch roster: ${response.status}`);
  }

  const data = await response.json();
  return data;
}
