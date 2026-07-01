import { useState } from 'react';
import type { HypeAllocation, SettledResults, LeaderboardEntry, HypeCandidate } from '../../shared/types';
import { CANDIDATES } from '../data/candidates';
import { useLaunchpad } from '../hooks/useLaunchpad';
import { DailyLoopRail } from './DailyLoopRail';
import { YourNextMove } from './YourNextMove';

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
  const { submissions, userSubmissionId, curatedPreview, loading: launchpadLoading } = useLaunchpad();
  const [showNextBoard, setShowNextBoard] = useState(false);
  const [showRoundControls, setShowRoundControls] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyErrorMsg, setCopyErrorMsg] = useState<string | null>(null);
  const [copiedRally, setCopiedRally] = useState(false);
  const [copyRallyError, setCopyRallyError] = useState<string | null>(null);

  const winningMeme = CANDIDATES.find((c) => c.id === results.winningMemeId);
  const topNominee = submissions.length > 0 ? submissions[0] : null;

  const lockedPicks = allocations
    .filter((a) => a.points > 0)
    .sort((a, b) => b.points - a.points);
  const topPick = lockedPicks[0];
  const topCandidate = topPick ? CANDIDATES.find((c) => c.id === topPick.candidateId) : null;
  const userSubmission = submissions.find((s) => s.id === userSubmissionId);

  const handleCopyRally = async () => {
    let text: string;
    if (userSubmission) {
      const slogan = userSubmission.tagline || userSubmission.pitch;
      text = `Nominate my contender for tomorrow: ${userSubmission.emoji} ${userSubmission.name} — ${slogan}`;
    } else if (topCandidate) {
      const slogan = topCandidate.tagline || topCandidate.pitch;
      text = `I’m backing ${topCandidate.emoji} ${topCandidate.name} today. ${slogan} Who’s with me?`;
    } else {
      return;
    }

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

  // Analyze result feedback
  let feedbackText = 'Score reflects how closely your picks matched the final crowd-ranked board.';
  let feedbackIcon = '🎯';

  if (playerScore !== null) {
    const hasWinner = allocations.some((a) => a.candidateId === results.winningMemeId && a.points > 0);
    const sortedCandidates = [...results.candidates].sort((a, b) => b.finalHype - a.finalHype);
    const isTop2Underdog = (candId: string) => {
      const rankIdx = sortedCandidates.findIndex((c) => c.candidateId === candId);
      return rankIdx > 0 && rankIdx < 3; // Finished 2nd or 3rd
    };
    const backedUnderdog = allocations.some((a) => isTop2Underdog(a.candidateId) && a.points > 0);
    
    const winnerResult = results.candidates.find((c) => c.candidateId === results.winningMemeId);
    const hasCrowdDrag = winnerResult && winnerResult.crowdDrag > 10;

    if (hasWinner) {
      feedbackText = 'You backed the champion. Supporting today’s top contender boosted your score!';
      feedbackIcon = '🏆';
    } else if (backedUnderdog) {
      feedbackText = 'Contrarian Spark: your underdog finished near the top, earning points against the main crowd!';
      feedbackIcon = '⚡';
    } else if (hasCrowdDrag) {
      feedbackText = 'Crowd Drag: today’s winner suffered penalty points due to extreme popularity.';
      feedbackIcon = '👥';
    }
  }

  const handleCopyRecap = async () => {
    const memeName = winningMeme?.name || 'A contender';
    const emojiStr = winningMeme?.emoji || '';
    const text = playerScore !== null
      ? `🏆 Daily Hype Battle Recap: ${memeName} ${emojiStr} is today’s Hype Champion! My Alignment Score: ${playerScore} Hype Points (Streak: ${streak} round${streak === 1 ? '' : 's'} 🔥). Nominate tomorrow’s meme on Daily Hype Battle.`
      : `🏆 Daily Hype Battle Recap: ${memeName} ${emojiStr} is today’s Hype Champion! Nominate tomorrow’s meme on Daily Hype Battle.`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error('Clipboard API not available');
      }
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      setCopyErrorMsg(text);
      setTimeout(() => setCopyErrorMsg(null), 8000);
    }
  };

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
    <div className="hype-shell px-4 py-6 animate-fade-in-up">
      {/* Status strip */}
      <div className="text-center mb-3">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-game-sm font-black uppercase tracking-wider bg-hype-purple/10 border border-hype-purple/30 text-hype-purple shadow-[0_0_12px_rgba(168,85,247,0.1)]">
          🏆 The crowd has spoken
        </span>
      </div>

      {/* Daily Loop Rail */}
      <div className="mb-4">
        <DailyLoopRail currentStage="reveal" />
      </div>

      <YourNextMove state={playerScore !== null ? 'settled_voter' : 'settled_spectator'} />

      {/* Header */}
      <div className="text-center mb-5">
        <div className="text-4xl mb-2 animate-bounce">🏆</div>
        <h1 className="text-game-xl font-black text-hype-text tracking-tight uppercase">
          The Crowd Has Spoken!
        </h1>
        {playerScore === null ? (
          <div className="mt-2.5 animate-fade-in-up">
            <p className="text-hype-accent text-game-lg font-black uppercase tracking-wider">
              You arrived after the reveal.
            </p>
            <p className="text-hype-text-dim text-game-md mt-1 leading-relaxed max-w-xs mx-auto font-medium">
              Today’s picks are closed, but tomorrow’s board is forming.
            </p>
          </div>
        ) : (
          <p className="text-hype-text-dim text-game-md mt-1.5 leading-relaxed max-w-xs mx-auto">
            The crowd has spoken. Today’s picks are closed. You can still help shape tomorrow’s board.
          </p>
        )}
      </div>

      {/* Strong Champion Reveal Section */}
      {winningMeme && (
        <div className="podium-stage px-5 py-5 text-center mb-5 relative overflow-hidden animate-fade-in-up">
          {/* Champion tag */}
          <div className="absolute top-0 right-0 bg-hype-accent text-white text-game-sm uppercase font-black px-2.5 py-0.5 rounded-bl-lg">
            Champion
          </div>
          
          <span className="text-game-sm uppercase font-black text-hype-accent tracking-widest bg-hype-accent/15 border border-hype-accent/35 px-2.5 py-0.5 rounded-full inline-block mb-3">
            👑 Crowned Winner
          </span>
          <div className="text-6xl mb-3">{winningMeme.emoji}</div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">
            {winningMeme.name}
          </h2>
          <span className="text-game-sm text-hype-purple font-extrabold block mt-0.5">
            {winningMeme.tag}
          </span>
          <p className="text-game-md text-hype-text-dim mt-2.5 max-w-[240px] mx-auto italic leading-relaxed">
            "{winningMeme.pitch}"
          </p>
          <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-game-sm px-1.5 font-mono">
            <span className="text-hype-text-dim uppercase tracking-wider">Final Hype Score:</span>
            <span className="font-black text-white text-game-lg">
              {results.candidates.find(c => c.candidateId === results.winningMemeId)?.finalHype} pts
            </span>
          </div>
        </div>
      )}

      {/* Performance & Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Streak card */}
        <div className="hype-card px-3 py-3 text-center bg-white/5 border-white/10 flex flex-col justify-center items-center">
          <span className="text-2xl">🔥</span>
          <span className="text-game-sm text-hype-text-dim uppercase font-bold tracking-wider mt-1">Streak</span>
          <span className="text-game-lg font-black text-white mt-0.5">{streak} Rounds</span>
        </div>
        {/* Score card */}
        <div className="hype-card px-3 py-3 text-center bg-white/5 border-white/10 flex flex-col justify-center items-center">
          <span className="text-2xl">🎯</span>
          <span className="text-game-sm text-hype-text-dim uppercase font-bold tracking-wider mt-1">Your Score</span>
          <span className="text-game-lg font-black text-white mt-0.5">
            {playerScore !== null ? `${playerScore} pts` : '--'}
          </span>
          {playerScore === null && (
            <span className="text-game-sm text-hype-text-muted mt-1 font-semibold">Watched after the reveal</span>
          )}
        </div>
      </div>

      {/* Player Feedback Card */}
      <div className="hype-card px-4 py-3 bg-white/5 border-white/10 mb-4 animate-fade-in-up">
        <div className="flex items-start gap-2.5">
          <span className="text-2xl mt-0.5 flex-shrink-0">{feedbackIcon}</span>
          <div className="text-left min-w-0">
            <span className="block text-game-xs uppercase font-black tracking-wider text-hype-text-dim">
              Performance Feedback
            </span>
            <p className="text-game-sm text-white mt-1 leading-relaxed font-semibold">
              {feedbackText}
            </p>
          </div>
        </div>
      </div>

      {/* Shareable Recap Helper */}
      <div className="mb-5 text-center flex flex-col gap-2">
        <button
          onClick={handleCopyRecap}
          className="hype-cta-secondary !w-full !max-w-sm !py-2.5 text-game-md !bg-hype-purple/5 !border-hype-purple/20 text-hype-text-dim hover:text-white"
        >
          {copied ? '✓ Recap Copied to Clipboard!' : '📋 Copy Shareable Recap'}
        </button>
        {copyErrorMsg && (
          <div className="mt-2 p-2 bg-black/45 border border-white/10 rounded-xl text-game-sm text-hype-text-dim text-left break-all select-all">
            <span className="text-hype-accent font-bold">Copy manually:</span> {copyErrorMsg}
          </div>
        )}

        {(userSubmission || topCandidate) && (
          <div className="text-center">
            <button
              onClick={handleCopyRally}
              className="hype-cta-secondary !w-full !max-w-sm !py-2 text-game-sm bg-transparent border border-hype-accent/30 text-hype-accent hover:bg-hype-accent/10 hover:text-white"
            >
              {copiedRally 
                ? '✓ Rally Comment Copied!' 
                : userSubmission 
                  ? '📣 Copy Nomination Rally Comment' 
                  : '📣 Copy Today’s Backing Rally'}
            </button>
            {copyRallyError && (
              <div className="mt-2 p-2 bg-black/45 border border-white/10 rounded-xl text-game-xs text-hype-text-dim text-left break-all select-all leading-normal">
                <span className="text-hype-accent font-bold">Copy manually:</span> {copyRallyError}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Badges Section */}
      {badges.length > 0 && (
        <div className="hype-card px-4 py-3 bg-white/5 border-white/10 mb-5 animate-fade-in-up">
          <h3 className="text-game-sm font-black uppercase tracking-wider text-hype-text-dim text-center mb-2.5">
            🏆 Earned Badges
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {badges.map((badge) => (
              <div
                key={badge}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-game-md font-extrabold bg-white/5 border border-white/10 text-white shadow-sm"
              >
                {badge === 'Meme Prophet' && <span title="Meme Prophet">🔮</span>}
                {badge === 'Contrarian Spark' && <span title="Contrarian Spark">⚡</span>}
                {badge === 'First Lock' && <span title="First Lock">🔒</span>}
                <div className="text-left">
                  <span className="block text-game-md leading-none">{badge}</span>
                  <span className="block text-game-xs text-hype-text-dim font-normal mt-1 leading-none">
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
          <h3 className="text-game-sm font-black uppercase tracking-wider text-hype-text-dim mb-1 flex items-center gap-1.5">
            👑 Player Leaderboard
          </h3>
          <p className="text-game-sm text-hype-text-dim mb-3 leading-relaxed font-medium">
            Score reflects today’s alignment with the crowd. Streak shows consecutive rounds played.
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {leaderboard.map((entry, index) => {
              const isCurrentUser = entry.username === username;
              return (
                <div
                  key={entry.username}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-game-md transition-all ${
                    isCurrentUser
                      ? 'bg-hype-accent/15 border border-hype-accent/30 text-white font-bold shadow-[0_0_12px_rgba(249,115,22,0.1)]'
                      : 'bg-white/5 text-hype-text'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-hype-text-dim text-game-md">#{index + 1}</span>
                    <span className="truncate max-w-[150px] text-game-md">u/{entry.username}</span>
                    {isCurrentUser && (
                      <span className="bg-hype-accent text-white text-game-xs uppercase font-black px-1.5 py-0.5 rounded-md">
                        You
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-black text-game-lg text-white">{entry.score} pts</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Final Hype Board Standings List */}
      <div className="space-y-3 mb-5">
        <h3 className="text-game-sm font-black uppercase tracking-wider text-hype-text-dim px-1 flex items-center gap-1.5">
          📊 Final Hype Board <span className="text-game-sm font-normal lowercase text-hype-text-dim">(Tap cards for breakdown)</span>
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
                  <span className="text-game-md font-mono text-hype-text-dim w-4">
                    #{index + 1}
                  </span>
                  <span className="text-2xl flex-shrink-0">{cand.emoji}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-game-lg text-hype-text truncate">
                        {cand.name}
                      </span>
                    </div>
                    {userPoints > 0 ? (
                       <span className="inline-flex items-center gap-1 text-game-sm text-hype-green font-semibold mt-0.5">
                        ⚡ You boosted: {userPoints} pts
                      </span>
                    ) : (
                      <span className="text-game-sm text-hype-text-dim block mt-0.5">
                        No boosts allocated
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-game-lg font-black text-white block">
                    {cand.finalHype}
                  </span>
                  <span className="text-game-xs text-hype-text-dim block uppercase font-bold tracking-wider">
                    Hype pts
                  </span>
                </div>
              </div>

              {/* Expandable Breakdown details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2.5 border-t border-white/5 bg-black/20 text-game-sm space-y-2.5 animate-fade-in-up">
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
                  <div className="pt-2.5 border-t border-white/5 flex justify-between items-center font-bold text-white font-mono text-game-md">
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
        <span className="text-game-sm font-black text-hype-purple block uppercase tracking-wider">
          🚀 Tomorrow’s Board Is Forming
        </span>
        <p className="text-game-sm text-hype-text-dim mt-1.5 leading-relaxed max-w-xs mx-auto">
          Top community nominees can enter a future board. Support existing nominees or nominate your own contender to shape tomorrow’s card!
        </p>
        
        {launchpadLoading ? (
          <p className="text-game-md text-hype-text-dim mt-3.5 animate-pulse">Loading nominees...</p>
        ) : curatedPreview && curatedPreview.nominees.length > 0 ? (
          <div className="mt-3.5 space-y-2 text-left">
            {curatedPreview.nominees.map((nom, index) => (
              <div key={nom.id} className="p-2.5 bg-black/40 border border-white/5 rounded-xl flex items-center gap-3 text-game-sm">
                <span className="text-2xl flex-shrink-0">{nom.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-game-lg text-white truncate">{nom.name}</span>
                    {index === 0 && (
                      <span className="bg-hype-accent/15 border border-hype-accent/30 text-hype-accent text-game-xs uppercase font-black px-1.5 py-0.5 rounded leading-none">
                        Preview Leader
                      </span>
                    )}
                    {nom.id === userSubmissionId && (
                      <span className="bg-hype-purple/20 border border-hype-purple/40 text-hype-purple text-game-xs uppercase font-black px-1.5 py-0.5 rounded leading-none">
                        Your Contender
                      </span>
                    )}
                  </div>
                  <p className="text-game-sm text-hype-text-dim truncate mt-0.5">"{nom.pitch}"</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="block font-black text-game-lg text-white">⚡ {nom.supportCount}</span>
                  <span className="block text-game-xs text-hype-text-dim">Supports</span>
                </div>
              </div>
            ))}
          </div>
        ) : topNominee ? (
          <div className="mt-3.5 p-3 bg-black/40 border border-white/5 rounded-xl text-left flex items-center gap-3">
            <span className="text-3xl flex-shrink-0">{topNominee.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-game-lg text-white truncate">{topNominee.name}</span>
                <span className="bg-hype-accent/15 border border-hype-accent/30 text-hype-accent text-game-xs uppercase font-black px-1.5 py-0.5 rounded leading-none">
                  Leading Nominee
                </span>
                {topNominee.id === userSubmissionId && (
                  <span className="bg-hype-purple/20 border border-hype-purple/40 text-hype-purple text-game-xs uppercase font-black px-1.5 py-0.5 rounded leading-none">
                    Your Contender
                  </span>
                )}
              </div>
              <p className="text-game-sm text-hype-text-dim truncate mt-0.5">{topNominee.pitch}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="block font-black text-game-lg text-white">⚡ {topNominee.supportCount}</span>
              <span className="block text-game-xs text-hype-text-dim">Supports</span>
            </div>
          </div>
        ) : (
          <div className="mt-3.5 py-4 px-3 bg-black/40 border border-white/5 rounded-xl text-center">
            <p className="text-game-md text-hype-text-dim leading-relaxed font-semibold">
              No nominees yet. Be the first to nominate tomorrow’s contender!
            </p>
          </div>
        )}

        <p className="text-game-md text-hype-text-dim mt-4 max-w-[280px] mx-auto leading-relaxed">
          <span className="text-white font-semibold">Next Action:</span> Nominate tomorrow’s meme and support the best ideas!
        </p>

        <button
          onClick={onOpenLaunchpad}
          className="hype-lock-btn text-game-lg !py-2.5 bg-gradient-to-r from-hype-accent to-hype-purple text-white mt-3 hover:opacity-90 animate-fade-in-up"
        >
          Nominate Tomorrow’s Meme 🚀
        </button>
      </div>

      {/* Round Controls */}
      <div className="mt-auto pt-4 border-t border-white/5 text-center">
        <button
          onClick={() => setShowRoundControls((prev) => !prev)}
          className="text-game-sm font-black uppercase tracking-wider text-hype-text-muted hover:text-white transition-colors"
        >
          {showRoundControls ? '⚙️ Hide Round Controls' : '⚙️ Show Round Controls'}
        </button>

        {showRoundControls && (
          <div className="mt-3 p-3 bg-black/30 border border-white/5 rounded-xl animate-fade-in-up text-center max-w-sm mx-auto">
            <p className="text-game-sm text-hype-text-dim text-center mb-3 leading-relaxed">
              Use these controls to reveal results or inspect tomorrow's board.
            </p>
            <div className="flex flex-col gap-2">
              <button
                className="hype-lock-btn text-game-md !py-2.5 bg-transparent border border-white/10 text-hype-text-dim hover:text-white hover:bg-white/5 hover:border-white/20 animate-fade-in-up"
                onClick={onRecalculate}
                disabled={settling}
              >
                {settling ? '⚙️ Revealing Results…' : 'Reveal Results 🏆'}
              </button>
              
              <button
                className="hype-lock-btn text-game-md !py-2.5 bg-transparent border border-white/10 text-hype-text-dim hover:text-white hover:bg-white/5 hover:border-white/20 animate-fade-in-up"
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
          <p className="text-game-md text-hype-danger text-center mt-2 font-medium">
            Error: {error}
          </p>
        )}
      </div>

      {/* Safety Footer Disclaimer */}
      <p className="text-game-xs text-hype-text-muted text-center mt-5 leading-relaxed px-2">
        Fictional Hype Points only. No real money. No crypto. No betting. Not connected to Reddit karma.
      </p>
    </div>
  );
};
