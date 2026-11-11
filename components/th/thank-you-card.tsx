"use client";

import { useState } from "react";
import { markThankYouWatched } from "@/app/actions";
import { Portrait, RisingHearts } from "./characters";

/** One video thank-you on a grandparent's home. "New" until they press play. */
export function ThankYouCard({
  id,
  title,
  caption,
  original,
  isNew,
  newLabel,
  memberId,
}: {
  id: string;
  title: string;
  caption?: string;
  original?: string;
  isNew: boolean;
  newLabel: string;
  memberId: string;
}) {
  const [unseen, setUnseen] = useState(isNew);

  function onPlay() {
    if (!unseen) return;
    setUnseen(false);
    void markThankYouWatched(id, memberId);
  }

  return (
    <li className="overflow-hidden rounded-card bg-th-surface">
      <div className="flex items-center gap-3 px-4 py-3">
        <svg viewBox="0 0 64 64" className="size-14 shrink-0 overflow-visible" aria-hidden>
          <Portrait who="mei" mood="joy" size={56} x={0} y={8} waving={unseen} />
          {unseen ? <RisingHearts x={54} y={14} scale={0.85} /> : null}
        </svg>
        <div className="flex flex-1 flex-col gap-0.5">
          {unseen ? (
            <span className="flex items-center gap-1.5 text-[15px] font-semibold text-th-warm">
              <span className="size-2 rounded-full bg-th-warm" aria-hidden />
              {newLabel}
            </span>
          ) : null}
          <p className="text-[17px] font-medium leading-snug">{title}</p>
        </div>
      </div>
      <video
        controls
        playsInline
        preload="metadata"
        onPlay={onPlay}
        className="aspect-[3/4] w-full bg-th-label object-cover"
        src={`/api/thanks/${id}`}
      />
      {caption ? (
        <div className="flex flex-col gap-1 p-4">
          <p className="text-[19px] leading-snug">{caption}</p>
          {original ? <p className="text-[15px] text-th-label-secondary">{original}</p> : null}
        </div>
      ) : null}
    </li>
  );
}
