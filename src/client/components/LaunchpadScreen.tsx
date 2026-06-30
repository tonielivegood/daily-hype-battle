import { useState, FormEvent } from 'react';
import { useLaunchpad } from '../hooks/useLaunchpad';
import { LoadingSpinner } from './LoadingSpinner';
import { CANDIDATES } from '../data/candidates';
import type { HypeCandidate } from '../../shared/types';

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

  // Form states
  const [emoji, setEmoji] = useState('');
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [pitch, setPitch] = useState('');
  const [why, setWhy] = useState('');
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

  const startEditing = () => {
    if (!userSubmission) return;
    setEmoji(userSubmission.emoji);
    setName(userSubmission.name);
    setTag(userSubmission.tag);
    setPitch(userSubmission.pitch);
    setWhy(userSubmission.why);
    setValidationError(null);
    setSubmitSuccessMsg(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEmoji('');
    setName('');
    setTag('');
    setPitch('');
    setWhy('');
    setValidationError(null);
    setIsEditing(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSubmitSuccessMsg(null);

    const cleanEmoji = emoji.trim();
    const cleanName = name.trim();
    let cleanTag = tag.trim();
    if (cleanTag && !cleanTag.startsWith('#')) {
      cleanTag = '#' + cleanTag;
    }
    const cleanPitch = pitch.trim();
    const cleanWhy = why.trim();

    // Client side validation
    const emojiCount = Array.from(cleanEmoji).length;
    if (emojiCount === 0 || emojiCount > 2) {
      setValidationError('Emoji is required (1-2 icons).');
      return;
    }
    if (!cleanName || cleanName.length < 3 || cleanName.length > 32) {
      setValidationError('Name must be between 3 and 32 characters.');
      return;
    }
    if (cleanTag.length < 2 || cleanTag.length > 18) {
      setValidationError('Tag must be between 2 and 18 characters.');
      return;
    }
    if (!cleanPitch || cleanPitch.length < 10 || cleanPitch.length > 90) {
      setValidationError('Pitch must be between 10 and 90 characters.');
      return;
    }
    if (!cleanWhy || cleanWhy.length < 10 || cleanWhy.length > 120) {
      setValidationError('Explanation why it burns must be between 10 and 120 characters.');
      return;
    }

    const urlPattern = /https?:\/\/[^\s]+/;
    if (urlPattern.test(cleanPitch) || urlPattern.test(cleanWhy)) {
      setValidationError('Links or URLs are not allowed in submissions.');
      return;
    }

    const res = await submitIdea({
      emoji: cleanEmoji,
      name: cleanName,
      tag: cleanTag,
      pitch: cleanPitch,
      why: cleanWhy,
      isEdit: isEditing,
    });

    if (res.success) {
      // Clear form and turn off edit mode
      setEmoji('');
      setName('');
      setTag('');
      setPitch('');
      setWhy('');
      setIsEditing(false);
      setSubmitSuccessMsg(isEditing ? 'Nomination updated successfully!' : 'Nomination submitted successfully!');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Filter other nominees so user's own nomination is not duplicated
  const otherNominees = submissions.filter((s) => s.id !== userSubmissionId);

  return (
    <div className="hype-shell px-4 py-6 animate-fade-in-up">
      {/* Header with Back button */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold text-hype-purple hover:text-white transition-colors"
        >
          ← Back to Arena
        </button>
        <span className="text-[10px] uppercase font-bold text-hype-text-dim tracking-wider bg-white/5 px-2 py-0.5 rounded-md">
          🚀 Launchpad
        </span>
      </div>

      <div className="text-center mb-4">
        <h1 className="text-xl font-extrabold text-hype-text tracking-tight font-black uppercase">
          Meme Launchpad 🚀
        </h1>
        <p className="text-hype-text-dim text-xs mt-1.5 leading-relaxed max-w-xs mx-auto">
          Nominate and support tomorrow’s contenders.
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
        <div className="hype-card px-4 py-3.5 border-hype-purple/40 bg-gradient-to-br from-hype-bg to-hype-purple/10 mb-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase font-extrabold text-hype-purple">
                Your Nomination
              </span>
              {userSubmission.id === submissions[0]?.id && userSubmission.supportCount > 0 && (
                <span className="bg-hype-accent/20 border border-hype-accent/40 text-hype-accent text-[8px] uppercase font-black px-1.5 py-0.5 rounded leading-none">
                  🏆 Leading for Tomorrow
                </span>
              )}
            </div>
            <button
              onClick={startEditing}
              className="text-[10px] font-bold text-hype-text-dim hover:text-white transition-colors border border-white/10 px-2 py-0.5 rounded-lg bg-white/5"
            >
              ✏️ Replace Nomination
            </button>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">{userSubmission.emoji}</span>
            <div className="min-w-0">
              <h4 className="font-bold text-sm text-white truncate">{userSubmission.name}</h4>
              <span className="text-[10px] text-hype-purple font-medium">{userSubmission.tag}</span>
            </div>
            <div className="ml-auto text-right flex-shrink-0">
              <span className="block text-sm font-black text-white">{userSubmission.supportCount}</span>
              <span className="block text-[8px] text-hype-text-dim">Supports</span>
            </div>
          </div>
          <p className="text-xs text-hype-text-dim mt-2 italic leading-relaxed">
            "{userSubmission.pitch}"
          </p>
          <div className="mt-3 pt-2.5 border-t border-white/5 text-[9px] text-hype-text-muted text-center">
            Your nomination is already in the Launchpad ranking.
          </div>
        </div>
      ) : (
        <div className="nomination-terminal px-4 py-4 mb-6 animate-fade-in-up">
          <h3 className="text-xs font-bold uppercase tracking-wider text-hype-text-dim mb-3">
            {isEditing ? '✏️ Edit your nomination' : "Nominate tomorrow's contender"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <label className="block text-[9px] uppercase font-bold text-hype-text-muted mb-1">
                  Emoji
                </label>
                <input
                  type="text"
                  placeholder="🐸"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  maxLength={4}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-sm text-white focus:outline-none focus:border-hype-purple/50 text-center"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[9px] uppercase font-bold text-hype-text-muted mb-1">
                  Meme Name
                </label>
                <input
                  type="text"
                  placeholder="Frog Army"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={32}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-hype-purple/50"
                />
              </div>
            </div>

            {/* Emoji chips helper row */}
            <div>
              <span className="block text-[9px] font-semibold text-hype-text-dim mb-1">
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
              <label className="block text-[9px] uppercase font-bold text-hype-text-muted mb-1">
                Tag
              </label>
              <input
                type="text"
                placeholder="#ribbiting"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                maxLength={18}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-hype-purple/50"
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase font-bold text-hype-text-muted mb-1">
                Short Pitch (10-90 chars)
              </label>
              <input
                type="text"
                placeholder="Frogs are taking over the comment section."
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                maxLength={90}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-hype-purple/50"
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase font-bold text-hype-text-muted mb-1">
                Why it catches fire (10-120 chars)
              </label>
              <textarea
                placeholder="Easy to remix, weird enough for Reddit, and perfect for daily hype."
                value={why}
                onChange={(e) => setWhy(e.target.value)}
                maxLength={120}
                rows={2}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-hype-purple/50 resize-none"
              />
            </div>

            {validationError && (
              <p className="text-[10px] text-hype-danger font-medium mt-1">
                ⚠️ {validationError}
              </p>
            )}

            {error && (
              <p className="text-[10px] text-hype-danger font-medium mt-1">
                ⚠️ {error}
              </p>
            )}

            {isEditing && (
              <p className="text-[9px] text-hype-text-muted text-center bg-white/5 py-1.5 rounded-lg border border-white/5 mt-1">
                💡 Editing keeps your one nomination for this round and resets its support count.
              </p>
            )}

            <div className="flex gap-2 pt-1.5">
              {isEditing && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className={`hype-lock-btn !py-2.5 !text-xs bg-gradient-to-r from-hype-accent to-hype-purple text-white ${
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
        <h3 className="text-xs font-bold uppercase tracking-wider text-hype-text-dim px-1">
          💡 Community Nominees
        </h3>

        {otherNominees.length === 0 ? (
          <div className="text-center py-6 text-hype-text-muted text-xs leading-relaxed">
            <p>No other nominees yet.<br />Be the first to rally the crowd.</p>
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
                  <span className="text-3xl flex-shrink-0">{sub.emoji}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-hype-text truncate">
                        {sub.name}
                      </span>
                      {isLeading && (
                        <span className="bg-hype-accent/20 border border-hype-accent/40 text-hype-accent text-[8px] uppercase font-black px-1.5 py-0.5 rounded">
                          🏆 Leading for Tomorrow
                        </span>
                      )}
                      {isTopOther && (
                        <span className="bg-white/5 border border-white/10 text-hype-text-dim text-[8px] uppercase font-black px-1.5 py-0.5 rounded">
                          🔥 Top Nominee
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-hype-text-muted">
                      <span>{sub.tag}</span>
                      <span>·</span>
                      <span className="truncate">by u/{sub.authorUsername}</span>
                    </div>
                  </div>
                  
                  {/* Support Button / Count */}
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={() => supportIdea(sub.id)}
                      className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-colors ${
                        hasSupported
                          ? 'bg-hype-green/20 border-hype-green text-hype-green hover:bg-hype-green/10'
                          : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                      }`}
                      aria-label={hasSupported ? 'Withdraw support' : 'Support this meme'}
                    >
                      ⚡ {hasSupported ? 'Supported' : 'Support'}
                    </button>
                    <div className="text-center min-w-[20px]">
                      <span className="block text-xs font-black text-white">
                        {sub.supportCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Nominee Details */}
                <div className="space-y-1.5 text-xs text-hype-text-dim pt-2 border-t border-white/5">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-hype-text-muted block">
                      Pitch
                    </span>
                    <p className="leading-relaxed">"{sub.pitch}"</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-hype-text-muted block">
                      Why it catches fire
                    </span>
                    <p className="leading-relaxed text-[11px] text-hype-text-muted">
                      {sub.why}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Judge / Mod Curation Panel */}
      <div className="hype-card px-4 py-3.5 bg-black/40 border border-white/5 rounded-2xl mt-6 mb-5 animate-fade-in-up">
        <h3 className="text-xs font-black uppercase tracking-wider text-hype-purple flex items-center gap-1.5 mb-1">
          ⚙️ Judge Panel (Daily Preview Snapshot)
        </h3>
        <p className="text-[10px] text-hype-text-dim leading-relaxed mb-3">
          Create a stable preview snapshot of tomorrow's board using the top community nominees.
        </p>

        {curateSuccessMsg && (
          <div className="bg-hype-green/10 border border-hype-green/30 text-hype-green rounded-xl p-2 text-[10px] font-semibold mb-3 text-center animate-fade-in-up">
            ✓ {curateSuccessMsg}
          </div>
        )}
        
        {curateError && (
          <div className="bg-hype-danger/10 border border-hype-danger/30 text-hype-danger rounded-xl p-2 text-[10px] font-semibold mb-3 text-center animate-fade-in-up">
            ✗ {curateError}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleCurate}
            disabled={curating}
            className="flex-1 hype-lock-btn !py-2 !text-[11px] bg-transparent border border-white/10 text-hype-text hover:text-white hover:bg-white/5 hover:border-white/20 animate-fade-in-up"
          >
            {curating ? '⚙️ Snapping...' : 'Curate Tomorrow’s Preview'}
          </button>
          
          <button
            onClick={() => setShowNextBoard((prev) => !prev)}
            className="flex-1 hype-lock-btn !py-2 !text-[11px] bg-transparent border border-white/10 text-hype-text hover:text-white hover:bg-white/5 hover:border-white/20 animate-fade-in-up"
          >
            {showNextBoard ? '👁️ Hide Preview' : '👁️ Preview Next Board'}
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
                  <div key={item.id} className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 text-xs animate-fade-in-up">
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

        {curatedPreview && curatedPreview.nominees.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-white/5 space-y-2.5 animate-fade-in-up">
            <div className="flex justify-between items-center text-[10px] text-hype-text-dim">
              <span className="uppercase font-bold tracking-wider">Tomorrow’s Board Preview</span>
              <span>Curated by u/{curatedPreview.curatedBy}</span>
            </div>
            
            <div className="space-y-2">
              {curatedPreview.nominees.map((nom, index) => (
                <div key={nom.id} className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2.5 text-xs">
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
          </div>
        )}
      </div>

      {/* Safety Footer Disclaimer */}
      <p className="text-[9px] text-hype-text-muted text-center mt-auto pt-4 leading-relaxed">
        Fictional Hype Points only. No real money. No crypto. No betting. Not connected to Reddit karma.
      </p>
    </div>
  );
};
