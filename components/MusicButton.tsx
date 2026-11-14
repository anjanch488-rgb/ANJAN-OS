"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/** Put the track at public/music/hes-a-pirate.mp3 (it loops forever). */
const SRC = "/music/hes-a-pirate.mp3";
const VOLUME = 0.45;
const KEY = "anjan-music"; // "off" once the visitor mutes it

/**
 * Background music that starts as soon as the browser allows it.
 * Browsers block sound until the visitor interacts with the page, so we try to autoplay on load and,
 * if that is blocked, start on the very first click / tap / key press (the boot screen click counts).
 * A mute button remembers the visitor's choice. Pauses when the tab is hidden.
 */
export default function MusicButton() {
  const audio = useRef<HTMLAudioElement>(null);
  const raf = useRef(0);
  const want = useRef(true); // visitor intent
  const [playing, setPlaying] = useState(false);
  const [missing, setMissing] = useState(false);
  const playingRef = useRef(false); // mirror of `playing` for the visibility handler
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  const fadeTo = useCallback((to: number, ms: number, done?: () => void) => {
    const a = audio.current;
    if (!a) return;
    cancelAnimationFrame(raf.current);
    const from = a.volume;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      a.volume = from + (to - from) * k;
      if (k < 1) raf.current = requestAnimationFrame(tick);
      else done?.();
    };
    raf.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(async () => {
    const a = audio.current;
    if (!a) return false;
    try {
      a.volume = 0;
      await a.play();
      fadeTo(VOLUME, 2200);
      setPlaying(true);
      return true;
    } catch {
      return false; // autoplay blocked (or file missing)
    }
  }, [fadeTo]);

  const stop = useCallback(() => {
    fadeTo(0, 500, () => audio.current?.pause());
    setPlaying(false);
  }, [fadeTo]);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY) === "off") want.current = false;
    } catch {}
    if (!want.current) return;

    let armed = false;
    const events = ["pointerdown", "keydown", "touchend", "click"] as const;
    const disarm = () => {
      if (!armed) return;
      armed = false;
      events.forEach((e) => window.removeEventListener(e, onGesture, true));
    };
    const onGesture = async () => {
      if (!want.current) return disarm();
      if (await start()) disarm();
    };

    start().then((ok) => {
      if (ok || !want.current) return;
      armed = true;
      events.forEach((e) => window.addEventListener(e, onGesture, true));
    });

    const onVis = () => {
      const a = audio.current;
      if (!a) return;
      if (document.hidden) a.pause();
      else if (want.current && playingRef.current) a.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      disarm();
      document.removeEventListener("visibilitychange", onVis);
      cancelAnimationFrame(raf.current);
      audio.current?.pause();
    };
  }, [start]);

  const toggle = async () => {
    if (playing) {
      want.current = false;
      try { localStorage.setItem(KEY, "off"); } catch {}
      stop();
    } else {
      want.current = true;
      try { localStorage.setItem(KEY, "on"); } catch {}
      await start();
    }
  };

  return (
    <>
      <audio ref={audio} src={SRC} loop preload="auto" playsInline onError={() => setMissing(true)} />
      {!missing && (
        <button
          onClick={toggle}
          aria-pressed={playing}
          aria-label={playing ? "Mute music" : "Play music"}
          title={playing ? "Mute music" : "Play music"}
          className="relative grid h-11 w-11 place-items-center text-[var(--fg)] transition hover:text-[var(--neon)]"
        >
          {playing ? (
            <span className="eq" aria-hidden>
              <i /><i /><i /><i />
            </span>
          ) : (
            <VolumeX size={22} />
          )}
          {!playing && want.current && <span className="music-ping" aria-hidden />}
        </button>
      )}
    </>
  );
}
