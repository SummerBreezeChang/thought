import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Journey, characterFor } from "@/components/th/characters";
import { BAY_AREA_CATALOG } from "@/server/catalog/bay-area";
import { format, formatRate, formatShort } from "@/server/money/money";
import { store } from "@/server/store/store";
import { Loading, Screen } from "@/components/th/screen";
import { familyOf, getMember } from "@/lib/family";
import { langFor, t } from "@/lib/i18n";

type Params = Promise<{ member: string; contribution: string }>;

export default function Page({ params }: { params: Params }) {
  return (
    <Suspense fallback={<Loading />}>
      <Sent params={params} />
    </Suspense>
  );
}

async function Sent({ params }: { params: Params }) {
  await connection();
  const { member: memberId, contribution: id } = await params;
  const member = getMember(memberId);
  const contribution = await store.contribution(id);
  if (!member || !contribution || contribution.memberId !== member.id) notFound();
  const item = BAY_AREA_CATALOG.find((i) => i.id === contribution.giftId);
  const { child } = familyOf(member);
  const c = t(member.culture);
  const loc = member.culture;
  const actual = contribution.actual;
  const usd = (cents: number) => format({ minor: cents, currency: "USD" }, loc);

  return (
    <Screen lang={member.culture}>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 pt-12 text-center">
        <Journey from={characterFor(member.id) ?? "chen"} to="mei" fromLabel={member.title} toLabel={child.name} />
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-[40px] leading-tight tracking-[-0.01em]">{c.sent}</h1>
          <p className="text-[19px] leading-snug text-th-label-secondary">{c.seeTomorrow(child.name)}</p>
        </div>
        {item ? <p className="text-[17px]">{item.title[langFor(member.culture)]}</p> : null}
      </div>

      <section aria-label={c.actualTitle} className="mt-12 flex flex-col rounded-card bg-th-surface px-5 py-2 text-[17px]">
        <div className="flex min-h-12 items-center justify-between py-3">
          <span className="font-semibold">{c.youPay}</span>
          <span className="font-semibold tabular-nums">{format({ minor: contribution.amountMinor, currency: contribution.currency }, loc)}</span>
        </div>
        {actual?.paypalFee ? (
          <div className="flex min-h-12 items-center justify-between border-t border-th-separator py-3">
            <span>{c.paypalFees}</span>
            <span className="tabular-nums">−{format(actual.paypalFee, loc)}</span>
          </div>
        ) : null}
        {actual?.net && actual.receivedUsd && actual.net.currency !== "USD" ? (
          <div className="flex flex-col gap-1 border-t border-th-separator py-3">
            <div className="flex items-center justify-between gap-4">
              <span>{c.conversion}</span>
              <span className="tabular-nums">
                {format(actual.net, loc)} → {usd(actual.receivedUsd.minor)}
              </span>
            </div>
            {actual.exchangeRate ? (
              <span className="text-[15px] text-th-label-secondary">
                {c.convertedAt(formatRate(actual.exchangeRate, actual.net.currency, loc))}
              </span>
            ) : null}
          </div>
        ) : null}
        <div className="flex min-h-12 items-center justify-between border-t border-th-separator py-3">
          <span>{c.ourFee}</span>
          <span className="tabular-nums">{formatShort({ minor: 0, currency: "USD" }, loc)}</span>
        </div>
        <div className="flex min-h-12 items-center justify-between border-t border-th-separator py-3">
          <span className="font-semibold">{c.familyReceives(child.name)}</span>
          <span className="font-semibold tabular-nums">{actual?.receivedUsd ? usd(actual.receivedUsd.minor) : `≈ ${usd(contribution.estimateUsdCents)}`}</span>
        </div>
        <p className="pb-3 text-[13px] leading-snug text-th-label-secondary">
          {actual?.receivedUsd ? c.estimatedActual(usd(contribution.estimateUsdCents), usd(actual.receivedUsd.minor)) : c.pending}
        </p>
      </section>

      <Link
        href={`/give/${member.id}`}
        className="mt-8 flex min-h-14 w-full items-center justify-center rounded-full bg-th-label text-[19px] font-semibold text-th-bg"
      >
        {c.backHome}
      </Link>
    </Screen>
  );
}
