// The base URL comes from our .env file. In Expo, any env variable
// that starts with EXPO_PUBLIC_ is available in your code via
// process.env. This lets us change the URL without editing code.
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Hardcoded for now — later this will come from the user's Sleeper account
const LEAGUE_ID = "1046187576047603712";

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
  const response = await fetch(`${API_URL}/matchup/${LEAGUE_ID}`);

  // fetch doesn't throw on HTTP errors (like 404 or 500) — it only
  // throws on network failures. So we check response.ok manually.
  if (!response.ok) {
    throw new Error(`Failed to fetch matchup: ${response.status}`);
  }

  // response.json() also returns a Promise (parsing takes time),
  // so we await it too. This gives us a plain JavaScript object.
  const data = await response.json();
  return data;
}

export async function fetchRoster() {
  const response = await fetch(`${API_URL}/roster/${LEAGUE_ID}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch roster: ${response.status}`);
  }

  const data = await response.json();
  return data;
}
