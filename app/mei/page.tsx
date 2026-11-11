import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { CircleCheck, Video } from "lucide-react";
import { BAY_AREA_CATALOG } from "@/server/catalog/bay-area";
import { DEMO } from "@/server/demo/family";
import { store } from "@/server/store/store";
import { isPaid } from "@/server/store/goals";
import { GiftIcon } from "@/components/th/gift-icon";
import { Loading, Screen } from "@/components/th/screen";
import { Avatar, Portrait } from "@/components/th/characters";
import { memberName } from "@/lib/family";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Shelf />
    </Suspense>
  );
}

/** "阿嬤 and おじいちゃん" */
function names(ids: string[]) {
  const n = ids.map(memberName);
  return n.length < 3 ? n.join(" and ") : `${n.slice(0, -1).join(", ")} and ${n.at(-1)}`;
}

async function Shelf() {
  await connection();
  const child = DEMO.children[0]!;
  const paid = (await store.contributions()).filter(isPaid);
  const thankedGifts = new Set(
    (await store.thankYous()).map((x) => paid.find((p) => p.id === x.contributionId)?.giftId).filter(Boolean),
  );
  // One card per gift, from everyone who gave to it. No amounts on Mei's side.
  const gifts = [...new Set(paid.map((p) => p.giftId))];

  return (
    <Screen lang="en" back={{ href: "/", label: "Thought" }}>
      <header className="mb-10 flex flex-col gap-2">
        <Portrait who="mei" mood="joy" size={84} waving />
        <h1 className="mt-2 font-display text-[34px] leading-tight tracking-[-0.01em]">Hi {child.name}</h1>
        <p className="text-[19px] text-th-label-secondary">
          {gifts.length ? "Look who sent you something." : "Nothing here yet. When Grandma or Grandpa sends a gift, it shows up here."}
        </p>
      </header>

      <ul className="flex flex-col gap-6">
        {gifts.map((giftId) => {
          const item = BAY_AREA_CATALOG.find((i) => i.id === giftId);
          if (!item) return null;
          const fromGift = paid.filter((p) => p.giftId === giftId);
          const givers = [...new Set(fromGift.map((p) => p.memberId))];
          return (
            <li key={giftId} className="flex flex-col gap-5 rounded-card bg-th-surface p-5">
              <div className="flex items-center gap-4">
                <GiftIcon category={item.category} />
                <span className="flex-1 font-display text-[22px] leading-snug">{item.title.en}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex -space-x-2">
                  {givers.map((g) => (
                    <Avatar key={g} memberId={g} name={memberName(g)} size={40} mood="joy" />
                  ))}
                </span>
                <span className="text-[17px] text-th-label-secondary">From {names(givers)}</span>
              </div>
              {fromGift.filter((p) => p.message).map((p) => (
                <blockquote key={p.id} className="flex gap-3">
                  <Avatar memberId={p.memberId} name={memberName(p.memberId)} size={40} />
                  <p className="flex-1 pt-1.5 text-[19px] leading-snug">{p.message}</p>
                </blockquote>
              ))}
              {thankedGifts.has(giftId) ? (
                <p className="flex items-center gap-2 text-[17px] font-medium">
                  <CircleCheck className="size-5 text-th-warm" aria-hidden />
                  Thank-you sent to {names(givers)}
                </p>
              ) : (
                <Link
                  href={`/mei/thanks/${fromGift[0]!.id}`}
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
    </Screen>
  );
}
