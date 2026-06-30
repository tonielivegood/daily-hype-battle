import { useState } from 'react';
import type { HypeAllocation } from '../../shared/types';
import { CandidateCard } from './CandidateCard';
import { CANDIDATES, TOTAL_HYPE_POINTS } from '../data/candidates';

type HypeBoardProps = {
  onLock: (allocations: HypeAllocation[]) => Promise<void>;
  locking: boolean;
  onOpenLaunchpad: () => void;
};

export const HypeBoard = ({ onLock, locking, onOpenLaunchpad }: HypeBoardProps) => {
  const [allocations, setAllocations] = useState<Record<string, number>>(
    () => Object.fromEntries(CANDIDATES.map((c) => [c.id, 0]))
  );

  const totalUsed = Object.values(allocations).reduce((sum, v) => sum + v, 0);
  const isReady = totalUsed === TOTAL_HYPE_POINTS;
  const progressPct = Math.min((totalUsed / TOTAL_HYPE_POINTS) * 100, 100);

  const handleIncrement = (id: string) => {
    if (totalUsed >= TOTAL_HYPE_POINTS) return;
    setAllocations((prev) => ({
      ...prev,
      [id]: Math.min((prev[id] ?? 0) + 5, TOTAL_HYPE_POINTS),
    }));
  };

  const handleDecrement = (id: string) => {
    setAllocations((prev) => ({
      ...prev,
      [id]: Math.max((prev[id] ?? 0) - 5, 0),
    }));
  };

  const handleLock = () => {
    if (!isReady) return;
    const allocs = Object.entries(allocations)
      .filter(([, points]) => points > 0)
      .map(([candidateId, points]) => ({ candidateId, points }));
    void onLock(allocs);
  };

  return (
    <div className="hype-shell px-4 py-6">
      {/* Status strip */}
      <div className="text-center mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-hype-green/10 border border-hype-green/30 text-hype-green shadow-[0_0_12px_rgba(34,197,94,0.1)]">
          🟢 Today’s board is open
        </span>
      </div>

      {/* Header */}
      <div className="text-center mb-5 animate-fade-in-up">
        <h1 className="text-xl font-black text-white uppercase tracking-tight">
          Today’s Hype Arena 🏆
        </h1>
        <p className="text-hype-text-dim text-xs mt-1.5 leading-relaxed max-w-xs mx-auto">
          Distribute exactly {TOTAL_HYPE_POINTS} Hype Points on contender lanes, then lock your picks.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-5 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="text-xs font-semibold text-hype-text-dim">
            Hype Points
          </span>
          <span
            className={`text-sm font-bold transition-colors duration-200 ${
              isReady ? 'text-hype-green' : 'text-hype-text'
            }`}
          >
            {totalUsed} / {TOTAL_HYPE_POINTS}
            {isReady && ' ✓'}
          </span>
        </div>
        <div className="hype-progress-track">
          <div
            className={`hype-progress-fill ${isReady ? 'hype-progress-full' : ''}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Candidate cards: Styled as a playfield board */}
      <div className="flex-1 space-y-2.5 mb-5 bg-black/40 p-3.5 rounded-2xl border border-white/5 shadow-inner">
        {CANDIDATES.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            allocation={allocations[candidate.id] ?? 0}
            totalUsed={totalUsed}
            maxPoints={TOTAL_HYPE_POINTS}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
          />
        ))}
      </div>

      {/* Lock button */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <button
          className="hype-lock-btn"
          disabled={!isReady || locking}
          onClick={handleLock}
        >
          {locking ? '🔒 Locking…' : isReady ? '🔒 Ready to lock your hype' : `Spend exactly ${TOTAL_HYPE_POINTS} Hype Points before you lock`}
        </button>
      </div>

      {/* Launchpad Entry Point */}
      <div className="text-center mt-3 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
        <button
          onClick={onOpenLaunchpad}
          className="text-xs font-bold text-hype-purple hover:text-white transition-colors"
        >
          Nominate Tomorrow’s Meme 🚀
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-hype-text-muted text-center mt-4 px-2 leading-relaxed">
        Fictional Hype Points only. No real money. No crypto. No betting. Not connected to Reddit karma.
      </p>
    </div>
  );
};
