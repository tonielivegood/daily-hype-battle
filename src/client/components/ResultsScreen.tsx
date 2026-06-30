import { useState } from 'react';
import type { HypeAllocation, SettledResults, LeaderboardEntry, HypeCandidate } from '../../shared/types';
import { CANDIDATES } from '../data/candidates';
import { useLaunchpad } from '../hooks/useLaunchpad';

type ResultsScreenProps = {
  results: SettledResults;
  allocations: HypeAllocation[];
  playerScore: number | null;
  streak: number;
  badges: string[];
  leaderboard: LeaderboardEntry[];
  username: string;
  onRecalculate: () => Promise<void>;
  settling: boolean;
  error: string | null;
  onOpenLaunchpad: () => void;
};

export const ResultsScreen = ({
  results,
  allocations,
  playerScore,
  streak,
  badges,
  leaderboard,
  username,
  onRecalculate,
  settling,
  error,
  onOpenLaunchpad,
}: ResultsScreenProps) => {
  const [expandedMemeId, setExpandedMemeId] = useState<string | null>(null);
  const { submissions, curatedPreview, loading: launchpadLoading } = useLaunchpad();
  const [showNextBoard, setShowNextBoard] = useState(false);

  const winningMeme = CANDIDATES.find((c) => c.id === results.winningMemeId);
  const topNominee = submissions.length > 0 ? submissions[0] : null;

  const toggleExpand = (id: string) => {
    setExpandedMemeId((prev) => (prev === id ? null : id));
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
    <div className="hype-shell px-4 py-6 animate-fade-in-up">
      {/* Status strip */}
      <div className="text-center mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-hype-purple/10 border border-hype-purple/30 text-hype-purple shadow-[0_0_12px_rgba(168,85,247,0.1)]">
          🏆 The crowd has spoken
        </span>
      </div>

      {/* Header */}
      <div className="text-center mb-5">
        <div className="text-4xl mb-2 animate-bounce">🏆</div>
        <h1 className="text-2xl font-black text-hype-text tracking-tight uppercase">
          The Crowd Has Spoken!
        </h1>
        <p className="text-hype-text-dim text-xs mt-1.5 leading-relaxed max-w-xs mx-auto">
          Today's Hype Battle results are settled. Here is how the contenders ranked.
        </p>
      </div>

      {/* Strong Champion Reveal Section */}
      {winningMeme && (
        <div className="podium-stage px-5 py-5 text-center mb-5 relative overflow-hidden animate-fade-in-up">
          {/* Champion tag */}
          <div className="absolute top-0 right-0 bg-hype-accent text-white text-[9px] uppercase font-black px-2.5 py-0.5 rounded-bl-lg">
            Champion
          </div>
          
          <span className="text-[10px] uppercase font-black text-hype-accent tracking-widest bg-hype-accent/15 border border-hype-accent/35 px-2.5 py-0.5 rounded-full inline-block mb-3">
            👑 Crowned Winner
          </span>
          <div className="text-6xl mb-3">{winningMeme.emoji}</div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">
            {winningMeme.name}
          </h2>
          <span className="text-xs text-hype-purple font-extrabold block mt-0.5">
            {winningMeme.tag}
          </span>
          <p className="text-xs text-hype-text-dim mt-2.5 max-w-[240px] mx-auto italic leading-relaxed">
            "{winningMeme.pitch}"
          </p>
          <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-xs px-1.5 font-mono">
            <span className="text-hype-text-dim uppercase tracking-wider">Final Hype Score:</span>
            <span className="font-black text-white text-sm">
              {results.candidates.find(c => c.candidateId === results.winningMemeId)?.finalHype} pts
            </span>
          </div>
        </div>
      )}

      {/* Performance & Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Streak card */}
        <div className="hype-card px-3 py-3 text-center bg-white/5 border-white/10 flex flex-col justify-center items-center">
          <span className="text-2xl">🔥</span>
          <span className="text-[9px] text-hype-text-dim uppercase font-bold tracking-wider mt-1">Streak</span>
          <span className="text-sm font-black text-white mt-0.5">{streak} Rounds</span>
        </div>
        {/* Score card */}
        <div className="hype-card px-3 py-3 text-center bg-white/5 border-white/10 flex flex-col justify-center items-center">
          <span className="text-2xl">🎯</span>
          <span className="text-[9px] text-hype-text-dim uppercase font-bold tracking-wider mt-1">Your Score</span>
          <span className="text-sm font-black text-white mt-0.5">
            {playerScore !== null ? `${playerScore} pts` : '--'}
          </span>
        </div>
      </div>

      {/* Badges Showcase Section */}
      {badges.length > 0 && (
        <div className="hype-card px-4 py-3 bg-white/5 border-white/10 mb-5 animate-fade-in-up">
          <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-hype-text-dim text-center mb-2.5">
            🏆 Earned Badges
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {badges.map((badge) => (
              <div
                key={badge}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold bg-white/5 border border-white/10 text-white shadow-sm"
              >
                {badge === 'Meme Prophet' && <span title="Meme Prophet">🔮</span>}
                {badge === 'Contrarian Spark' && <span title="Contrarian Spark">⚡</span>}
                {badge === 'First Lock' && <span title="First Lock">🔒</span>}
                <div className="text-left">
                  <span className="block text-[10px] leading-none">{badge}</span>
                  <span className="block text-[7px] text-hype-text-dim font-normal mt-0.5 leading-none">
                    {badge === 'Meme Prophet' && 'Backed the champion'}
                    {badge === 'Contrarian Spark' && 'Boosted underdog top 2'}
                    {badge === 'First Lock' && 'First lock in round'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Player Leaderboard Section */}
      {leaderboard.length > 0 && (
        <div className="hype-card px-4 py-3.5 bg-white/5 border-white/10 mb-5">
          <h3 className="text-xs font-black uppercase tracking-wider text-hype-text-dim mb-3 flex items-center gap-1.5">
            👑 Player Leaderboard
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {leaderboard.map((entry, index) => {
              const isCurrentUser = entry.username === username;
              return (
                <div
                  key={entry.username}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                    isCurrentUser
                      ? 'bg-hype-accent/15 border border-hype-accent/30 text-white font-bold shadow-[0_0_12px_rgba(249,115,22,0.1)]'
                      : 'bg-white/5 text-hype-text'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-hype-text-dim">#{index + 1}</span>
                    <span className="truncate max-w-[150px]">u/{entry.username}</span>
                    {isCurrentUser && (
                      <span className="bg-hype-accent text-white text-[8px] uppercase font-black px-1.5 py-0.5 rounded-md">
                        You
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-black text-white">{entry.score} pts</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Final Hype Board Standings List */}
      <div className="space-y-3 mb-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-hype-text-dim px-1 flex items-center gap-1.5">
          📊 Final Hype Board <span className="text-[10px] font-normal lowercase text-hype-text-dim">(Tap cards for breakdown)</span>
        </h3>

        {results.candidates.map((cand, index) => {
          const userAlloc = allocations.find((a) => a.candidateId === cand.candidateId);
          const userPoints = userAlloc ? userAlloc.points : 0;
          const isExpanded = expandedMemeId === cand.candidateId;

          return (
            <div
              key={cand.candidateId}
              className={`hype-card transition-all duration-200 overflow-hidden cursor-pointer ${
                isExpanded ? 'border-hype-purple/40 bg-hype-card' : 'bg-hype-card/50'
              }`}
              onClick={() => toggleExpand(cand.candidateId)}
            >
              {/* Header Info */}
              <div className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono text-hype-text-dim w-4">
                    #{index + 1}
                  </span>
                  <span className="text-2xl flex-shrink-0">{cand.emoji}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-hype-text truncate">
                        {cand.name}
                      </span>
                    </div>
                    {userPoints > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-hype-green font-semibold mt-0.5">
                        ⚡ You boosted: {userPoints} pts
                      </span>
                    ) : (
                      <span className="text-[10px] text-hype-text-dim block mt-0.5">
                        No boosts allocated
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-black text-white block">
                    {cand.finalHype}
                  </span>
                  <span className="text-[8px] text-hype-text-dim block uppercase font-bold tracking-wider">
                    Hype pts
                  </span>
                </div>
              </div>

              {/* Expandable Breakdown details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2.5 border-t border-white/5 bg-black/20 text-xs space-y-2.5 animate-fade-in-up">
                  <div className="flex justify-between items-center text-hype-text-dim">
                    <span>Base Player Boosts:</span>
                    <span className="font-semibold text-hype-text">{cand.playerBoosts}</span>
                  </div>
                  <div className="flex justify-between items-center text-hype-text-dim">
                    <span>Pitch Heat (Meme quality):</span>
                    <span className="font-semibold text-hype-green">+{cand.pitchHeat}</span>
                  </div>
                  <div className="flex justify-between items-center text-hype-text-dim">
                    <span>Freshness (Viral index):</span>
                    <span className="font-semibold text-hype-green">+{cand.freshness}</span>
                  </div>
                  <div className="flex justify-between items-center text-hype-text-dim">
                    <span>Picker Diversity (User split):</span>
                    <span className="font-semibold text-hype-green">+{cand.pickerDiversity}</span>
                  </div>
                  <div className="flex justify-between items-center text-hype-text-dim">
                    <span>Tiny Chaos (Random noise):</span>
                    <span className="font-semibold text-hype-green">+{cand.tinyChaos}</span>
                  </div>
                  {cand.crowdDrag > 0 && (
                    <div className="flex justify-between items-center text-hype-danger">
                      <span>Crowd Drag Penalty (15% Max Popularity):</span>
                      <span className="font-bold">-{cand.crowdDrag}</span>
                    </div>
                  )}
                  <div className="pt-2.5 border-t border-white/5 flex justify-between items-center font-bold text-white font-mono">
                    <span>Total Calculated Hype:</span>
                    <span>{cand.finalHype} pts</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tomorrow's Contender Watch block */}
      <div className="hype-card px-5 py-4 bg-gradient-to-b from-hype-bg via-hype-purple/5 to-hype-purple/10 border-hype-purple/30 mb-5 text-center animate-fade-in-up">
        <span className="text-xs font-black text-hype-purple block uppercase tracking-wider">
          🚀 {curatedPreview ? 'Tomorrow’s Board Preview' : 'Tomorrow’s Board Is Forming'}
        </span>
        <p className="text-[10px] text-hype-text-dim mt-1.5 leading-relaxed max-w-xs mx-auto">
          Community picks are forming the next battle. Support or nominate a contender before the next reveal.
        </p>
        
        {launchpadLoading ? (
          <p className="text-[11px] text-hype-text-dim mt-3.5">Loading nominees...</p>
        ) : curatedPreview && curatedPreview.nominees.length > 0 ? (
          <div className="mt-3.5 space-y-2 text-left">
            {curatedPreview.nominees.map((nom, index) => (
              <div key={nom.id} className="p-2.5 bg-black/40 border border-white/5 rounded-xl flex items-center gap-3 text-xs">
                <span className="text-2xl flex-shrink-0">{nom.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-white truncate">{nom.name}</span>
                    {index === 0 && (
                      <span className="bg-hype-accent/15 border border-hype-accent/30 text-hype-accent text-[8px] uppercase font-black px-1.5 py-0.5 rounded leading-none">
                        Preview Leader
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-hype-text-dim truncate mt-0.5">"{nom.pitch}"</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="block font-black text-xs text-white">⚡ {nom.supportCount}</span>
                  <span className="block text-[8px] text-hype-text-dim">Supports</span>
                </div>
              </div>
            ))}
          </div>
        ) : topNominee ? (
          <div className="mt-3.5 p-3 bg-black/40 border border-white/5 rounded-xl text-left flex items-center gap-3">
            <span className="text-3xl flex-shrink-0">{topNominee.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-sm text-white truncate">{topNominee.name}</span>
                <span className="bg-hype-accent/15 border border-hype-accent/30 text-hype-accent text-[8px] uppercase font-black px-1.5 py-0.5 rounded leading-none">
                  Leading
                </span>
              </div>
              <p className="text-[10px] text-hype-text-dim truncate mt-0.5">{topNominee.tag}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="block font-black text-xs text-white">⚡ {topNominee.supportCount}</span>
              <span className="block text-[8px] text-hype-text-dim">Supports</span>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-hype-text-dim mt-3.5 leading-relaxed">
            No nominees yet. Launch the first contender.
          </p>
        )}

        <button
          onClick={onOpenLaunchpad}
          className="hype-lock-btn !py-2.5 !text-xs bg-gradient-to-r from-hype-accent to-hype-purple text-white mt-4 hover:opacity-90 animate-fade-in-up"
        >
          Open Launchpad 🚀
        </button>
      </div>

      {/* Recalculate Judge Button */}
      <div className="mt-auto pt-5 border-t border-white/5 text-center">
        <p className="text-[10px] text-hype-text-muted mb-2.5 font-bold uppercase tracking-wider">
          ⚙️ Judge Panel (Demo Settle & Preview Control)
        </p>
        <div className="flex flex-col gap-2 max-w-sm mx-auto">
          <button
            className="hype-lock-btn !py-2.5 !text-xs bg-transparent border border-white/10 text-hype-text-dim hover:text-white hover:bg-white/5 hover:border-white/20 animate-fade-in-up"
            onClick={onRecalculate}
            disabled={settling}
          >
            {settling ? '⚙️ Recalculating…' : '🔄 Settle Again (Judge Test Action)'}
          </button>
          
          <button
            className="hype-lock-btn !py-2.5 !text-xs bg-transparent border border-white/10 text-hype-text-dim hover:text-white hover:bg-white/5 hover:border-white/20 animate-fade-in-up"
            onClick={() => setShowNextBoard((prev) => !prev)}
          >
            {showNextBoard ? '👁️ Hide Next Board Preview' : '👁️ Preview Next Board'}
          </button>
        </div>

        {showNextBoard && (
          <div className="mt-4 pt-3.5 border-t border-white/5 text-left animate-fade-in-up max-w-sm mx-auto">
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
          <p className="text-[10px] text-hype-danger text-center mt-2 font-medium">
            Error: {error}
          </p>
        )}
      </div>

      {/* Safety Footer Disclaimer */}
      <p className="text-[9px] text-hype-text-muted text-center mt-5 leading-relaxed px-2">
        Fictional Hype Points only. No real money. No crypto. No betting. Not connected to Reddit karma.
      </p>
    </div>
  );
};
