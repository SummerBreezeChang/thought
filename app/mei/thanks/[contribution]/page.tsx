import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { BAY_AREA_CATALOG } from "@/server/catalog/bay-area";
import { store, usesBlob } from "@/server/store/store";
import { Loading, Screen } from "@/components/th/screen";
import { VideoRecorder } from "@/components/th/video-recorder";
import { characterFor, type Who } from "@/components/th/characters";
import { giftGivers } from "@/server/store/goals";
import { memberName } from "@/lib/family";

type Params = Promise<{ contribution: string }>;

export default function Page({ params }: { params: Params }) {
  return (
    <Suspense fallback={<Loading />}>
      <Thanks params={params} />
    </Suspense>
  );
}

async function Thanks({ params }: { params: Params }) {
  await connection();
  const { contribution: id } = await params;
  const c = await store.contribution(id);
  const item = c ? BAY_AREA_CATALOG.find((i) => i.id === c.giftId) : undefined;
  if (!c || !item) notFound();
  // The thank-you goes to everyone who gave to this gift.
  const givers = await giftGivers(c.giftId);
  const n = givers.map(memberName);
  const giver = n.length < 3 ? n.join(" and ") : `${n.slice(0, -1).join(", ")} and ${n.at(-1)}`;
  const giverWho = givers.map(characterFor).filter((w): w is Who => w !== undefined);

  return (
    <Screen lang="en" back={{ href: "/mei", label: "Gifts" }}>
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="font-display text-[34px] leading-tight tracking-[-0.01em]">Say thank you to {giver}</h1>
        <p className="text-[19px] leading-snug text-th-label-secondary">For {item.title.en.toLowerCase()}. Tell them what you loved.</p>
      </header>
      <VideoRecorder contributionId={c.id} giver={giver} giverWho={giverWho.length ? giverWho : ["chen"]} cloud={usesBlob()} />
    </Screen>
  );
}
