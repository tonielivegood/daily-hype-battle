import type { HypeCandidate } from '../../shared/types';

type CandidateCardProps = {
  candidate: HypeCandidate;
  allocation: number;
  totalUsed: number;
  maxPoints: number;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
};

export const CandidateCard = ({
  candidate,
  allocation,
  totalUsed,
  maxPoints,
  onIncrement,
  onDecrement,
}: CandidateCardProps) => {
  const canIncrement = totalUsed < maxPoints;
  const canDecrement = allocation > 0;

  return (
    <div className={`contender-lane hype-card-enter px-4 py-3.5 transition-all ${
      allocation > 0 ? 'contender-lane-active' : ''
    }`}>
      <div className="flex items-center gap-3">
        {/* Emoji avatar */}
        <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-2xl transition-all ${
          allocation > 0 ? 'bg-hype-purple/25 scale-105' : 'bg-white/5'
        }`}>
          {candidate.emoji}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-hype-text truncate">
              {candidate.name}
            </span>
            <span className="text-xs text-hype-purple font-medium">
              {candidate.tag}
            </span>
          </div>
          <p className="text-xs text-hype-text-dim mt-0.5 truncate">
            {candidate.pitch}
          </p>
        </div>

        {/* Stepper controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            className="hype-stepper-btn"
            onClick={() => onDecrement(candidate.id)}
            disabled={!canDecrement}
            aria-label={`Remove hype from ${candidate.name}`}
          >
            −
          </button>
          <span
            className={`min-w-[36px] text-center text-sm font-bold rounded-lg py-1 transition-all duration-200 ${
              allocation > 0
                ? 'alloc-badge-active text-white'
                : 'text-hype-text-muted'
            }`}
          >
            {allocation}
          </span>
          <button
            className="hype-stepper-btn"
            onClick={() => onIncrement(candidate.id)}
            disabled={!canIncrement}
            aria-label={`Add hype to ${candidate.name}`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};
