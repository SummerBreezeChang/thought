import type { ReactNode } from "react";

/**
 * Thought's three characters, drawn in code so they stay crisp and use only
 * the --th-c-* tokens. Flat, round, warm: closer to a children's book than an
 * emoji set. Each has a "smile" face and a "joy" face (eyes closed in a grin).
 */

export type Who = "chen" | "kenji" | "mei";
export type Mood = "smile" | "joy";

const C = {
  ink: "var(--th-c-ink)",
  skin: "var(--th-c-skin)",
  skinMei: "var(--th-c-skin-mei)",
  cheek: "var(--th-c-cheek)",
  silver: "var(--th-c-hair-silver)",
  grey: "var(--th-c-hair-grey)",
  black: "var(--th-c-hair-black)",
  collar: "var(--th-c-collar)",
  heart: "var(--th-c-heart)",
};

const BG: Record<Who, string> = { chen: "var(--th-c-bg-chen)", kenji: "var(--th-c-bg-kenji)", mei: "var(--th-c-bg-mei)" };
const CLOTHES: Record<Who, string> = { chen: "var(--th-c-chen)", kenji: "var(--th-c-kenji)", mei: "var(--th-c-mei)" };

/** Member ids in the demo family, mapped to a character. */
export function characterFor(memberId: string): Who | undefined {
  if (memberId === "m-chen") return "chen";
  if (memberId === "m-kenji") return "kenji";
  if (memberId === "mei" || memberId === "c-mei") return "mei";
  return undefined;
}

export const HEART = "M0 3.6C-5.2-.4-4.7-5.2-1.7-5.2-.6-5.2 0-4.3 0-3.5 0-4.3.6-5.2 1.7-5.2 4.7-5.2 5.2-.4 0 3.6Z";

function Eyes({ x1, x2, y, mood, r = 1.9 }: { x1: number; x2: number; y: number; mood: Mood; r?: number }) {
  if (mood === "joy") {
    return (
      <g fill="none" stroke={C.ink} strokeWidth={1.7} strokeLinecap="round">
        <path d={`M${x1 - 3} ${y + 1}q3-3.6 6 0`} />
        <path d={`M${x2 - 3} ${y + 1}q3-3.6 6 0`} />
      </g>
    );
  }
  return (
    <g fill={C.ink}>
      <circle cx={x1} cy={y} r={r} />
      <circle cx={x2} cy={y} r={r} />
    </g>
  );
}

function Mouth({ y, mood }: { y: number; mood: Mood }) {
  return mood === "joy" ? (
    <path d={`M44.5 ${y}q5.5 6.5 11 0Z`} fill={C.ink} />
  ) : (
    <path d={`M45.5 ${y}q4.5 3.6 9 0`} fill="none" stroke={C.ink} strokeWidth={1.7} strokeLinecap="round" />
  );
}

function Cheeks({ y }: { y: number }) {
  return (
    <g fill={C.cheek} opacity={0.55}>
      <ellipse cx={36.5} cy={y} rx={3.6} ry={2.4} />
      <ellipse cx={63.5} cy={y} rx={3.6} ry={2.4} />
    </g>
  );
}

function Chen({ mood }: { mood: Mood }) {
  return (
    <>
      <path d="M13 100C15 77 31 69 50 69s35 8 37 31Z" fill={CLOTHES.chen} />
      <path d="M41.5 69.5 50 80l8.5-10.5Z" fill={C.collar} />
      <rect x={44} y={58} width={12} height={12} rx={3} fill={C.skin} />
      <ellipse cx={50} cy={45} rx={18.5} ry={20.5} fill={C.skin} />
      {/* soft silver curls and a little bun */}
      <g fill={C.silver}>
        <circle cx={50} cy={14.5} r={6.5} />
        <circle cx={35} cy={33} r={8.5} />
        <circle cx={42} cy={26} r={9.5} />
        <circle cx={52} cy={23.5} r={10} />
        <circle cx={62} cy={27} r={9.5} />
        <circle cx={67} cy={35} r={7.5} />
        <circle cx={32.5} cy={42} r={5.5} />
        <circle cx={68.5} cy={43} r={5.5} />
      </g>
      <Cheeks y={53} />
      <Eyes x1={43} x2={57} y={45.5} mood={mood} />
      {/* round reading glasses */}
      <g fill="none" stroke={C.ink} strokeWidth={1.3} opacity={0.85}>
        <circle cx={43} cy={45.5} r={5.4} />
        <circle cx={57} cy={45.5} r={5.4} />
        <path d="M48.4 45h3.2" />
      </g>
      <Mouth y={55} mood={mood} />
    </>
  );
}

function Kenji({ mood }: { mood: Mood }) {
  return (
    <>
      <path d="M13 100C15 77 31 69 50 69s35 8 37 31Z" fill={CLOTHES.kenji} />
      <path d="M42 69.5 50 78l8-8.5Z" fill={C.collar} />
      <rect x={44} y={58} width={12} height={12} rx={3} fill={C.skin} />
      <circle cx={31.5} cy={47} r={4} fill={C.skin} />
      <circle cx={68.5} cy={47} r={4} fill={C.skin} />
      <ellipse cx={50} cy={45} rx={18} ry={20.5} fill={C.skin} />
      {/* short grey hair, parted on the side */}
      <path d="M31 42C29 25 39 18 51 18s21 7 18 24c-3-8-9-12-15-13l-4 4c-1-3-2-4-3-4-6 1-12 6-16 13Z" fill={C.grey} />
      <g stroke={C.grey} strokeWidth={2} strokeLinecap="round">
        <path d="M39 36.5h7" />
        <path d="M54 36.5h7" />
      </g>
      <Cheeks y={53.5} />
      <Eyes x1={43} x2={57} y={45.5} mood={mood} />
      {/* square glasses */}
      <g fill="none" stroke={C.ink} strokeWidth={1.3} opacity={0.85}>
        <rect x={37.2} y={41} width={11.6} height={9} rx={2.4} />
        <rect x={51.2} y={41} width={11.6} height={9} rx={2.4} />
        <path d="M48.8 45h2.4" />
      </g>
      <path d="M44.5 53.2q5.5-2.4 11 0-5.5 2.2-11 0Z" fill={C.grey} />
      <Mouth y={56.5} mood={mood} />
    </>
  );
}

function Mei({ mood, waving }: { mood: Mood; waving?: boolean }) {
  return (
    <>
      {/* bob, behind the face */}
      <path d="M27 50C25 27 37 20 50 20s25 7 23 30v12c0 4-5 5-7 2V48H34v16c-2 3-7 2-7-2Z" fill={C.black} />
      <path d="M22 100C24 81 35 73 50 73s26 8 28 27Z" fill={CLOTHES.mei} />
      <rect x={44.5} y={62} width={11} height={12} rx={3} fill={C.skinMei} />
      <ellipse cx={50} cy={48} rx={19.5} ry={20.5} fill={C.skinMei} />
      {/* bangs */}
      <path d="M30.5 44C30 29 39 23.5 50 23.5S70 29 69.5 44c-3-4-6-6-9-6l-3 3-4-3-4 3-4-3-3 3c-4-1-8 0-12 3Z" fill={C.black} />
      {/* a little star clip */}
      <path d="m62.5 27 1.3 2.7 3 .4-2.2 2 .6 3-2.7-1.4-2.7 1.4.6-3-2.2-2 3-.4Z" fill={C.heart} />
      <Cheeks y={56} />
      <Eyes x1={43} x2={57} y={49} mood={mood} r={2.3} />
      <Mouth y={58} mood={mood} />
      {waving ? (
        <g className="th-wave">
          <path d="M72 86c6-7 9-15 9-25" fill="none" stroke={CLOTHES.mei} strokeWidth={9} strokeLinecap="round" />
          <circle cx={81} cy={57} r={5.5} fill={C.skinMei} />
        </g>
      ) : null}
    </>
  );
}

/** A round portrait. Use alone, or nested inside another SVG via x/y. */
export function Portrait({
  who,
  mood = "smile",
  size = 48,
  waving,
  label,
  x,
  y,
}: {
  who: Who;
  mood?: Mood;
  size?: number;
  waving?: boolean;
  label?: string;
  x?: number;
  y?: number;
}) {
  const id = `clip-${who}-${size}-${x ?? 0}-${y ?? 0}`;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      x={x}
      y={y}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className="shrink-0"
    >
      <defs>
        <clipPath id={id}>
          <circle cx={50} cy={50} r={50} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect width={100} height={100} fill={BG[who]} />
        {who === "chen" ? <Chen mood={mood} /> : who === "kenji" ? <Kenji mood={mood} /> : <Mei mood={mood} waving={waving} />}
      </g>
    </svg>
  );
}

/** Three small hearts that rise and fade once. Decorative. */
export function RisingHearts({ x, y, scale = 1 }: { x: number; y: number; scale?: number }): ReactNode {
  const hearts: [number, number, string][] = [
    [0, 0, "th-heart-rise"],
    [9, -6, "th-heart-rise-2"],
    [-8, -10, "th-heart-rise-3"],
  ];
  return (
    <g className="th-moving" aria-hidden>
      {hearts.map(([dx, dy, cls]) => (
        <g key={cls} transform={`translate(${x + dx * scale} ${y + dy * scale}) scale(${scale})`}>
          <path d={HEART} fill={C.heart} className={cls} />
        </g>
      ))}
    </g>
  );
}

/**
 * A heart travels along a red thread from one person to another, then lands
 * with a little lift of hearts. Used when a gift is sent and when a thank-you
 * goes back. With reduced motion, both people and the thread show, still.
 */
export function Journey({ from, to, fromLabel, toLabel }: { from: Who; to: Who; fromLabel: string; toLabel: string }) {
  const path = "M64 58C112 6 208 6 256 58";
  return (
    <svg viewBox="0 0 320 112" className="w-full max-w-[22rem]" role="img" aria-label={`${fromLabel} → ${toLabel}`}>
      <path d={path} fill="none" stroke="var(--th-c-thread)" strokeWidth={2} strokeLinecap="round" strokeDasharray="1 7" />
      <Portrait who={from} mood="smile" size={72} x={0} y={30} />
      <Portrait who={to} mood="joy" size={72} x={248} y={30} />
      <g className="th-moving">
        <g opacity={0}>
          <path d={HEART} fill={C.heart} transform="scale(1.6)" />
          <animateMotion dur="1.5s" begin="0.35s" fill="freeze" path={path} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.4 0 0.2 1" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur="1.5s" begin="0.35s" fill="freeze" />
        </g>
        <g opacity={0}>
          <RisingHeartsStatic />
          <animate attributeName="opacity" values="0;1" dur="0.01s" begin="1.75s" fill="freeze" />
        </g>
      </g>
    </svg>
  );
}

/** Hearts above the receiver, played once after the traveling heart lands. */
function RisingHeartsStatic() {
  return (
    <g>
      {[
        [284, 26, 0],
        [296, 18, 0.25],
        [272, 14, 0.5],
      ].map(([cx, cy, delay]) => (
        <g key={`${cx}`} transform={`translate(${cx} ${cy})`}>
          <path d={HEART} fill={C.heart} opacity={0}>
            <animate attributeName="opacity" values="0;1;0" dur="1.4s" begin={`${1.75 + delay}s`} fill="freeze" />
            <animateTransform attributeName="transform" type="translate" values="0 6;0 -10" dur="1.4s" begin={`${1.75 + delay}s`} fill="freeze" />
          </path>
        </g>
      ))}
    </g>
  );
}

/** A member's portrait when they have a character, else their initial. */
export function Avatar({ memberId, name, size = 40, mood }: { memberId: string; name: string; size?: number; mood?: Mood }) {
  const who = characterFor(memberId);
  if (who) return <Portrait who={who} size={size} mood={mood} />;
  return (
    <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-th-surface text-[17px] font-semibold text-th-label">
      {Array.from(name)[0]}
    </span>
  );
}

/** Everyone who gave, with the child in the middle, once a gift is fully given. */
export function Together({ givers, label }: { givers: Who[]; label: string }) {
  const left = givers.slice(0, Math.ceil(givers.length / 2));
  const right = givers.slice(Math.ceil(givers.length / 2));
  const row: Who[] = [...left, "mei", ...right];
  const size = 64;
  const gap = 6;
  const width = row.length * size + (row.length - 1) * gap;
  const mid = row.indexOf("mei") * (size + gap) + size / 2;
  return (
    <svg viewBox={`0 -24 ${width} ${size + 28}`} className="th-arrive h-24 w-auto overflow-visible" role="img" aria-label={label}>
      {row.map((w, i) => (
        <Portrait key={`${w}-${i}`} who={w} mood="joy" size={w === "mei" ? size + 4 : size} x={i * (size + gap) - (w === "mei" ? 2 : 0)} y={w === "mei" ? -6 : 0} waving={w === "mei"} />
      ))}
      <RisingHearts x={mid} y={-12} scale={1.1} />
    </svg>
  );
}
