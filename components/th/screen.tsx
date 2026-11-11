import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

/** A single-column screen, sized for a phone and centered on larger screens. */
export function Screen({ children, back, lang }: { children: ReactNode; back?: { href: string; label: string }; lang?: string }) {
  return (
    <main lang={lang} className="mx-auto flex min-h-dvh w-full max-w-[34rem] flex-col px-6 pb-16 pt-6 sm:pt-12">
      {back ? (
        <Link
          href={back.href}
          className="-ml-2 mb-6 inline-flex min-h-11 w-fit items-center gap-1 rounded-full px-2 text-[17px] text-th-label-secondary hover:text-th-label"
        >
          <ChevronLeft className="size-5" strokeWidth={2} aria-hidden />
          {back.label}
        </Link>
      ) : null}
      {children}
    </main>
  );
}

export function Monogram({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  const box = size === "lg" ? "size-16 text-[26px]" : "size-10 text-[17px]";
  return (
    <span aria-hidden className={`${box} grid shrink-0 place-items-center rounded-full bg-th-surface font-semibold text-th-label`}>
      {Array.from(name)[0]}
    </span>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-th-label-secondary">{children}</h2>;
}

export function Loading() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[34rem] flex-col gap-4 px-6 pt-12" aria-busy>
      <div className="h-9 w-40 animate-pulse rounded-lg bg-th-surface" />
      <div className="h-24 w-full animate-pulse rounded-card bg-th-surface" />
      <div className="h-24 w-full animate-pulse rounded-card bg-th-surface" />
    </main>
  );
}
