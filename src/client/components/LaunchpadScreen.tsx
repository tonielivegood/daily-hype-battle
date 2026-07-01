import { useState, FormEvent } from 'react';
import { useLaunchpad } from '../hooks/useLaunchpad';
import { LoadingSpinner } from './LoadingSpinner';
import { CANDIDATES } from '../data/candidates';
import type { HypeCandidate } from '../../shared/types';
import { DailyLoopRail } from './DailyLoopRail';
import { YourNextMove } from './YourNextMove';
import { MemeCard } from './MemeCard';

type LaunchpadScreenProps = {
  onBack: () => void;
};

export const LaunchpadScreen = ({ onBack }: LaunchpadScreenProps) => {
  const {
    submissions,
    userSubmissionId,
    supportedIds,
    curatedPreview,
    loading,
    submitting,
    curating,
    error,
    curateError,
    submitIdea,
    supportIdea,
    curateLaunchpad,
  } = useLaunchpad();

  // Curation state
  const [curateSuccessMsg, setCurateSuccessMsg] = useState<string | null>(null);
  const [showNextBoard, setShowNextBoard] = useState(false);
  const [showRoundControls, setShowRoundControls] = useState(false);

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

  // Form states
  const [emoji, setEmoji] = useState('');
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [pitch, setPitch] = useState('');
  const [why, setWhy] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [frameTheme, setFrameTheme] = useState('Neon');
  const [tagline, setTagline] = useState('');
  const [imageFailed, setImageFailed] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);

  const handleCurate = async () => {
    setCurateSuccessMsg(null);
    const res = await curateLaunchpad();
    if (res.success) {
      setCurateSuccessMsg("Tomorrow's Board Preview curated successfully!");
    }
  };

  // Edit state
  const [isEditing, setIsEditing] = useState(false);

  // Find user's own submission to highlight it
  const userSubmission = submissions.find((s) => s.id === userSubmissionId);

  const [copiedRally, setCopiedRally] = useState(false);
  const [copyRallyError, setCopyRallyError] = useState<string | null>(null);

  const handleCopyRally = async () => {
    if (!userSubmission) return;
    const text = userSubmission.tagline
      ? `Nominate my contender for tomorrow: ${userSubmission.emoji} ${userSubmission.name} — ${userSubmission.tagline}`
      : `Nominate my contender for tomorrow: ${userSubmission.emoji} ${userSubmission.name} — ${userSubmission.pitch}`;
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSubmitSuccessMsg(null);

    const cleanEmoji = emoji.trim();
    const cleanName = name.trim();
    const cleanTag = tag.trim().startsWith('#') ? tag.trim() : `#${tag.trim()}`;
    const cleanPitch = pitch.trim();
    const cleanWhy = why.trim();
    const cleanImageUrl = imageUrl.trim() || undefined;
    const cleanFrameTheme = frameTheme.trim() || 'Neon';
    const cleanTagline = tagline.trim() || undefined;

    if (!cleanEmoji || !cleanName || !cleanTag || !cleanPitch || !cleanWhy) {
      setValidationError('All nomination fields are required.');
      return;
    }

    if (cleanPitch.length < 10 || cleanPitch.length > 90) {
      setValidationError('Pitch must be between 10 and 90 characters.');
      return;
    }

    if (cleanWhy.length < 10 || cleanWhy.length > 120) {
      setValidationError('Why it catches fire must be between 10 and 120 characters.');
      return;
    }

    if (cleanTagline && cleanTagline.length > 50) {
      setValidationError('Tagline must be under 50 characters.');
      return;
    }

    if (cleanImageUrl) {
      if (!cleanImageUrl.startsWith('http://') && !cleanImageUrl.startsWith('https://')) {
        setValidationError('Meme image URL must start with http:// or https://');
        return;
      }
    }

    // Safety checks: Reject URLs or spam links in text pitches and taglines
    const urlPattern = /https?:\/\/[^\s]+/;
    if (urlPattern.test(cleanPitch) || urlPattern.test(cleanWhy) || (cleanTagline && urlPattern.test(cleanTagline))) {
      setValidationError('Nomination pitches and taglines cannot contain web URL links.');
      return;
    }

    // Financial/Stock/Betting wording checks
    const forbidden = ['stock', 'trading', 'betting', 'crypto', 'portfolio', 'investment', 'wager', 'casino', 'gamble', 'real money'];
    const textToCheck = `${cleanName} ${cleanTag} ${cleanPitch} ${cleanWhy} ${cleanTagline || ''}`.toLowerCase();
    for (const word of forbidden) {
      if (textToCheck.includes(word)) {
        setValidationError(`Avoid financial, trading, betting, or crypto language ("${word}").`);
        return;
      }
    }

    const success = await submitIdea({
      emoji: cleanEmoji,
      name: cleanName,
      tag: cleanTag,
      pitch: cleanPitch,
      why: cleanWhy,
      imageUrl: cleanImageUrl,
      frameTheme: cleanFrameTheme,
      tagline: cleanTagline,
      isEdit: isEditing,
    });

    if (success) {
      setSubmitSuccessMsg(isEditing ? 'Nomination updated successfully!' : 'Your contender nominated successfully!');
      setIsEditing(false);
      // Reset form
      setEmoji('');
      setName('');
      setTag('');
      setPitch('');
      setWhy('');
      setImageUrl('');
      setFrameTheme('Neon');
      setTagline('');
      setImageFailed(false);
    }
  };

  const startEditing = () => {
    if (userSubmission) {
      setEmoji(userSubmission.emoji);
      setName(userSubmission.name);
      setTag(userSubmission.tag);
      setPitch(userSubmission.pitch);
      setWhy(userSubmission.why);
      setImageUrl(userSubmission.imageUrl || '');
      setFrameTheme(userSubmission.frameTheme || 'Neon');
      setTagline(userSubmission.tagline || '');
      setImageFailed(false);
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEmoji('');
    setName('');
    setTag('');
    setPitch('');
    setWhy('');
    setImageUrl('');
    setFrameTheme('Neon');
    setTagline('');
    setImageFailed(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Filter other nominees so user's own nomination is not duplicated
  const otherNominees = submissions.filter((s) => s.id !== userSubmissionId);

  return (
    <div className="hype-shell px-4 py-6 animate-fade-in-up">
      {/* Header with Back button */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-game-sm font-bold text-hype-purple hover:text-white transition-colors"
        >
          ← Back to Arena
        </button>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-game-sm font-black uppercase tracking-wider bg-hype-accent/10 border border-hype-accent/30 text-hype-accent shadow-[0_0_12px_rgba(249,115,22,0.1)]">
          🚀 Tomorrow’s board is forming
        </span>
      </div>

      {/* Daily Loop Rail */}
      <div className="mb-4">
        <DailyLoopRail currentStage="launch" />
      </div>

      <YourNextMove state={userSubmission ? 'launchpad_active' : 'launchpad_none'} />

      <div className="text-center mb-4">
        <h1 className="text-game-xl font-extrabold text-hype-text tracking-tight font-black uppercase">
          Meme Launchpad 🚀
        </h1>
        <p className="text-hype-text-dim text-game-md mt-1.5 leading-relaxed max-w-[325px] mx-auto font-medium">
          Nominate and support tomorrow’s contenders. One nomination per player. Top community picks can shape future boards.
        </p>
      </div>

      {/* Show Success messages here */}
      {submitSuccessMsg && (
        <div className="bg-hype-green/10 border border-hype-green/30 text-hype-green rounded-xl p-3 text-xs font-semibold mb-4 text-center">
          ✓ {submitSuccessMsg}
        </div>
      )}

      {/* Nomination Form or User Submission Status Card */}
      {userSubmission && !isEditing ? (
        <div className="space-y-4 mb-6">
          <MemeCard
            emoji={userSubmission.emoji}
            name={userSubmission.name}
            tag={userSubmission.tag}
            tagline={userSubmission.tagline}
            pitch={userSubmission.pitch}
            imageUrl={userSubmission.imageUrl}
            frameTheme={userSubmission.frameTheme}
            creatorUsername={userSubmission.creatorUsername || userSubmission.authorUsername}
            supportCount={userSubmission.supportCount}
            onImageError={() => setImageFailed(true)}
            imageFailed={imageFailed}
            isUserNom={true}
          />
          <div className="flex justify-between items-center gap-2 pt-1">
            <button
              onClick={startEditing}
              className="flex-1 text-game-sm font-bold text-hype-text-dim hover:text-white transition-colors border border-white/10 py-2 rounded-lg bg-white/5"
            >
              ✏️ Edit Contender
            </button>
            <button
              onClick={handleCopyRally}
              className="flex-1 text-game-sm font-black text-hype-accent hover:bg-hype-accent/15 hover:text-white transition-colors border border-hype-accent/30 py-2 rounded-lg bg-hype-accent/5 uppercase tracking-wider"
            >
              {copiedRally ? '✓ Copied!' : '📣 Rally Comment'}
            </button>
          </div>
          {copyRallyError && (
            <div className="p-2 bg-black/45 border border-white/10 rounded-xl text-game-xs text-hype-text-dim text-left break-all select-all leading-normal">
              <span className="text-hype-accent font-bold">Copy manually:</span> {copyRallyError}
            </div>
          )}
        </div>
      ) : (
        <div className="nomination-terminal px-4 py-4 mb-6 animate-fade-in-up">
          <h3 className="text-game-sm font-black uppercase tracking-wider text-hype-text-dim mb-3">
            {isEditing ? '✏️ Edit your nomination' : "Nominate tomorrow's contender"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <label className="block text-game-sm uppercase font-bold text-hype-text-muted mb-1">
                  Emoji
                </label>
                <input
                  type="text"
                  placeholder="🐸"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  maxLength={4}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-game-md text-white focus:outline-none focus:border-hype-purple/50 text-center"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-game-sm uppercase font-bold text-hype-text-muted mb-1">
                  Meme Name
                </label>
                <input
                  type="text"
                  placeholder="Frog Army"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={32}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-game-md text-white focus:outline-none focus:border-hype-purple/50"
                />
              </div>
            </div>

            {/* Emoji chips helper row */}
            <div>
              <span className="block text-game-sm font-semibold text-hype-text-dim mb-1">
                Pick an emoji icon or type your own:
              </span>
              <div className="flex gap-2 flex-wrap bg-black/30 p-2 rounded-xl border border-white/5 justify-between">
                {['🐸', '🔥', '💀', '🦆', '🌮', '🤖', '🐱', '🧠'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setEmoji(chip)}
                    className="text-lg hover:scale-125 transition-transform p-0.5 focus:outline-none focus:ring-1 focus:ring-hype-purple rounded"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-game-sm uppercase font-bold text-hype-text-muted mb-1">
                Tag
              </label>
              <input
                type="text"
                placeholder="#ribbiting"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                maxLength={18}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-game-md text-white focus:outline-none focus:border-hype-purple/50"
              />
            </div>

            <div>
              <label className="block text-game-sm uppercase font-bold text-hype-text-muted mb-1">
                Short Pitch (10-90 chars)
              </label>
              <input
                type="text"
                placeholder="Frogs are taking over the comment section."
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                maxLength={90}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-game-md text-white focus:outline-none focus:border-hype-purple/50"
              />
            </div>

            <div>
              <label className="block text-game-sm uppercase font-bold text-hype-text-muted mb-1">
                Why it catches fire (10-120 chars)
              </label>
              <textarea
                placeholder="Easy to remix, weird enough for Reddit, and perfect for daily hype."
                value={why}
                onChange={(e) => setWhy(e.target.value)}
                maxLength={120}
                rows={2}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-game-md text-white focus:outline-none focus:border-hype-purple/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-game-sm uppercase font-bold text-hype-text-muted mb-1">
                Tagline (optional, max 50 chars)
              </label>
              <input
                type="text"
                placeholder="The frog revolution has begun."
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                maxLength={50}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-game-md text-white focus:outline-none focus:border-hype-purple/50"
              />
            </div>

            <div>
              <label className="block text-game-sm uppercase font-bold text-hype-text-muted mb-1">
                Meme image URL (optional)
              </label>
              <input
                type="text"
                placeholder="https://example.com/meme.jpg"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImageFailed(false);
                }}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-game-md text-white focus:outline-none focus:border-hype-purple/50"
              />
              <span className="block text-game-xs text-hype-text-dim mt-1.5 leading-tight px-1">
                💡 Use an image URL or keep the emoji icon. Upload support comes next.
              </span>
            </div>

            <div>
              <label className="block text-game-sm uppercase font-bold text-hype-text-muted mb-1">
                Frame Theme Style
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {['Neon', 'Cursed', 'Wholesome', 'Chaos', 'Classic'].map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => setFrameTheme(theme)}
                    className={`text-game-sm py-1.5 rounded-lg border font-bold transition-all ${
                      frameTheme === theme
                        ? 'bg-hype-purple/20 border-hype-purple/60 text-white shadow-[0_0_8px_rgba(168,85,247,0.3)]'
                        : 'bg-black/35 border-white/10 text-hype-text-dim hover:text-white'
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Card Preview */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <span className="block text-game-sm uppercase font-black text-hype-purple tracking-wider">
                Live Meme Card Preview
              </span>
              <MemeCard
                emoji={emoji}
                name={name}
                tag={tag}
                tagline={tagline}
                pitch={pitch}
                imageUrl={imageUrl}
                frameTheme={frameTheme}
                creatorUsername="You"
                imageFailed={imageFailed}
                onImageError={() => setImageFailed(true)}
              />
            </div>

            {validationError && (
              <p className="text-game-md text-hype-danger font-medium mt-1">
                ⚠️ {validationError}
              </p>
            )}

            {error && (
              <p className="text-game-md text-hype-danger font-medium mt-1">
                ⚠️ {error}
              </p>
            )}

            {isEditing && (
              <p className="text-game-sm text-hype-text-muted text-center bg-white/5 py-1.5 rounded-lg border border-white/5 mt-1">
                💡 Editing keeps your one nomination for this round and resets its support count.
              </p>
            )}

            <div className="flex gap-2 pt-1.5">
              {isEditing && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-game-md font-bold text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className={`hype-lock-btn text-game-lg !py-2.5 bg-gradient-to-r from-hype-accent to-hype-purple text-white ${
                  isEditing ? 'flex-[2]' : 'w-full'
                }`}
              >
                {submitting ? '🚀 Saving…' : isEditing ? '💾 Save Changes' : '🚀 Launch a contender'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Submitted ideas list */}
      <div className="space-y-3 flex-1 mb-5">
        <h3 className="text-game-sm font-black uppercase tracking-wider text-hype-text-dim px-1">
          💡 Community Nominees
        </h3>

        {otherNominees.length === 0 ? (
          <div className="text-center py-6 bg-black/35 rounded-xl border border-white/5 text-hype-text-dim text-game-md leading-relaxed px-4 font-semibold">
            <p>No nominees yet. Be the first to rally the crowd.</p>
          </div>
        ) : (
          otherNominees.map((sub, index) => {
            const hasSupported = supportedIds.includes(sub.id);
            const isLeading = sub.id === submissions[0]?.id && sub.supportCount > 0;
            const isTopOther = index === 0 && sub.supportCount > 0 && !isLeading;

            return (
              <div
                key={sub.id}
                className={`hype-card p-4 transition-all animate-fade-in-up ${
                  isLeading ? 'border-hype-accent/40 shadow-[0_0_12px_rgba(249,115,22,0.15)] bg-gradient-to-b from-hype-card to-hype-accent/5' : 'bg-hype-card/40'
                }`}
              >
                {/* Nominee Header */}
                <div className="flex items-center gap-2.5 mb-2">
                  {sub.imageUrl ? (
                    <img
                      src={sub.imageUrl}
                      alt={sub.name}
                      className="w-10 h-10 rounded-lg object-cover border border-white/10 flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                        const sib = (e.target as HTMLElement).nextSibling as HTMLElement;
                        if (sib) sib.style.display = 'inline-block';
                      }}
                    />
                  ) : null}
                  <span
                    className="text-3xl flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg border border-white/5"
                    style={{ display: sub.imageUrl ? 'none' : 'flex' }}
                  >
                    {sub.emoji}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-game-lg text-hype-text truncate">
                        {sub.name}
                      </span>
                      {isLeading && (
                        <span className="bg-hype-accent/20 border border-hype-accent/40 text-hype-accent text-game-xs uppercase font-black px-1.5 py-0.5 rounded">
                          🏆 Leading for Tomorrow
                        </span>
                      )}
                      {isTopOther && (
                        <span className="bg-white/5 border border-white/10 text-hype-text-dim text-game-xs uppercase font-black px-1.5 py-0.5 rounded">
                          🔥 Top Nominee
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-game-sm text-hype-text-muted">
                      <span>{sub.tag}</span>
                      <span>·</span>
                      <span className="truncate">Founded by u/{sub.authorUsername}</span>
                    </div>
                  </div>
                  
                  {/* Support Button / Count */}
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={() => supportIdea(sub.id)}
                      className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl text-game-sm font-bold border transition-colors ${
                        hasSupported
                          ? 'bg-hype-green/20 border-hype-green text-hype-green hover:bg-hype-green/10'
                          : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                      }`}
                      aria-label={hasSupported ? 'Withdraw support' : 'Support this meme'}
                    >
                      ⚡ {hasSupported ? 'Supported' : 'Support'}
                    </button>
                    <div className="text-center min-w-[20px]">
                      <span className="block text-game-lg font-black text-white">
                        {sub.supportCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Nominee Details */}
                <div className="space-y-1.5 text-game-sm text-hype-text-dim pt-2 border-t border-white/5">
                  <div>
                    <span className="text-game-xs uppercase font-bold text-hype-text-muted block">
                      Pitch
                    </span>
                    <p className="leading-relaxed">"{sub.pitch}"</p>
                  </div>
                  <div>
                    <span className="text-game-xs uppercase font-bold text-hype-text-muted block">
                      Why it catches fire
                    </span>
                    <p className="leading-relaxed text-game-sm text-hype-text-muted">
                      {sub.why}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Round Controls */}
      <div className="w-full max-w-sm border-t border-white/5 pt-4 mb-4 text-center mt-6">
        <button
          onClick={() => setShowRoundControls((prev) => !prev)}
          className="text-game-sm font-black uppercase tracking-wider text-hype-text-muted hover:text-white transition-colors"
        >
          {showRoundControls ? '⚙️ Hide Round Controls' : '⚙️ Show Round Controls'}
        </button>

        {showRoundControls && (
          <div className="hype-card px-4 py-3.5 bg-black/40 border border-white/5 rounded-2xl mt-3 text-center animate-fade-in-up">
            <h3 className="text-game-sm font-black uppercase tracking-wider text-hype-purple flex items-center gap-1.5 mb-1 justify-center">
              ⚙️ Round Controls
            </h3>
            <p className="text-game-sm text-hype-text-dim leading-relaxed mb-3">
              Use these controls to reveal results or inspect tomorrow's board.
            </p>

            {curateSuccessMsg && (
              <div className="bg-hype-green/10 border border-hype-green/30 text-hype-green rounded-xl p-2 text-game-sm font-semibold mb-3 text-center animate-fade-in-up">
                ✓ {curateSuccessMsg}
              </div>
            )}
            
            {curateError && (
              <div className="bg-hype-danger/10 border border-hype-danger/30 text-hype-danger rounded-xl p-2 text-game-sm font-semibold mb-3 text-center animate-fade-in-up">
                ✗ {curateError}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleCurate}
                disabled={curating}
                className="flex-1 hype-lock-btn text-game-md !py-2 bg-transparent border border-white/10 text-hype-text hover:text-white hover:bg-white/5 hover:border-white/20 animate-fade-in-up"
              >
                {curating ? '⚙️ Snapping...' : 'Shape Tomorrow\'s Board'}
              </button>
              
              <button
                onClick={() => setShowNextBoard((prev) => !prev)}
                className="flex-1 hype-lock-btn text-game-md !py-2 bg-transparent border border-white/10 text-hype-text hover:text-white hover:bg-white/5 hover:border-white/20 animate-fade-in-up"
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
                      <div key={item.id} className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 text-game-sm animate-fade-in-up">
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

            {curatedPreview && curatedPreview.nominees.length > 0 && (
              <div className="mt-4 pt-3.5 border-t border-white/5 space-y-2.5 animate-fade-in-up">
                <div className="flex justify-between items-center text-game-sm text-hype-text-dim">
                  <span className="uppercase font-bold tracking-wider">Tomorrow's Board Preview</span>
                  <span>Curated by u/{curatedPreview.curatedBy}</span>
                </div>
                
                <div className="space-y-2">
                  {curatedPreview.nominees.map((nom, index) => (
                    <div key={nom.id} className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2.5 text-game-sm">
                      <span className="text-2xl flex-shrink-0">{nom.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-game-lg text-white truncate">{nom.name}</span>
                          {index === 0 && (
                            <span className="bg-hype-accent/15 border border-hype-accent/30 text-hype-accent text-game-xs uppercase font-black px-1.5 py-0.5 rounded leading-none">
                              Preview Leader
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
              </div>
            )}

            {(!curatedPreview || curatedPreview.nominees.length === 0) && (
              <div className="mt-4 pt-3.5 border-t border-white/5 text-center text-game-sm text-hype-text-dim animate-fade-in-up">
                <p>Tomorrow's board is still forming. Tap "Shape Tomorrow's Board" above to lock in today's top candidates!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Safety Footer Disclaimer */}
      <p className="text-game-xs text-hype-text-muted text-center mt-auto pt-4 leading-relaxed">
        Fictional Hype Points only. No real money. No crypto. No betting. Not connected to Reddit karma.
      </p>
    </div>
  );
};
