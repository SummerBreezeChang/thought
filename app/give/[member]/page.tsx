import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ChevronRight } from "lucide-react";
import { BAY_AREA_CATALOG } from "@/server/catalog/bay-area";
import { curate } from "@/server/catalog/curate";
import { store } from "@/server/store/store";
import { giftStatus, isPaid } from "@/server/store/goals";
import { format, formatShort } from "@/server/money/money";
import { GiftIcon } from "@/components/th/gift-icon";
import { Progress } from "@/components/th/progress";
import { Loading, Screen, SectionTitle } from "@/components/th/screen";
import { Portrait } from "@/components/th/characters";
import { AskBox } from "@/components/th/ask-box";
import { ThankYouCard } from "@/components/th/thank-you-card";
import { CITY_LABEL, familyOf, getMember } from "@/lib/family";
import { langFor, t } from "@/lib/i18n";

export default function Page({ params }: { params: Promise<{ member: string }> }) {
  return (
    <Suspense fallback={<Loading />}>
      <Home params={params} />
    </Suspense>
  );
}

async function Home({ params }: { params: Promise<{ member: string }> }) {
  await connection();
  const { member: memberId } = await params;
  const member = getMember(memberId);
  if (!member || member.role === "parent") notFound();
  const { child, family, ageMonths, ageYears } = familyOf(member);
  const c = t(member.culture);
  const lang = langFor(member.culture);

  const contributions = (await store.contributions()).filter(isPaid);
  const startedIds = [...new Set(contributions.map((x) => x.giftId))];
  const started = (await Promise.all(startedIds.map(giftStatus))).filter((s) => s !== undefined);

  // Parent's hints first ("loves dinosaur movies" puts the movies on top), then cheapest.
  const hints = family.hints.join(" ").toLowerCase();
  const ideas = curate(BAY_AREA_CATALOG, { ageMonths, area: family.area, exclude: [...family.alreadyHave, ...startedIds] })
    .sort((a, b) => Number(hints.includes("movie") && b.category === "outing") - Number(hints.includes("movie") && a.category === "outing"))
    .slice(0, 3);

  const myGiftIds = new Set(contributions.filter((x) => x.memberId === member.id).map((x) => x.id));
  const thanks = (await store.thankYous()).filter((x) => myGiftIds.has(x.contributionId)).reverse();

  return (
    <Screen lang={member.culture} back={{ href: "/", label: "Thought" }}>
      <header className="mb-10 flex items-center gap-4">
        <Portrait who="mei" size={72} mood={thanks.some((x) => !x.watchedAt) ? "joy" : "smile"} />
        <div>
          <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.02em]">{c.forChild(child.name)}</h1>
          <p className="text-[17px] text-th-label-secondary">{c.childLine(ageYears, CITY_LABEL[family.area]?.[lang] ?? family.area)}</p>
        </div>
      </header>

      {thanks.length > 0 ? (
        <section className="mb-10">
          <SectionTitle>{c.fromChild(child.name)}</SectionTitle>
          <ul className="flex flex-col gap-4">
            {thanks.map((ty) => {
              const gift = BAY_AREA_CATALOG.find((i) => i.id === contributions.find((x) => x.id === ty.contributionId)?.giftId);
              return (
                <ThankYouCard
                  key={ty.id}
                  id={ty.id}
                  title={c.thanksFor(gift?.title[lang] ?? "")}
                  caption={ty.caption ? (ty.captionTranslated ?? ty.caption) : undefined}
                  original={ty.captionTranslated ? ty.caption : undefined}
                  isNew={!ty.watchedAt}
                  newLabel={c.newLabel}
                />
              );
            })}
          </ul>
        </section>
      ) : null}

      {started.length > 0 ? (
        <section className="mb-10">
          <SectionTitle>{c.inProgress}</SectionTitle>
          <ul className="flex flex-col gap-3">
            {started.map((s) => (
              <li key={s.item.id}>
                <Link href={`/give/${member.id}/gift/${s.item.id}`} className="flex flex-col gap-4 rounded-card bg-th-surface p-4 hover:bg-th-surface-pressed">
                  <span className="flex items-center gap-4">
                    <GiftIcon category={s.item.category} />
                    <span className="flex-1 text-[19px] font-medium leading-snug">{s.item.title[lang]}</span>
                    <ChevronRight className="size-5 text-th-label-secondary" aria-hidden />
                  </span>
                  <Progress share={s.progress.share} label={s.progress.funded ? c.funded : c.percentThere(Math.round(s.progress.share * 100))} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mb-10">
        <SectionTitle>{c.ideas(child.name)}</SectionTitle>
        <ul className="overflow-hidden rounded-card bg-th-surface">
          {ideas.map((item, i) => (
            <li key={item.id} className={i ? "border-t border-th-separator" : ""}>
              <Link href={`/give/${member.id}/gift/${item.id}`} className="flex min-h-[5.5rem] items-center gap-4 px-4 py-4 hover:bg-th-surface-pressed">
                <GiftIcon category={item.category} />
                <span className="flex flex-1 flex-col gap-1">
                  <span className="text-[19px] font-medium leading-snug">{item.title[lang]}</span>
                  <span className="text-[15px] leading-snug text-th-label-secondary">{item.why[lang]}</span>
                </span>
                <span className="text-[15px] tabular-nums text-th-label-secondary">{formatShort({ minor: item.priceUsdCents, currency: "USD" }, member.culture)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <AskBox memberId={member.id} placeholder={c.askPlaceholder} button={c.ask} />
    </Screen>
  );
}
