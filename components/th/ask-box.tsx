"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";

type State = { kind: "idle" } | { kind: "loading" } | { kind: "answer"; text: string } | { kind: "error"; text: string };

/** One question to the AI gift helper, answered in the grandparent's language. */
export function AskBox({ memberId, placeholder, button, presets = [] }: { memberId: string; placeholder: string; button: string; presets?: string[] }) {
  const [q, setQ] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function ask(e?: React.FormEvent, preset?: string) {
    e?.preventDefault();
    const question = preset ?? q;
    if (!question.trim()) return;
    if (preset) setQ(preset);
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, question }),
      });
      const json = (await res.json()) as { text?: string; error?: string };
      setState(json.text ? { kind: "answer", text: json.text } : { kind: "error", text: json.error ?? "…" });
    } catch {
      setState({ kind: "error", text: "…" });
    }
  }

  return (
    <section className="flex flex-col gap-4">
      {presets.length ? (
        <ul className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <li key={p}>
              <button
                type="button"
                onClick={() => ask(undefined, p)}
                disabled={state.kind === "loading"}
                className="min-h-11 rounded-full border border-th-separator bg-th-bg px-4 text-[15px] hover:bg-th-surface-pressed disabled:opacity-40"
              >
                {p}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <form onSubmit={ask} className="flex items-center gap-2 rounded-full bg-th-surface p-1.5 pl-5 focus-within:outline focus-within:outline-3 focus-within:outline-th-focus">
        <label className="sr-only" htmlFor="ask">{placeholder}</label>
        <input
          id="ask"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="min-h-11 flex-1 bg-transparent text-[17px] outline-none placeholder:text-th-label-secondary"
        />
        <button
          type="submit"
          aria-label={button}
          disabled={state.kind === "loading"}
          className="grid size-11 place-items-center rounded-full bg-th-label text-th-bg transition-opacity duration-200 ease-out disabled:opacity-40"
        >
          <ArrowUp className="size-5" strokeWidth={2.2} aria-hidden />
        </button>
      </form>
      <div aria-live="polite">
        {state.kind === "loading" ? <p className="px-5 text-[17px] text-th-label-secondary">…</p> : null}
        {state.kind === "answer" ? <p className="whitespace-pre-line px-5 text-[17px] leading-relaxed">{state.text}</p> : null}
        {state.kind === "error" ? <p className="px-5 text-[17px] text-th-label-secondary">{state.text}</p> : null}
      </div>
    </section>
  );
}
