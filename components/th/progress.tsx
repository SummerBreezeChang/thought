export function Progress({ share, label }: { share: number; label: string }) {
  const pct = Math.round(share * 100);
  return (
    <div className="flex flex-col gap-2">
      <progress
        max={100}
        value={pct}
        aria-label={label}
        className="h-1.5 w-full appearance-none overflow-hidden rounded-full bg-th-separator [&::-moz-progress-bar]:bg-th-label [&::-webkit-progress-bar]:bg-th-separator [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-th-label"
      />
      <p className="text-[15px] text-th-label-secondary">{label}</p>
    </div>
  );
}
