import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { format, formatShort } from "@/server/money/money";
import { giftStatus } from "@/server/store/goals";
import { GiftIcon } from "@/components/th/gift-icon";
import { Progress } from "@/components/th/progress";
import { AmountPicker } from "@/components/th/amount-picker";
import { Loading, Screen, SectionTitle } from "@/components/th/screen";
import { Avatar, Together, characterFor, type Who } from "@/components/th/characters";
import { familyOf, getMember, memberName } from "@/lib/family";
import { langFor, t } from "@/lib/i18n";
import { amountOptions } from "@/lib/offer";
import { startPayment } from "@/app/actions";

type Params = Promise<{ member: string; gift: string }>;
type Search = Promise<{ error?: string }>;

export default function Page({ params, searchParams }: { params: Params; searchParams: Search }) {
  return (
    <Suspense fallback={<Loading />}>
      <Gift params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Gift({ params, searchParams }: { params: Params; searchParams: Search }) {
  await connection();
  const { member: memberId, gift: giftId } = await params;
  const { error } = await searchParams;
  const member = getMember(memberId);
  const status = await giftStatus(giftId);
  if (!member || member.role === "parent" || !status) notFound();
  const { child, parent, ageYears } = familyOf(member);
  const c = t(member.culture);
  const lang = langFor(member.culture);
  const { item, progress, givers } = status;
  const options = await amountOptions(member, giftId, ageYears);

  const errorText =
    error === "not_connected" ? c.notConnected
    : error === "cancelled" ? c.cancelled
    : error ? c.payFailed
    : null;

  return (
    <Screen lang={member.culture} back={{ href: `/give/${member.id}`, label: c.forChild(child.name) }}>
      <header className="mb-8 flex flex-col gap-5">
        <GiftIcon category={item.category} size="lg" />
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-[34px] leading-tight tracking-[-0.01em]">{item.title[lang]}</h1>
          <p className="text-[19px] leading-snug text-th-label-secondary">{item.why[lang]}</p>
        </div>
        <p className="text-[17px] tabular-nums">{formatShort({ minor: item.priceUsdCents, currency: "USD" }, member.culture)}</p>
      </header>

      {errorText ? (
        <p role="alert" className="mb-8 rounded-card bg-th-surface px-5 py-4 text-[17px] leading-snug">
          {errorText}
        </p>
      ) : null}

      {givers.length > 0 ? (
        <section className="mb-10 flex flex-col gap-4">
          {progress.funded ? (
            <Together
              givers={[...new Set(givers.map((g) => characterFor(g.memberId)).filter((w): w is Who => w !== undefined))]}
              label={c.funded}
            />
          ) : null}
          <Progress share={progress.share} label={progress.funded ? c.funded : c.percentThere(Math.round(progress.share * 100))} />
          <div>
            <SectionTitle>{c.givenBy}</SectionTitle>
            <ul className="flex flex-col gap-3">
              {givers.map((g) => (
                <li key={g.id} className="flex items-center gap-3">
                  <Avatar memberId={g.memberId} name={memberName(g.memberId)} size={44} mood={progress.funded ? "joy" : "smile"} />
                  <span className="flex-1 text-[17px]">{g.memberId === member.id ? c.you : memberName(g.memberId)}</span>
                  <span className="text-[15px] tabular-nums text-th-label-secondary">{format({ minor: g.amountMinor, currency: g.currency }, member.culture)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {options.length > 0 ? (
        <AmountPicker
          options={options}
          action={startPayment}
          hidden={{ member: member.id, gift: item.id }}
          labels={{
            chooseAmount: c.chooseAmount,
            youPay: c.youPay,
            paypalFees: c.paypalFees,
            familyReceives: c.familyReceives(child.name),
            estimate: c.estimate,
            message: c.message,
            messagePlaceholder: c.messagePlaceholder,
            payWithPayPal: c.payWithPayPal,
            safety: c.safety(child.name, parent.title),
          }}
        />
      ) : null}
    </Screen>
  );
}
