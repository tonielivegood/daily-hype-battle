import './index.css';

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useHype } from './hooks/useHype';
import { HypeBoard } from './components/HypeBoard';
import { LockedScreen } from './components/LockedScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { LaunchpadScreen } from './components/LaunchpadScreen';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorState } from './components/ErrorState';

export const Game = () => {
  const {
    loading,
    locking,
    settling,
    error,
    locked,
    allocations,
    settled,
    results,
    playerScore,
    streak,
    badges,
    leaderboard,
    username,
    lockHype,
    settleRound,
    retry,
  } = useHype();

  const [currentView, setCurrentView] = useState<'main' | 'launchpad'>('main');

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !locked && !settled) {
    return <ErrorState message={error} onRetry={retry} />;
  }

  if (currentView === 'launchpad') {
    return <LaunchpadScreen onBack={() => setCurrentView('main')} />;
  }

  if (settled && results && allocations) {
    return (
      <ResultsScreen
        results={results}
        allocations={allocations}
        playerScore={playerScore}
        streak={streak}
        badges={badges}
        leaderboard={leaderboard}
        username={username}
        onRecalculate={settleRound}
        settling={settling}
        error={error}
        onOpenLaunchpad={() => setCurrentView('launchpad')}
      />
    );
  }

  if (locked && allocations) {
    return (
      <LockedScreen
        allocations={allocations}
        onSettle={settleRound}
        settling={settling}
        error={error}
        onOpenLaunchpad={() => setCurrentView('launchpad')}
      />
    );
  }

  return (
    <HypeBoard
      onLock={lockHype}
      locking={locking}
      onOpenLaunchpad={() => setCurrentView('launchpad')}
    />
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Game />
  </StrictMode>
);
