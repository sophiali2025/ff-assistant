// The base URL comes from our .env file. In Expo, any env variable
// that starts with EXPO_PUBLIC_ is available in your code via
// process.env. This lets us change the URL without editing code.
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Hardcoded for now
const USERNAME = "sophiali";
const USER_ID = "1130559048241356800"
const LEAGUE_ID = "1267619828559007744";
const WEEK = 9
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
  // get my matchup (gives us points + matchup_id)
  const myResponse = await fetch(`${API_URL}/matchup/${LEAGUE_ID}/${WEEK}/${ROSTER_ID}`);
  if (!myResponse.ok) {
    throw new Error(`Failed to fetch my matchup: ${myResponse.status}`);
  }
  const myMatchup = await myResponse.json();

  // get opponent's matchup using matchup_id from step 1
  const oppResponse = await fetch(`${API_URL}/matchup/${LEAGUE_ID}/${WEEK}/${ROSTER_ID}/${myMatchup.matchup_id}`);
  if (!oppResponse.ok) {
    throw new Error(`Failed to fetch opponent matchup: ${oppResponse.status}`);
  }
  const oppMatchup = await oppResponse.json();

  // combine into the shape our WeeklyMatch component expects.
  // sleeper matchups only have actual points, placeholders for projected for now.
  return {
    week: WEEK,
    my_team: {
      name: "My Team",
      points: myMatchup.points,
    },
    opponent: {
      name: "Opponent",
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
