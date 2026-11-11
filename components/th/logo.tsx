/**
 * Thought's mark: one red thread from a grandparent (the larger dot), looping
 * into a heart, to a child (the smaller dot).
 */
export const THREAD =
  "M15 44Q38 53 60 46C45 37 42 21 52 19.5 56.5 18.8 59.5 22 60 25.5 60.5 22 63.5 18.8 68 19.5 78 21 75 37 60 46Q82 53 105 44";

export function ThreadMark({ className = "h-7 w-14" }: { className?: string }) {
  return (
    <svg viewBox="4 14 112 38" className={className} aria-hidden>
      <path d={THREAD} fill="none" stroke="var(--th-warm)" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={11} cy={43} r={6} fill="var(--th-warm)" />
      <circle cx={109} cy={43} r={4.3} fill="var(--th-warm)" />
    </svg>
  );
}

/** Mark plus wordmark. */
export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <span className="flex items-center gap-3">
      <ThreadMark className={lg ? "h-9 w-[4.5rem]" : "h-6 w-12"} />
      <span className={`font-display leading-none ${lg ? "text-[40px]" : "text-[22px]"}`}>Thought</span>
    </span>
  );
}
