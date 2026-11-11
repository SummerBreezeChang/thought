"use client";

import { useState } from "react";
import { markThankYouWatched } from "@/app/actions";

/** One video thank-you on a grandparent's home. "New" until they press play. */
export function ThankYouCard({
  id,
  title,
  caption,
  original,
  isNew,
  newLabel,
}: {
  id: string;
  title: string;
  caption?: string;
  original?: string;
  isNew: boolean;
  newLabel: string;
}) {
  const [unseen, setUnseen] = useState(isNew);

  function onPlay() {
    if (!unseen) return;
    setUnseen(false);
    void markThankYouWatched(id);
  }

  return (
    <li className="overflow-hidden rounded-card bg-th-surface">
      <div className="flex items-center gap-2 px-4 py-3">
        {unseen ? (
          <span className="flex items-center gap-1.5 text-[15px] font-semibold text-th-warm">
            <span className="size-2 rounded-full bg-th-warm" aria-hidden />
            {newLabel}
          </span>
        ) : null}
        <p className="flex-1 text-[17px] font-medium leading-snug">{title}</p>
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
