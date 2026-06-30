export const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-5 px-4">
      <div className="text-5xl animate-spin-slow">🌀</div>
      <p className="text-hype-text-dim text-base font-medium tracking-wide">
        Loading the arena…
      </p>
    </div>
  );
};
