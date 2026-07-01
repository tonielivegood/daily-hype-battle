import type { MemeImageAsset } from '../../shared/types';

type MemeCardProps = {
  emoji: string;
  name: string;
  tag: string;
  tagline?: string | undefined;
  pitch: string;
  imageUrl?: string | undefined;
  imageAsset?: MemeImageAsset | undefined;
  frameTheme?: string | undefined;
  creatorUsername: string;
  supportCount?: number | undefined;
  onImageError?: (() => void) | undefined;
  imageFailed?: boolean | undefined;
  isUserNom?: boolean | undefined;
};

export const MemeCard = ({
  emoji,
  name,
  tag,
  tagline,
  pitch,
  imageUrl,
  imageAsset,
  frameTheme = 'Neon',
  creatorUsername,
  supportCount,
  onImageError,
  imageFailed,
  isUserNom,
}: MemeCardProps) => {
  // Prefer Reddit-hosted mediaUrl, fallback to legacy imageUrl
  const resolvedImageUrl = imageAsset?.mediaUrl || imageUrl;
  let themeClass = 'border-2 border-hype-purple shadow-[0_0_15px_rgba(168,85,247,0.35)] bg-gradient-to-br from-black/60 to-hype-purple/10';
  let badgeColor = 'bg-hype-purple/20 border-hype-purple/40 text-hype-purple';

  if (frameTheme === 'Cursed') {
    themeClass = 'border-2 border-red-600/50 shadow-[0_0_15px_rgba(220,38,38,0.3)] bg-gradient-to-br from-black/75 to-red-950/20';
    badgeColor = 'bg-red-950/40 border-red-700/50 text-red-400';
  } else if (frameTheme === 'Wholesome') {
    themeClass = 'border-2 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.25)] bg-gradient-to-br from-black/60 to-emerald-950/15';
    badgeColor = 'bg-emerald-950/40 border-emerald-700/50 text-emerald-400';
  } else if (frameTheme === 'Chaos') {
    themeClass = 'border-2 border-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.3)] bg-gradient-to-br from-black/60 to-amber-950/15';
    badgeColor = 'bg-amber-950/40 border-amber-600/50 text-amber-400';
  } else if (frameTheme === 'Classic') {
    themeClass = 'border-2 border-slate-500/40 shadow-inner bg-gradient-to-br from-black/60 to-slate-900/10';
    badgeColor = 'bg-slate-800/45 border-slate-700/40 text-slate-300';
  }

  return (
    <div className={`hype-card p-4 rounded-2xl relative overflow-hidden transition-all ${themeClass}`}>
      <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-game-xs font-black uppercase tracking-wider border ${badgeColor}`}>
            🎭 {frameTheme} Theme
          </span>
          {isUserNom && (
            <span className="bg-hype-purple/20 border border-hype-purple/45 text-hype-purple text-game-xs uppercase font-black px-1.5 py-0.5 rounded leading-none">
              Your Contender
            </span>
          )}
        </div>
        {supportCount !== undefined && (
          <div className="text-right">
            <span className="block font-black text-game-lg text-white">⚡ {supportCount}</span>
            <span className="block text-[10px] text-hype-text-dim uppercase font-bold">Supports</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {resolvedImageUrl && !imageFailed ? (
          <img
            src={resolvedImageUrl}
            alt={name}
            onError={onImageError}
            className="w-12 h-12 rounded-lg object-cover border border-white/10 flex-shrink-0"
          />
        ) : (
          <span className="text-4xl flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white/5 rounded-lg border border-white/10">{emoji || '❓'}</span>
        )}
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-game-lg text-white truncate">{name || 'Nominee Name'}</h4>
          <div className="flex items-center gap-1.5 text-game-sm text-hype-text-dim flex-wrap">
            <span className="text-hype-purple font-semibold">{tag || '#TAG'}</span>
            <span>·</span>
            <span>Created by u/{creatorUsername}</span>
          </div>
        </div>
      </div>

      {tagline && (
        <p className="text-game-sm text-hype-accent mt-2 font-bold leading-tight uppercase tracking-wider">
          {tagline}
        </p>
      )}

      <p className="text-game-md text-white mt-2 italic leading-relaxed">
        "{pitch || 'Explain why this meme contender should launch on tomorrow’s arena card...'}"
      </p>
    </div>
  );
};
