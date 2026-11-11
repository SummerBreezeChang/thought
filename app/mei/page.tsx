import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { CircleCheck, Video } from "lucide-react";
import { BAY_AREA_CATALOG } from "@/server/catalog/bay-area";
import { DEMO } from "@/server/demo/family";
import { store } from "@/server/store/store";
import { isPaid } from "@/server/store/goals";
import { GiftIcon } from "@/components/th/gift-icon";
import { Loading, Monogram, Screen, SectionTitle } from "@/components/th/screen";
import { memberName } from "@/lib/family";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Shelf />
    </Suspense>
  );
}

async function Shelf() {
  await connection();
  const child = DEMO.children[0]!;
  const paid = (await store.contributions()).filter(isPaid);
  const thanked = new Set((await store.thankYous()).map((x) => x.contributionId));
  const givers = [...new Set(paid.map((p) => p.memberId))];

  return (
    <Screen lang="en" back={{ href: "/", label: "Thought" }}>
      <header className="mb-10 flex flex-col gap-2">
        <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.02em]">Hi {child.name}</h1>
        <p className="text-[19px] text-th-label-secondary">
          {givers.length ? "Look who sent you something." : "Nothing here yet. When Grandma or Grandpa sends a gift, it shows up here."}
        </p>
      </header>

      {givers.map((g) => (
        <section key={g} className="mb-10">
          <SectionTitle>From {memberName(g)}</SectionTitle>
          <ul className="flex flex-col gap-3">
            {paid.filter((p) => p.memberId === g).map((p) => {
              const item = BAY_AREA_CATALOG.find((i) => i.id === p.giftId);
              if (!item) return null;
              return (
                <li key={p.id} className="flex flex-col gap-4 rounded-card bg-th-surface p-4">
                  <div className="flex items-center gap-4">
                    <GiftIcon category={item.category} />
                    <span className="flex-1 text-[19px] font-medium leading-snug">{item.title.en}</span>
                  </div>
                  {p.message ? (
                    <blockquote className="flex gap-3">
                      <Monogram name={memberName(g)} />
                      <p className="flex-1 pt-2 text-[19px] leading-snug">{p.message}</p>
                    </blockquote>
                  ) : null}
                  {thanked.has(p.id) ? (
                    <p className="flex items-center gap-2 text-[17px] font-medium"><CircleCheck className="size-5 text-th-warm" aria-hidden />Thank-you sent to {memberName(g)}</p>
                  ) : (
                    <Link
                      href={`/mei/thanks/${p.id}`}
                      className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-th-label text-[19px] font-semibold text-th-bg"
                    >
                      <Video className="size-5" aria-hidden />
                      Say thank you
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </Screen>
  );
}
