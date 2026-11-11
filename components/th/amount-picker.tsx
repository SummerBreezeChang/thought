"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import type { AmountOption } from "@/lib/offer";

interface Labels {
  chooseAmount: string;
  youPay: string;
  paypalFees: string;
  familyReceives: string;
  estimate: string;
  message: string;
  messagePlaceholder: string;
  payWithPayPal: string;
  safety: string;
}

/**
 * The contribute step: pick a suggested amount, see every cost, pay with PayPal.
 * All numbers were computed on the server; this only switches between them.
 */
export function AmountPicker({
  options,
  labels,
  hidden,
  action,
}: {
  options: AmountOption[];
  labels: Labels;
  hidden: Record<string, string>;
  action: (formData: FormData) => Promise<void>;
}) {
  const [picked, setPicked] = useState(options.length - 1);
  const o = options[picked];
  if (!o) return null;

  return (
    <form action={action} className="flex flex-col gap-8">
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <input type="hidden" name="amount" value={o.amountMinor} />

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-th-label-secondary">{labels.chooseAmount}</legend>
        {options.map((opt, i) => (
          <label
            key={opt.amountMinor}
            className={`flex min-h-16 cursor-pointer items-center justify-between gap-4 rounded-card px-5 py-3 transition-colors duration-200 ease-out ${
              i === picked ? "bg-th-label text-th-bg" : "bg-th-surface hover:bg-th-surface-pressed"
            } has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-th-focus`}
          >
            <input type="radio" name="choice" className="sr-only" checked={i === picked} onChange={() => setPicked(i)} />
            <span className="text-[24px] font-semibold tabular-nums tracking-[-0.01em]">{opt.display}</span>
            <span className={`text-right text-[15px] ${i === picked ? "text-th-bg" : "text-th-label-secondary"}`}>{opt.label}</span>
          </label>
        ))}
      </fieldset>

      <section aria-label={labels.youPay} className="flex flex-col rounded-card bg-th-surface px-5 py-2 text-[17px]">
        <Row label={labels.youPay} value={o.display} strong />
        <details className="group border-t border-th-separator">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-3">
            <span className="flex items-center gap-2">
              {labels.paypalFees}
              <span aria-hidden className="text-th-label-secondary transition-transform duration-200 ease-out group-open:rotate-90">›</span>
            </span>
            <span className="tabular-nums text-th-label-secondary">{o.feesTotal}</span>
          </summary>
          <div className="pb-2 pl-4">
            {o.rows.filter((r) => r.fee).map((r) => (
              <Row key={r.label} label={r.label} value={r.value} muted />
            ))}
          </div>
        </details>
        {o.rows.filter((r) => !r.fee).map((r) => (
          <div key={r.label} className="border-t border-th-separator">
            <Row label={r.label} value={r.value} />
          </div>
        ))}
        <div className="border-t border-th-separator">
          <Row label={labels.familyReceives} value={o.familyReceives} strong />
        </div>
        <p className="pb-3 text-[13px] leading-snug text-th-label-secondary">{labels.estimate}</p>
      </section>
      {o.whyLocal ? <p className="-mt-4 px-1 text-[15px] leading-relaxed text-th-label-secondary">{o.whyLocal}</p> : null}

      <label className="flex flex-col gap-3">
        <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-th-label-secondary">{labels.message}</span>
        <textarea
          name="message"
          rows={3}
          maxLength={500}
          placeholder={labels.messagePlaceholder}
          className="resize-none rounded-card bg-th-surface px-5 py-4 text-[19px] leading-relaxed outline-none placeholder:text-th-label-secondary focus-visible:outline-3 focus-visible:outline-th-focus"
        />
      </label>

      <div className="flex flex-col gap-3">
        <PayButton label={labels.payWithPayPal} />
        <p className="text-center text-[15px] leading-snug text-th-label-secondary">{labels.safety}</p>
      </div>
    </form>
  );
}

function Row({ label, value, strong, muted }: { label: string; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <div className={`flex min-h-12 items-center justify-between gap-4 py-3 ${muted ? "text-[15px] text-th-label-secondary" : ""}`}>
      <span className={strong ? "font-semibold" : ""}>{label}</span>
      <span className={`tabular-nums ${strong ? "font-semibold" : ""}`}>{value}</span>
    </div>
  );
}

function PayButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex min-h-14 w-full items-center justify-center rounded-full bg-th-paypal px-6 text-[19px] font-semibold text-th-on-paypal transition-colors duration-200 ease-out hover:bg-th-paypal-pressed disabled:opacity-60"
    >
      {pending ? "…" : label}
    </button>
  );
}
