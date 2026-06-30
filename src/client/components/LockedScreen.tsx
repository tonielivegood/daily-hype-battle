import { useState } from 'react';
import type { HypeAllocation, HypeCandidate } from '../../shared/types';
import { CANDIDATES } from '../data/candidates';
import { useLaunchpad } from '../hooks/useLaunchpad';

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
      <div className="text-center mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-hype-accent/10 border border-hype-accent/30 text-hype-accent shadow-[0_0_12px_rgba(249,115,22,0.1)]">
          🔒 Picks are locked
        </span>
      </div>

      {/* Celebration header */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">🔒</div>
        <h1 className="text-2xl font-black text-hype-text tracking-tight">
          Your Hype Is Locked
        </h1>
        <p className="text-hype-accent text-xs font-bold uppercase tracking-wider mt-1.5">
          Your picks are sealed for today
        </p>
      </div>

      {/* Locked allocations cards list styled as an arcade receipt ticket */}
      <div className="w-full max-w-sm arcade-ticket p-5 relative overflow-hidden mb-6 animate-fade-in-up">
        {/* Ticket stamp punched effect */}
        <div className="ticket-stamp select-none">LOCKED</div>
        
        {/* Ticket header */}
        <div className="flex justify-between items-center pb-3 border-b border-dashed border-white/20 mb-3.5 text-hype-text-dim text-[10px] font-mono tracking-widest uppercase">
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
                    <span className="font-bold text-sm text-white truncate block">
                      {candidate.name}
                    </span>
                    <span className="text-[10px] text-hype-text-dim block">
                      {candidate.tag}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-black text-sm text-hype-accent bg-hype-accent/10 border border-hype-accent/30 rounded-lg px-2.5 py-1">
                    {alloc.points} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ticket footer summary */}
        <div className="mt-4 pt-3 border-t border-dashed border-white/20 flex justify-between items-center text-xs font-mono">
          <span className="text-hype-text-dim uppercase tracking-wider">Total Hype Locked:</span>
          <span className="font-black text-white text-sm">{totalPoints} pts</span>
        </div>
      </div>

      {/* Come back message & Launchpad CTA */}
      <div className="hype-card px-5 py-4 text-center max-w-sm w-full mb-6">
        <p className="text-base font-extrabold text-hype-text">
          ⏳ Your picks are sealed for today.
        </p>
        <p className="text-xs text-hype-text-dim mt-1.5 mb-4 leading-relaxed">
          The reveal happens after the round settles. Come back tomorrow to see how the crowd voted.
        </p>
        <div className="border-t border-white/5 pt-3.5">
          <p className="text-xs text-hype-accent font-bold mb-1.5">
            While you wait:
          </p>
          <ul className="text-[11px] text-hype-text-dim space-y-1 mb-4 inline-block text-left">
            <li>• Nominate tomorrow’s contender.</li>
            <li>• Support community nominees.</li>
          </ul>
          <button
            onClick={onOpenLaunchpad}
            className="hype-lock-btn !py-2.5 !text-xs bg-gradient-to-r from-hype-accent to-hype-purple text-white hover:opacity-90"
          >
            Nominate Tomorrow’s Meme 🚀
          </button>
        </div>
      </div>

      {/* Judge Settlement Button (Test-only / Demo Settlement Trigger) */}
      <div className="w-full max-w-sm border-t border-white/5 pt-6 mb-6">
        <p className="text-[10px] text-hype-text-muted text-center mb-2.5 font-bold uppercase tracking-wider">
          ⚙️ Judge Panel (Demo Settle Control)
        </p>
        <div className="flex flex-col gap-2">
          <button
            className="hype-lock-btn !py-2.5 !text-xs !bg-transparent border border-white/10 text-hype-text-dim hover:text-white hover:bg-white/5 hover:border-white/20"
            onClick={onSettle}
            disabled={settling}
          >
            {settling ? '⚙️ Settling Round…' : '⚡ Settle Demo Round (Judge Action)'}
          </button>
          
          <button
            className="hype-lock-btn !py-2.5 !text-xs !bg-transparent border border-white/10 text-hype-text-dim hover:text-white hover:bg-white/5 hover:border-white/20"
            onClick={() => setShowNextBoard((prev) => !prev)}
          >
            {showNextBoard ? '👁️ Hide Next Board Preview' : '👁️ Preview Next Board'}
          </button>
        </div>

        {showNextBoard && (
          <div className="mt-4 pt-3.5 border-t border-white/5 text-left animate-fade-in-up">
            <span className="block text-[10px] font-black uppercase text-hype-purple tracking-wider mb-2">
              🔮 Tomorrow's Arena Card Line-up (Preview)
            </span>
            <div className="space-y-2 bg-black/40 p-3 rounded-xl border border-white/5 shadow-inner">
              {nextBoardList.map((item, index) => {
                const isCurated = index < curatedNominees.length;
                return (
                  <div key={item.id} className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 text-xs">
                    <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-white truncate">{item.name}</span>
                        {isCurated ? (
                          <span className="bg-hype-accent/15 border border-hype-accent/30 text-hype-accent text-[8px] uppercase font-black px-1.5 py-0.5 rounded leading-none">
                            Curated Candidate
                          </span>
                        ) : (
                          <span className="bg-white/5 border border-white/10 text-hype-text-dim text-[8px] uppercase font-black px-1.5 py-0.5 rounded leading-none">
                            Default Candidate
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-hype-text-dim truncate mt-0.5">"{item.pitch}"</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[9px] text-hype-text-muted mt-2 text-center leading-relaxed">
              This preview lists tomorrow's candidates. It is generated dynamically for testing.
            </p>
          </div>
        )}

        {error && (
          <p className="text-xs text-hype-danger text-center mt-2 font-medium">
            Error: {error}
          </p>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-hype-text-muted text-center max-w-xs leading-relaxed px-4 mt-auto">
        Fictional Hype Points only. No real money. No crypto. No betting.
        Not connected to Reddit karma.
      </p>
    </div>
  );
};
