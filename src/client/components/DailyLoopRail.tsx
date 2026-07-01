type DailyLoopStage = 'pick' | 'lock' | 'reveal' | 'launch';

type DailyLoopRailProps = {
  currentStage: DailyLoopStage;
};

export const DailyLoopRail = ({ currentStage }: DailyLoopRailProps) => {
  const stages = [
    { key: 'pick', label: '1. Pick' },
    { key: 'lock', label: '2. Lock' },
    { key: 'reveal', label: '3. Reveal' },
    { key: 'launch', label: '4. Launch' },
  ];

  return (
    <div className="w-full bg-black/45 border border-white/5 rounded-2xl py-3 px-3 flex justify-between items-center text-center select-none animate-fade-in-up">
      {stages.map((stage) => {
        const isActive = stage.key === currentStage;
        return (
          <div key={stage.key} className="flex flex-col flex-1 items-center relative py-1">
            <span
              className={`block uppercase tracking-wider transition-all duration-200 ${
                isActive
                  ? 'text-hype-accent text-[13px] font-black scale-105 filter drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]'
                  : 'text-hype-text-muted text-[11px] font-bold'
              }`}
            >
              {stage.label}
            </span>
            {isActive && (
              <span className="absolute -bottom-[2px] w-1.5 h-1.5 rounded-full bg-hype-accent shadow-[0_0_6px_rgba(249,115,22,0.6)]" />
            )}
          </div>
        );
      })}
    </div>
  );
};
