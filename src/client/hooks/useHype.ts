import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  HypeAllocation,
  GetHypeResponse,
  LockHypeResponse,
  HypeErrorResponse,
  SettledResults,
  LeaderboardEntry,
} from '../../shared/types';

type HypeState = {
  loading: boolean;
  locking: boolean;
  settling: boolean;
  error: string | null;
  locked: boolean;
  allocations: HypeAllocation[] | null;
  settled: boolean;
  results: SettledResults | null;
  playerScore: number | null;
  streak: number;
  badges: string[];
  leaderboard: LeaderboardEntry[];
  username: string;
};

export const useHype = () => {
  const [state, setState] = useState<HypeState>({
    loading: true,
    locking: false,
    settling: false,
    error: null,
    locked: false,
    allocations: null,
    settled: false,
    results: null,
    playerScore: null,
    streak: 0,
    badges: [],
    leaderboard: [],
    username: '',
  });

  // Track whether mount fetch has happened to enable manual retry
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    let cancelled = false;

    const doFetch = async () => {
      try {
        const res = await fetch('/api/hype');
        if (cancelled) return;
        if (!res.ok) {
          const err: HypeErrorResponse = await res.json();
          throw new Error(err.message || `HTTP ${res.status}`);
        }
        const data: GetHypeResponse = await res.json();
        if (cancelled) return;
        setState({
          loading: false,
          locking: false,
          settling: false,
          error: null,
          locked: data.locked,
          allocations: data.allocations,
          settled: data.settled,
          results: data.results,
          playerScore: data.playerScore,
          streak: data.streak,
          badges: data.badges,
          leaderboard: data.leaderboard,
          username: data.username,
        });
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : 'Failed to load hype data';
        setState((prev) => ({
          ...prev,
          loading: false,
          error: message,
        }));
      }
    };

    void doFetch();

    return () => {
      cancelled = true;
    };
  }, []);

  const retry = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const doRetry = async () => {
      try {
        const res = await fetch('/api/hype');
        if (!res.ok) {
          const err: HypeErrorResponse = await res.json();
          throw new Error(err.message || `HTTP ${res.status}`);
        }
        const data: GetHypeResponse = await res.json();
        setState({
          loading: false,
          locking: false,
          settling: false,
          error: null,
          locked: data.locked,
          allocations: data.allocations,
          settled: data.settled,
          results: data.results,
          playerScore: data.playerScore,
          streak: data.streak,
          badges: data.badges,
          leaderboard: data.leaderboard,
          username: data.username,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load hype data';
        setState((prev) => ({ ...prev, loading: false, error: message }));
      }
    };

    void doRetry();
  }, []);

  const lockHype = useCallback(async (allocations: HypeAllocation[]) => {
    setState((prev) => ({ ...prev, locking: true, error: null }));
    try {
      const res = await fetch('/api/hype/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allocations }),
      });
      if (!res.ok) {
        const err: HypeErrorResponse = await res.json();
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      const data: LockHypeResponse = await res.json();
      
      // Fetch status again to make sure we load any settled state properly
      const statusRes = await fetch('/api/hype');
      if (!statusRes.ok) {
        setState((prev) => ({
          ...prev,
          locking: false,
          locked: true,
          allocations: data.allocations,
          streak: prev.streak + 1,
        }));
        return;
      }
      const statusData: GetHypeResponse = await statusRes.json();
      setState({
        loading: false,
        locking: false,
        settling: false,
        error: null,
        locked: statusData.locked,
        allocations: statusData.allocations,
        settled: statusData.settled,
        results: statusData.results,
        playerScore: statusData.playerScore,
        streak: statusData.streak,
        badges: statusData.badges,
        leaderboard: statusData.leaderboard,
        username: statusData.username,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to lock hype';
      setState((prev) => ({ ...prev, locking: false, error: message }));
    }
  }, []);

  const settleRound = useCallback(async () => {
    setState((prev) => ({ ...prev, settling: true, error: null }));
    try {
      const res = await fetch('/api/hype/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const err: HypeErrorResponse = await res.json();
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      const data: GetHypeResponse = await res.json();
      setState({
        loading: false,
        locking: false,
        settling: false,
        error: null,
        locked: data.locked,
        allocations: data.allocations,
        settled: data.settled,
        results: data.results,
        playerScore: data.playerScore,
        streak: data.streak,
        badges: data.badges,
        leaderboard: data.leaderboard,
        username: data.username,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to settle round';
      setState((prev) => ({ ...prev, settling: false, error: message }));
    }
  }, []);

  return {
    ...state,
    lockHype,
    settleRound,
    retry,
  } as const;
};
