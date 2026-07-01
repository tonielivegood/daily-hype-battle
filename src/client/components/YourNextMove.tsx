type YourNextMoveProps = {
  state: 'fresh' | 'partial' | 'ready' | 'locked' | 'settled_voter' | 'settled_spectator' | 'launchpad_none' | 'launchpad_active';
  remainingPoints?: number;
};

export const YourNextMove = ({ state, remainingPoints = 0 }: YourNextMoveProps) => {
  let text = '';
  let icon = '🎯';
  let accentColor = 'border-hype-purple';

  switch (state) {
    case 'fresh':
      text = 'Today’s Mission: Pick today’s meme.';
      icon = '🎮';
      accentColor = 'border-hype-purple';
      break;
    case 'partial':
      text = `Spend ${remainingPoints} more Hype Points to lock your pick.`;
      icon = '💡';
      accentColor = 'border-white/20';
      break;
    case 'ready':
      text = 'Ready to lock your hype.';
      icon = '✨';
      accentColor = 'border-hype-green';
      break;
    case 'locked':
      text = 'Come back for the reveal. While you wait, nominate tomorrow’s meme.';
      icon = '🔒';
      accentColor = 'border-hype-accent';
      break;
    case 'settled_voter':
      text = 'Check your score, then nominate tomorrow’s meme.';
      icon = '🏆';
      accentColor = 'border-hype-accent';
      break;
    case 'settled_spectator':
      text = 'Today’s picks are closed. Help shape tomorrow’s board.';
      icon = '⏳';
      accentColor = 'border-hype-text-muted';
      break;
    case 'launchpad_none':
      text = 'Nominate 1 meme for tomorrow’s board.';
      icon = '🚀';
      accentColor = 'border-hype-purple';
      break;
    case 'launchpad_active':
      text = 'Your meme is campaigning. Edit your pitch or rally support.';
      icon = '📢';
      accentColor = 'border-hype-green';
      break;
  }

  return (
    <div className={`w-full max-w-sm bg-black/45 border-l-4 ${accentColor} rounded-r-xl py-2.5 px-3.5 flex items-center gap-2.5 mb-4 animate-fade-in-up text-left`}>
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <span className="block text-game-xs uppercase font-black tracking-wider text-hype-text-muted">
          Daily Mission
        </span>
        <p className="text-game-md font-bold text-white leading-tight">
          {text}
        </p>
      </div>
    </div>
  );
};
