/**
 * useRouteSync.ts
 *
 * Syncs top-level app states to browser URL using React Router.
 * The complex multi-step flows (analyze, battle, enhance) keep their
 * internal state but are anchored to a stable route prefix.
 *
 * State ↔ Route mapping:
 *   welcome      ↔  /
 *   leaderboard  ↔  /top
 *   about        ↔  /sobre
 *   privacy      ↔  /privacidad
 *   terms        ↔  /terminos
 *   faq          ↔  /preguntas
 *   select       ↔  /analizar  (+ analyze, capture, result, error)
 *   battleSelect ↔  /batalla   (+ battleResult, capture)
 *   select/enhance↔ /mejora    (+ enhancing, enhanceResult)
 */

import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppState, AppMode } from '../types';

// ─── Route ↔ State mapping tables ─────────────────────────────────────────────

const STATE_TO_ROUTE: Partial<Record<AppState, string>> = {
  welcome: '/',
  leaderboard: '/top',
  about: '/sobre',
  privacy: '/privacidad',
  terms: '/terminos',
  faq: '/preguntas',
  select: '/analizar',
  battleSelect: '/batalla',
};

const ROUTE_TO_STATE: Record<string, { state: AppState; mode?: AppMode }> = {
  '/':           { state: 'welcome' },
  '/top':        { state: 'leaderboard' },
  '/sobre':      { state: 'about' },
  '/privacidad': { state: 'privacy' },
  '/terminos':   { state: 'terms' },
  '/preguntas':  { state: 'faq' },
  '/analizar':   { state: 'select', mode: 'single' },
  '/batalla':    { state: 'battleSelect', mode: 'battle' },
  '/mejora':     { state: 'select', mode: 'enhance' },
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseRouteSyncOptions {
  appState: AppState;
  setAppState: (state: AppState) => void;
  setAppMode: (mode: AppMode) => void;
}

const useRouteSync = ({ appState, setAppState, setAppMode }: UseRouteSyncOptions) => {
  const navigate = useNavigate();
  const location = useLocation();

  // On mount: read URL and set initial state
  useEffect(() => {
    const mapping = ROUTE_TO_STATE[location.pathname];
    if (mapping) {
      setAppState(mapping.state);
      if (mapping.mode) setAppMode(mapping.mode);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When appState changes, update URL if there's a matching route
  useEffect(() => {
    const targetRoute = STATE_TO_ROUTE[appState];
    if (targetRoute && location.pathname !== targetRoute) {
      navigate(targetRoute, { replace: true });
    }
  }, [appState, navigate, location.pathname]);

  // Enhanced navigate that accepts a state name and updates both state and URL
  const navigateTo = useCallback(
    (state: AppState) => {
      const targetRoute = STATE_TO_ROUTE[state];
      if (targetRoute) {
        navigate(targetRoute);
      }
      setAppState(state);
    },
    [navigate, setAppState]
  );

  return { navigateTo };
};

export default useRouteSync;
