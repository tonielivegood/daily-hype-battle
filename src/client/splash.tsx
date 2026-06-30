import './index.css';

import { requestExpandedMode } from '@devvit/web/client';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useHype } from './hooks/useHype';
import { LockedScreen } from './components/LockedScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { LaunchpadScreen } from './components/LaunchpadScreen';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorState } from './components/ErrorState';

export const Splash = () => {
  const {
    loading,
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
    <div className="hype-shell items-center justify-center px-4 py-8 overflow-hidden">
      {/* Floating background emojis */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
        <span className="absolute text-3xl opacity-10 top-[10%] left-[10%] animate-confetti" style={{ animationDelay: '0s', animationDuration: '3s' }}>🐸</span>
        <span className="absolute text-2xl opacity-10 top-[20%] right-[15%] animate-confetti" style={{ animationDelay: '0.4s', animationDuration: '3.5s' }}>🔥</span>
        <span className="absolute text-3xl opacity-10 top-[50%] left-[5%] animate-confetti" style={{ animationDelay: '0.8s', animationDuration: '2.8s' }}>💀</span>
        <span className="absolute text-2xl opacity-10 top-[40%] right-[8%] animate-confetti" style={{ animationDelay: '1.2s', animationDuration: '3.2s' }}>🦆</span>
        <span className="absolute text-3xl opacity-10 top-[70%] left-[20%] animate-confetti" style={{ animationDelay: '1.6s', animationDuration: '3s' }}>🌮</span>
        <span className="absolute text-2xl opacity-10 top-[65%] right-[20%] animate-confetti" style={{ animationDelay: '2s', animationDuration: '3.4s' }}>🏆</span>
      </div>

      {/* Main content: Styled as a central arcade console board */}
      <div className="relative z-10 flex flex-col items-center gap-5 w-full max-w-[350px] text-center arcade-board p-6 mx-auto animate-fade-in-up">
        {/* Logo/icon area: Glowing arena ring */}
        <div className="arena-ring select-none">
          <span className="text-4xl filter drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]">⚡</span>
        </div>

        {/* Status Line */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-hype-green/10 border border-hype-green/30 text-hype-green shadow-[0_0_12px_rgba(34,197,94,0.1)]">
            🟢 Today’s board is open
          </span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase bg-gradient-to-b from-white to-hype-text bg-clip-text">
            Daily Hype Battle
          </h1>
          <p className="text-hype-accent text-xs font-black mt-2 tracking-wide uppercase">
            Pick today’s meme. Launch tomorrow’s contender.
          </p>
          <p className="text-hype-text-dim text-[11px] mt-2.5 max-w-xs leading-relaxed">
            Spend 100 fictional Hype Points on meme contenders, then see what the crowd crowns.
          </p>
        </div>

        {/* Three Steps Strip */}
        <div className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-3 flex justify-between text-center mt-1">
          <div className="flex-1">
            <span className="block text-xs font-black text-hype-accent uppercase">1. Pick</span>
            <span className="text-[9px] text-hype-text-dim">Contenders</span>
          </div>
          <div className="w-[1px] bg-white/10 my-0.5" />
          <div className="flex-1">
            <span className="block text-xs font-black text-hype-purple uppercase">2. Lock</span>
            <span className="text-[9px] text-hype-text-dim">Picks</span>
          </div>
          <div className="w-[1px] bg-white/10 my-0.5" />
          <div className="flex-1">
            <span className="block text-xs font-black text-hype-pink uppercase">3. Reveal</span>
            <span className="text-[9px] text-hype-text-dim">Results</span>
          </div>
        </div>

        {/* CTA Area */}
        <div className="flex flex-col items-center w-full mt-2 gap-3">
          <button
            className="hype-cta w-full max-w-[280px] justify-center"
            onClick={(e) => requestExpandedMode(e.nativeEvent, 'game')}
          >
            Enter the Arena 🔥
          </button>
          
          <button
            onClick={() => setCurrentView('launchpad')}
            className="hype-cta-secondary w-full max-w-[280px]"
          >
            Nominate Tomorrow’s Meme 🚀
          </button>
        </div>
      </div>

      {/* Footer disclaimer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center px-6">
        <p className="text-[9px] text-hype-text-muted leading-relaxed max-w-xs mx-auto">
          Fictional Hype Points only. No real money. No crypto. No betting. Not connected to Reddit karma.
        </p>
      </footer>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
