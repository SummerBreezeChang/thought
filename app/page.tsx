import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Monogram, Screen } from "@/components/th/screen";
import { resetDemo } from "./actions";

const PEOPLE = [
  { href: "/give/m-chen", name: "阿嬤", who: "Grandma Chen", where: "Taipei · 繁體中文 · NT$" },
  { href: "/give/m-kenji", name: "おじいちゃん", who: "Grandpa Kenji", where: "Tokyo · 日本語 · ¥" },
  { href: "/mei", name: "Mei", who: "Mei, 6", where: "San Francisco · English" },
];

export default function Start() {
  return (
    <Screen>
      <div className="mb-12 mt-6 flex flex-col gap-3">
        <span aria-hidden className="h-1 w-10 rounded-full bg-th-warm" />
        <h1 className="text-[40px] font-semibold leading-[1.05] tracking-[-0.02em]">Thought</h1>
        <p className="text-[19px] leading-snug text-th-label-secondary">
          Grandparents far away give the Saturday they&apos;d give in person. Paid with PayPal, in their own currency.
        </p>
      </div>

      <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-th-label-secondary">Open as</h2>
      <ul className="overflow-hidden rounded-card bg-th-surface">
        {PEOPLE.map((p, i) => (
          <li key={p.href} className={i ? "border-t border-th-separator" : ""}>
            <Link href={p.href} className="flex min-h-[4.5rem] items-center gap-4 px-4 hover:bg-th-surface-pressed">
              <Monogram name={p.name} />
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
