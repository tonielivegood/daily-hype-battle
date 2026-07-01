import { useState } from 'react';
import type { HypeAllocation, HypeCandidate } from '../../shared/types';
import { CANDIDATES } from '../data/candidates';
import { useLaunchpad } from '../hooks/useLaunchpad';
import { DailyLoopRail } from './DailyLoopRail';
import { YourNextMove } from './YourNextMove';

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
  const { submissions, userSubmissionId, curatedPreview, loading: launchpadLoading } = useLaunchpad();
  const [showNextBoard, setShowNextBoard] = useState(false);
  const [showRoundControls, setShowRoundControls] = useState(false);
  const [copiedRally, setCopiedRally] = useState(false);
  const [copyRallyError, setCopyRallyError] = useState<string | null>(null);

  const lockedPicks = allocations
    .filter((a) => a.points > 0)
    .sort((a, b) => b.points - a.points);

  const totalPoints = lockedPicks.reduce((sum, item) => sum + item.points, 0);

  const topPick = lockedPicks[0];
  const topCandidate = topPick ? CANDIDATES.find((c) => c.id === topPick.candidateId) : null;

  const handleCopyRally = async () => {
    if (!topCandidate) return;
    const slogan = topCandidate.tagline || topCandidate.pitch;
    const text = `I’m backing ${topCandidate.emoji} ${topCandidate.name} today. ${slogan} Who’s with me?`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopiedRally(true);
        setTimeout(() => setCopiedRally(false), 2000);
      } else {
        throw new Error('Clipboard API not available');
      }
    } catch (err) {
      setCopyRallyError(text);
      setTimeout(() => setCopyRallyError(null), 8000);
    }
  };

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
      imageUrl: nom.imageUrl,
      frameTheme: nom.frameTheme,
      tagline: nom.tagline,
      creatorUsername: nom.creatorUsername || nom.authorUsername,
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

      <YourNextMove state="locked" />

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

        {topCandidate && (
          <div className="mt-3.5 pt-3 border-t border-dashed border-white/20 text-center">
            <button
              onClick={handleCopyRally}
              className="w-full text-game-sm font-black py-2 px-3 bg-hype-accent/10 border border-hype-accent/30 text-hype-accent hover:bg-hype-accent/20 hover:text-white rounded-xl transition-all uppercase tracking-wider"
            >
              {copiedRally ? '✓ Rally Comment Copied!' : '📣 Share Rally Comment'}
            </button>
            {copyRallyError && (
              <div className="mt-2 p-2 bg-black/45 border border-white/10 rounded-xl text-game-xs text-hype-text-dim text-left break-all select-all leading-normal">
                <span className="text-hype-accent font-bold">Copy manually:</span> {copyRallyError}
              </div>
            )}
          </div>
        )}
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
          <p className="text-game-md text-hype-accent font-bold mb-1.5">
            Tomorrow’s board is forming now.
          </p>
          <p className="text-game-sm text-hype-text-dim mb-3 leading-relaxed max-w-[285px] mx-auto">
            Community nominees can become future contenders. Nominate tomorrow’s meme or support others to shape the board!
          </p>

          {/* Nominee previews with "Your contender" tag */}
          {launchpadLoading ? (
            <p className="text-game-sm text-hype-text-dim mt-2 mb-3 animate-pulse">Loading nominees...</p>
          ) : submissions && submissions.length > 0 ? (
            <div className="my-3.5 space-y-2 text-left">
              {[...submissions]
                .sort((a, b) => b.supportCount - a.supportCount)
                .slice(0, 3)
                .map((nom) => {
                  const isUserNom = nom.id === userSubmissionId;
                  return (
                    <div key={nom.id} className="p-2 bg-black/35 border border-white/5 rounded-xl flex items-center justify-between text-game-sm">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-xl flex-shrink-0">{nom.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-white block truncate">{nom.name}</span>
                          {isUserNom && (
                            <span className="text-hype-purple text-[10px] uppercase font-black block">
                              Your contender
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 font-mono text-game-xs text-hype-text-dim font-bold">
                        ⚡ {nom.supportCount} supports
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : null}

          <button
            onClick={onOpenLaunchpad}
            className="hype-lock-btn text-game-lg !py-2.5 bg-gradient-to-r from-hype-accent to-hype-purple text-white hover:opacity-90 mt-2"
          >
            Nominate Tomorrow’s Meme 🚀
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
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-9 h-9 rounded-lg object-cover border border-white/10 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                              const sib = (e.target as HTMLElement).nextSibling as HTMLElement;
                              if (sib) sib.style.display = 'inline-block';
                            }}
                          />
                        ) : null}
                        <span
                          className="text-2xl flex-shrink-0 w-9 h-9 flex items-center justify-center bg-white/5 rounded-lg border border-white/5"
                          style={{ display: item.imageUrl ? 'none' : 'flex' }}
                        >
                          {item.emoji}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-game-lg text-white truncate">{item.name}</span>
                            {isCurated ? (
                              <span className="bg-hype-accent/15 border border-hype-accent/30 text-hype-accent text-game-xs uppercase font-black px-1.5 py-0.5 rounded leading-none">
                                Launchpad Pick
                              </span>
                            ) : (
                              <span className="bg-white/5 border border-white/10 text-hype-text-dim text-game-xs uppercase font-black px-1.5 py-0.5 rounded leading-none">
                                Community Nominee
                              </span>
                            )}
                            {item.id === userSubmissionId && (
                              <span className="bg-hype-purple/20 border border-hype-purple/40 text-hype-purple text-game-xs uppercase font-black px-1.5 py-0.5 rounded leading-none">
                                Your Contender
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-baseline gap-2">
                            <p className="text-game-sm text-hype-text-dim truncate mt-0.5 flex-1">"{item.pitch}"</p>
                            {item.creatorUsername && (
                              <span className="text-[10px] text-hype-text-muted flex-shrink-0 font-medium">by u/{item.creatorUsername}</span>
                            )}
                          </div>
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
