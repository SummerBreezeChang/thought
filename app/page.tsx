import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Screen } from "@/components/th/screen";
import { Portrait, type Who } from "@/components/th/characters";
import { Logo } from "@/components/th/logo";
import { resetDemo } from "./actions";

const PEOPLE: { href: string; character: Who; who: string; where: string }[] = [
  { href: "/give/m-chen", character: "chen", who: "Grandma Chen", where: "Taipei · 繁體中文 · NT$" },
  { href: "/give/m-kenji", character: "kenji", who: "Grandpa Kenji", where: "Tokyo · 日本語 · ¥" },
  { href: "/mei", character: "mei", who: "Mei, 6", where: "San Francisco · English" },
];

export default function Start() {
  return (
    <Screen>
      <div className="mb-12 mt-6 flex flex-col gap-3">
        <div className="mb-4 flex items-end gap-2" aria-hidden>
          <Portrait who="chen" mood="joy" size={76} />
          <Portrait who="mei" mood="joy" size={92} waving />
          <Portrait who="kenji" mood="joy" size={76} />
        </div>
        <h1 aria-label="Thought"><Logo size="lg" /></h1>
        <p className="text-[19px] leading-snug text-th-label-secondary">
          Thoughtful gifts from grandparents abroad. They choose something real for their grandkids in the US, pay in their own currency with PayPal, and get a video thank-you back.
        </p>
      </div>

      <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-th-label-secondary">Open as</h2>
      <ul className="overflow-hidden rounded-card bg-th-surface">
        {PEOPLE.map((p, i) => (
          <li key={p.href} className={i ? "border-t border-th-separator" : ""}>
            <Link href={p.href} className="flex min-h-[4.5rem] items-center gap-4 px-4 hover:bg-th-surface-pressed">
              <Portrait who={p.character} size={52} />
              <span className="flex flex-1 flex-col">
                <span className="text-[17px] font-medium">{p.who}</span>
                <span className="text-[15px] text-th-label-secondary">{p.where}</span>
              </span>
              <ChevronRight className="size-5 text-th-label-secondary" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-[15px] leading-relaxed text-th-label-secondary">
        A working prototype on the PayPal sandbox. No real money moves.
      </p>
      <form action={resetDemo} className="mt-auto pt-10">
        <button type="submit" className="min-h-11 text-[15px] text-th-label-secondary underline underline-offset-4 hover:text-th-label">
          Start the demo over
        </button>
      </form>
    </Screen>
  );
}
