import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * SeasonContext - Central NFL season state management
 *
 * REACT CONCEPT: Context API
 * --------------
 * This follows the same pattern as AuthContext. It fetches NFL state data
 * once and shares it across all screens without prop drilling.
 *
 * Why separate from AuthContext?
 * - Season data is global (not user-specific)
 * - Different refresh cadence (weekly vs auth changes)
 * - Single Responsibility Principle: each context handles one concern
 */

interface NFLState {
  week: number;
  season: string;
  season_type: 'pre' | 'post' | 'regular';
  display_week: number;
  previous_season: string;
  league_season?: string;
}

interface SeasonContextType {
  currentWeek: number;           // The week to use for API calls
  currentSeason: string;          // The season to use for API calls
  seasonType: 'pre' | 'post' | 'regular';
  loading: boolean;               // True while fetching NFL state
  error: string | null;           // Error message if fetch fails
  refresh: () => Promise<void>;   // Manual refresh function
}

// Fallback values (used if API fails)
const FALLBACK_WEEK = 17;
const FALLBACK_SEASON = '2025';

// Default context values
const SeasonContext = createContext<SeasonContextType>({
  currentWeek: FALLBACK_WEEK,
  currentSeason: FALLBACK_SEASON,
  seasonType: 'regular',
  loading: true,
  error: null,
  refresh: async () => {},
});

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Testing override — set these in .env to use hardcoded values
const TEST_MODE = process.env.EXPO_PUBLIC_TEST_SEASON && process.env.EXPO_PUBLIC_TEST_WEEK;
const TEST_WEEK = process.env.EXPO_PUBLIC_TEST_WEEK ? parseInt(process.env.EXPO_PUBLIC_TEST_WEEK) : null;
const TEST_SEASON = process.env.EXPO_PUBLIC_TEST_SEASON || null;

export function SeasonProvider({ children }: { children: React.ReactNode }) {
  const [currentWeek, setCurrentWeek] = useState(FALLBACK_WEEK);
  const [currentSeason, setCurrentSeason] = useState(FALLBACK_SEASON);
  const [seasonType, setSeasonType] = useState<'pre' | 'post' | 'regular'>('regular');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Process NFL state and apply business logic
   *
   * Business rules:
   * - Preseason: Use week 1 of current season (fallback to week 17 of previous season if API fails)
   * - Postseason: Use week 17 of previous season
   * - Regular season: Use display_week of league_season
   */
  const processNFLState = (state: NFLState) => {
    let week: number;
    let season: string;

    if (state.season_type === 'pre') {
      // Preseason — use week 1 of current season
      week = 1;
      season = state.season;
    } else if (state.season_type === 'post') {
      // Postseason — use week 17 of previous season
      week = 17;
      season = state.previous_season;
    } else {
      // Regular season — use display_week of league_season
      week = state.display_week;
      season = state.league_season || state.season;
    }

    return { week, season, seasonType: state.season_type };
  };

  const fetchNFLState = async () => {
    // If in test mode, use environment variables
    if (TEST_MODE && TEST_WEEK && TEST_SEASON) {
      console.log('SeasonContext: Using test mode -', TEST_SEASON, 'week', TEST_WEEK);
      setCurrentWeek(TEST_WEEK);
      setCurrentSeason(TEST_SEASON);
      setSeasonType('regular');
      setLoading(false);
      return;
    }

    // Otherwise, fetch from backend API
    try {
      const response = await fetch(`${API_URL}/nfl/state`);
      if (!response.ok) {
        throw new Error('Failed to fetch NFL state');
      }

      const state: NFLState = await response.json();
      const { week, season, seasonType: type } = processNFLState(state);

      console.log('SeasonContext: NFL state fetched -', season, 'week', week, type);
      setCurrentWeek(week);
      setCurrentSeason(season);
      setSeasonType(type);
      setError(null);
    } catch (err) {
      console.error('SeasonContext: Error fetching NFL state:', err);
      setError('Failed to load season data');
      // Keep using fallback values on error
    } finally {
      setLoading(false);
    }
  };

  /**
   * REACT CONCEPT: useEffect with Cleanup
   * ------------------------------------
   * This effect runs once when the component mounts (app starts).
   * It fetches initial NFL state and sets up a 24-hour refresh interval.
   *
   * The cleanup function (return statement) runs when the component unmounts,
   * clearing the interval to prevent memory leaks.
   */
  useEffect(() => {
    // Initial fetch
    fetchNFLState();

    // Set up 24-hour refresh interval
    // NFL weeks change Tuesday nights, so daily checks catch transitions quickly
    const interval = setInterval(() => {
      console.log('SeasonContext: 24-hour refresh check');
      fetchNFLState();
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

    // Cleanup: Clear interval when component unmounts
    return () => clearInterval(interval);
  }, []); // Empty array = run once on mount

  // Manual refresh function (can be called from pull-to-refresh)
  const refresh = async () => {
    setLoading(true);
    await fetchNFLState();
  };

  return (
    <SeasonContext.Provider
      value={{
        currentWeek,
        currentSeason,
        seasonType,
        loading,
        error,
        refresh,
      }}
    >
      {children}
    </SeasonContext.Provider>
  );
}

/**
 * useSeason - Custom hook to consume season context
 *
 * REACT CONCEPT: Custom Hooks
 * ---------------------------
 * A custom hook lets you extract component logic into reusable functions.
 * Convention: Custom hooks MUST start with "use".
 *
 * Usage:
 * ```tsx
 * const { currentWeek, currentSeason } = useSeason();
 * fetchMatchup(currentWeek, currentSeason);
 * ```
 */
export function useSeason() {
  const context = useContext(SeasonContext);

  // Safety check: Ensure useSeason() is called within SeasonProvider
  if (!context) {
    throw new Error('useSeason must be used within a SeasonProvider');
  }

  return context;
}
