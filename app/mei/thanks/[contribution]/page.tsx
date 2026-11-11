import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { BAY_AREA_CATALOG } from "@/server/catalog/bay-area";
import { store } from "@/server/store/store";
import { Loading, Screen } from "@/components/th/screen";
import { VideoRecorder } from "@/components/th/video-recorder";
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
  const giver = memberName(c.memberId);

  return (
    <Screen lang="en" back={{ href: "/mei", label: "Gifts" }}>
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.02em]">Say thank you to {giver}</h1>
        <p className="text-[19px] leading-snug text-th-label-secondary">For {item.title.en.toLowerCase()}. Tell them what you loved.</p>
      </header>
      <VideoRecorder contributionId={c.id} giver={giver} />
    </Screen>
  );
}
