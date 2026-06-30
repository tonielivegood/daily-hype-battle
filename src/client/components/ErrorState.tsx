type ErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-5 px-6 text-center">
      <div className="text-5xl">😵</div>
      <h2 className="text-xl font-bold text-hype-text">Something went wrong</h2>
      <p className="text-hype-text-dim text-sm max-w-xs leading-relaxed">
        {message}
      </p>
      <button
        className="hype-cta mt-2 text-sm px-6 py-3"
        style={{ animation: 'none' }}
        onClick={onRetry}
      >
        Try Again
      </button>
    </div>
  );
};
