import { useState } from 'react';
import type { HypeAllocation, HypeCandidate } from '../../shared/types';
import { CANDIDATES } from '../data/candidates';
import { useLaunchpad } from '../hooks/useLaunchpad';
import { DailyLoopRail } from './DailyLoopRail';

type LockedScreenProps = {
  allocations: HypeAllocation[];
  onSettle: () => Promise<void>;
  settling: boolean;
  error: string | null;
  onOpenLaunchpad: () => void;
};

export const LockedScreen = ({
  allocations,
  onSettle,
  settling,
  error,
  onOpenLaunchpad,
}: LockedScreenProps) => {
  const { curatedPreview } = useLaunchpad();
  const [showNextBoard, setShowNextBoard] = useState(false);
  const [showRoundControls, setShowRoundControls] = useState(false);

  const lockedPicks = allocations
    .filter((a) => a.points > 0)
    .sort((a, b) => b.points - a.points);

  const totalPoints = lockedPicks.reduce((sum, item) => sum + item.points, 0);

  const curatedNominees = curatedPreview?.nominees || [];
  const nextBoardList: HypeCandidate[] = [];

  // 1. Add curated nominees
  curatedNominees.forEach((nom) => {
    nextBoardList.push({
      id: nom.id,
      emoji: nom.emoji,
      name: nom.name,
      tag: nom.tag,
      pitch: nom.pitch,
    });
  });

  // 2. Add defaults from CANDIDATES to reach exactly 5
  for (const fallback of CANDIDATES) {
    if (nextBoardList.length >= 5) break;
    if (!nextBoardList.some((item) => item.name.toLowerCase() === fallback.name.toLowerCase())) {
      nextBoardList.push(fallback);
    }
  }

  return (
    <div className="hype-shell items-center px-5 py-8 animate-fade-in-up">
      {/* Status strip */}
      <div className="text-center mb-3">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-game-sm font-black uppercase tracking-wider bg-hype-accent/10 border border-hype-accent/30 text-hype-accent shadow-[0_0_12px_rgba(249,115,22,0.1)]">
          🔒 Your hype is locked
        </span>
      </div>

      {/* Daily Loop Rail */}
      <div className="w-full mb-5">
        <DailyLoopRail currentStage="lock" />
      </div>

      {/* Celebration header */}
      <div className="text-center mb-5">
        <div className="text-5xl mb-2">🔒</div>
        <h1 className="text-game-xl font-black text-hype-text tracking-tight animate-fade-in-up">
          Your Hype Is Locked 🔒
        </h1>
        <p className="text-hype-text-dim text-game-md font-medium mt-1.5 leading-relaxed max-w-xs mx-auto animate-fade-in-up">
          Your hype is locked. Come back for the reveal. You can still nominate tomorrow’s meme.
        </p>
      </div>

      {/* Locked allocations cards list styled as an arcade receipt ticket */}
      <div className="w-full max-w-sm arcade-ticket p-5 relative overflow-hidden mb-6 animate-fade-in-up">
        {/* Ticket stamp punched effect */}
        <div className="ticket-stamp select-none">LOCKED</div>
        
        {/* Ticket header */}
        <div className="flex justify-between items-center pb-3 border-b border-dashed border-white/20 mb-3.5 text-hype-text-dim text-game-sm font-mono tracking-widest uppercase">
          <span>Hype Ticket</span>
          <span>Verified Receipt</span>
        </div>

        {/* Selected candidates */}
        <div className="space-y-3">
          {lockedPicks.map((alloc) => {
            const candidate = CANDIDATES.find((c) => c.id === alloc.candidateId);
            if (!candidate) return null;

            return (
              <div
                key={alloc.candidateId}
                className="flex items-center justify-between py-0.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-2xl flex-shrink-0">{candidate.emoji}</span>
                  <div className="min-w-0">
                    <span className="font-bold text-game-lg text-white truncate block">
                      {candidate.name}
                    </span>
                    <span className="text-game-sm text-hype-text-dim block">
                      {candidate.tag}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-black text-game-lg text-hype-accent bg-hype-accent/10 border border-hype-accent/30 rounded-lg px-2.5 py-1">
                    {alloc.points} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ticket footer summary */}
        <div className="mt-4 pt-3 border-t border-dashed border-white/20 flex justify-between items-center text-game-md font-mono">
          <span className="text-hype-text-dim uppercase tracking-wider">Total Hype Locked:</span>
          <span className="font-black text-white text-game-lg">{totalPoints} pts</span>
        </div>
      </div>

      {/* Come back message & Launchpad CTA */}
      <div className="hype-card px-5 py-4 text-center max-w-sm w-full mb-6">
        <p className="text-game-lg font-extrabold text-white">
          Your Hype Is Locked 🔒
        </p>
        <p className="text-game-md text-hype-text-dim mt-1.5 mb-4 leading-relaxed">
          Come back for the reveal. The crowd decides the winner once results are announced.
        </p>
        <div className="border-t border-white/5 pt-3.5">
          <p className="text-game-md text-hype-accent font-bold mb-2">
            While you wait, nominate tomorrow's meme:
          </p>
          <p className="text-game-md text-hype-text-dim mb-4 leading-relaxed max-w-[285px] mx-auto">
            Submit a contender (1 per player) or support community nominees to shape tomorrow's card.
          </p>
          <button
            onClick={onOpenLaunchpad}
            className="hype-lock-btn text-game-lg !py-2.5 bg-gradient-to-r from-hype-accent to-hype-purple text-white hover:opacity-90 animate-pulse"
          >
            Nominate Tomorrow's Meme 🚀
          </button>
        </div>
      </div>

      {/* Round Controls */}
      <div className="w-full max-w-sm border-t border-white/5 pt-4 mb-4 text-center">
        <button
          onClick={() => setShowRoundControls((prev) => !prev)}
          className="text-game-sm font-black uppercase tracking-wider text-hype-text-muted hover:text-white transition-colors"
        >
          {showRoundControls ? '⚙️ Hide Round Controls' : '⚙️ Show Round Controls'}
        </button>

        {showRoundControls && (
          <div className="mt-3 p-3 bg-black/30 border border-white/5 rounded-xl animate-fade-in-up text-center">
            <p className="text-game-sm text-hype-text-dim text-center mb-3 leading-relaxed">
              Use these controls to reveal results or inspect tomorrow's board.
            </p>
            <div className="flex flex-col gap-2">
              <button
                className="hype-lock-btn text-game-md !py-2.5 !bg-transparent border border-white/10 text-hype-text-dim hover:text-white hover:bg-white/5 hover:border-white/20"
                onClick={onSettle}
                disabled={settling}
              >
                {settling ? '⚙️ Revealing Results…' : 'Reveal Results 🏆'}
              </button>
              
              <button
                className="hype-lock-btn text-game-md !py-2.5 !bg-transparent border border-white/10 text-hype-text-dim hover:text-white hover:bg-white/5 hover:border-white/20"
                onClick={() => setShowNextBoard((prev) => !prev)}
              >
                {showNextBoard ? '👁️ Hide Tomorrow\'s Board' : '👁️ See Tomorrow\'s Board 👀'}
              </button>
            </div>

            {showNextBoard && (
              <div className="mt-4 pt-3.5 border-t border-white/5 text-left animate-fade-in-up">
                <span className="block text-game-sm font-black uppercase text-hype-purple tracking-wider mb-2">
                  🔮 Tomorrow's Arena Card Line-up
                </span>
                <div className="space-y-2 bg-black/40 p-3 rounded-xl border border-white/5 shadow-inner">
                  {nextBoardList.map((item, index) => {
                    const isCurated = index < curatedNominees.length;
                    return (
                      <div key={item.id} className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 text-game-sm">
                        <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-game-lg text-white truncate">{item.name}</span>
                            {isCurated ? (
                              <span className="bg-hype-accent/15 border border-hype-accent/30 text-hype-accent text-game-xs uppercase font-black px-1.5 py-0.5 rounded leading-none">
                                Curated Candidate
                              </span>
                            ) : (
                              <span className="bg-white/5 border border-white/10 text-hype-text-dim text-game-xs uppercase font-black px-1.5 py-0.5 rounded leading-none">
                                Default Candidate
                              </span>
                            )}
                          </div>
                          <p className="text-game-sm text-hype-text-dim truncate mt-0.5">"{item.pitch}"</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-game-sm text-hype-text-muted mt-2 text-center leading-relaxed">
                  This lists tomorrow's candidates. Candidates are generated dynamically from curations.
                </p>
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="text-xs text-hype-danger text-center mt-2 font-medium">
            Error: {error}
          </p>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-game-xs text-hype-text-muted text-center max-w-xs leading-relaxed px-4 mt-auto">
        Fictional Hype Points only. No real money. No crypto. No betting.
        Not connected to Reddit karma.
      </p>
    </div>
  );
};
