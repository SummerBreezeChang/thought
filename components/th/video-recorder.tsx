"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Circle, CircleCheck, RotateCcw, Square } from "lucide-react";

type Phase = "asking" | "ready" | "recording" | "review" | "sending" | "sent" | "blocked" | "error";

/** Record a short video thank-you in the browser and send it to the grandparent. */
export function VideoRecorder({ contributionId, giver }: { contributionId: string; giver: string }) {
  const live = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [phase, setPhase] = useState<Phase>("asking");
  const [clip, setClip] = useState<{ blob: Blob; url: string } | null>(null);
  const [caption, setCaption] = useState("");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "user" }, audio: true })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        stream.current = s;
        if (live.current) live.current.srcObject = s;
        setPhase("ready");
      })
      .catch(() => setPhase("blocked"));
    return () => {
      cancelled = true;
      stream.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (phase !== "recording") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Stop on its own at 60 seconds: a thank-you, not a movie.
  useEffect(() => {
    if (phase === "recording" && seconds >= 60) stop();
  });

  function start() {
    if (!stream.current) return;
    chunks.current = [];
    const type = ["video/mp4", "video/webm;codecs=vp9,opus", "video/webm"].find((t) => MediaRecorder.isTypeSupported(t));
    const r = new MediaRecorder(stream.current, type ? { mimeType: type } : undefined);
    r.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
    r.onstop = () => {
      const blob = new Blob(chunks.current, { type: r.mimeType });
      setClip({ blob, url: URL.createObjectURL(blob) });
      setPhase("review");
    };
    recorder.current = r;
    setSeconds(0);
    r.start();
    setPhase("recording");
  }

  function stop() {
    recorder.current?.state === "recording" && recorder.current.stop();
  }

  function retake() {
    if (clip) URL.revokeObjectURL(clip.url);
    setClip(null);
    setPhase("ready");
    if (live.current && stream.current) live.current.srcObject = stream.current;
  }

  async function send() {
    if (!clip) return;
    setPhase("sending");
    const form = new FormData();
    form.append("contribution", contributionId);
    form.append("caption", caption);
    form.append("video", clip.blob);
    const res = await fetch("/api/thanks", { method: "POST", body: form });
    if (!res.ok) return setPhase("error");
    stream.current?.getTracks().forEach((t) => t.stop());
    setPhase("sent");
  }

  if (phase === "blocked") {
    return (
      <p role="alert" className="rounded-card bg-th-surface px-5 py-4 text-[17px] leading-snug">
        We need the camera and microphone to record. Allow them in your browser settings, then reload this page.
      </p>
    );
  }

  if (phase === "sent") {
    return (
      <div className="flex flex-col items-center gap-6 pt-6 text-center" role="status">
        <CircleCheck className="size-16 text-th-warm" aria-hidden />
        <div className="flex flex-col gap-2">
          <h2 className="text-[28px] font-semibold leading-tight tracking-[-0.01em]">Sent to {giver}</h2>
          <p className="text-[19px] leading-snug text-th-label-secondary">{giver} will see it the next time they open Thought.</p>
        </div>
        <video src={clip?.url} controls playsInline className="aspect-[3/4] w-48 rounded-card bg-th-label object-cover" />
        <Link href="/mei" className="flex min-h-14 w-full items-center justify-center rounded-full bg-th-label text-[19px] font-semibold text-th-bg">
          Done
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-card bg-th-label">
        {phase === "review" || phase === "sending" || phase === "error" ? (
          <video key="clip" src={clip?.url} controls playsInline className="aspect-[3/4] w-full object-cover" />
        ) : (
          <video key="live" ref={live} autoPlay muted playsInline className="aspect-[3/4] w-full -scale-x-100 object-cover" />
        )}
        {phase === "recording" ? (
          <span className="absolute left-4 top-4 rounded-full bg-th-bg px-3 py-1 text-[15px] font-semibold tabular-nums text-th-label">
            {`0:${String(seconds).padStart(2, "0")}`}
          </span>
        ) : null}
      </div>

      {phase === "ready" || phase === "asking" ? (
        <button
          type="button"
          onClick={start}
          disabled={phase === "asking"}
          className="mx-auto grid size-20 place-items-center rounded-full border-4 border-th-label disabled:opacity-40"
          aria-label="Start recording"
        >
          <Circle className="size-14 fill-th-warm text-th-warm" aria-hidden />
        </button>
      ) : null}

      {phase === "recording" ? (
        <button type="button" onClick={stop} className="mx-auto grid size-20 place-items-center rounded-full border-4 border-th-label" aria-label="Stop recording">
          <Square className="size-8 fill-th-warm text-th-warm" aria-hidden />
        </button>
      ) : null}

      {phase === "review" || phase === "sending" || phase === "error" ? (
        <>
          <label className="flex flex-col gap-3">
            <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-th-label-secondary">What Mei said (optional)</span>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              maxLength={300}
              placeholder="Thank you for the movie, I loved the dinosaurs!"
              className="resize-none rounded-card bg-th-surface px-5 py-4 text-[19px] leading-relaxed outline-none placeholder:text-th-label-secondary focus-visible:outline-3 focus-visible:outline-th-focus"
            />
            <span className="text-[15px] text-th-label-secondary">We translate it for {giver}.</span>
          </label>
          {phase === "error" ? (
            <p role="alert" className="text-[17px]">That didn&apos;t send. Check your connection and try again.</p>
          ) : null}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={retake}
              disabled={phase === "sending"}
              className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-th-surface px-6 text-[17px] font-medium"
            >
              <RotateCcw className="size-5" aria-hidden />
              Again
            </button>
            <button
              type="button"
              onClick={send}
              disabled={phase === "sending"}
              className="flex min-h-14 flex-1 items-center justify-center rounded-full bg-th-label text-[19px] font-semibold text-th-bg disabled:opacity-60"
            >
              {phase === "sending" ? "Sending…" : `Send to ${giver}`}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
