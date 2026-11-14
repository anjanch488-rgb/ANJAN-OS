"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronsDown, Mouse } from "lucide-react";
import Atmosphere from "./Atmosphere";
import Portrait from "./Portrait";
import TechLab from "./TechLab";
import CreativeStudio from "./CreativeStudio";
import { creativeCats, EduBadge, HeroTitle, PanelSummary, Quote, Socials, techCats } from "./HomeParts";
import { useNav, type Side } from "@/lib/nav";
import { useIsMobile } from "@/lib/hooks";

const ease = [0.22, 1, 0.36, 1] as const;
const dur = 0.85;

// Desktop geometry per (panel, state). Units are vw/vh so layouts stay proportional.
const TOP = "30vh";
const H_SM = "51vh";
const geo = {
  creative: {
    center: { left: "4.5vw", width: "24vw", top: TOP, height: H_SM },
    creative: { left: "2.5vw", width: "66vw", top: "13vh", height: "77vh" },
    tech: { left: "0.6vw", width: "3.4vw", top: "13vh", height: "77vh" },
  },
  tech: {
    center: { left: "71.5vw", width: "24vw", top: TOP, height: H_SM },
    tech: { left: "31.5vw", width: "66vw", top: "13vh", height: "77vh" },
    creative: { left: "96vw", width: "3.4vw", top: "13vh", height: "77vh" },
  },
} as const;

const portraitPose: Record<Side, { x: string; scale: number; opacity: number }> = {
  center: { x: "0vw", scale: 1, opacity: 1 },
  creative: { x: "34vw", scale: 0.62, opacity: 0.95 },
  tech: { x: "-34vw", scale: 0.62, opacity: 0.95 },
};

function nextSide(side: Side, dir: "left" | "right"): Side {
  if (dir === "left") return side === "tech" ? "center" : "creative";
  return side === "creative" ? "center" : "tech";
}

/** Shared swipe/drag + keyboard behaviour. Content scrollers opt out with [data-noswipe]. */
function useSwipe(side: Side, setSide: (s: Side) => void, onDown: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const { terminalOpen, view } = useNav();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (terminalOpen || view !== "home") return;
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "ArrowLeft") setSide(nextSide(side, "left"));
      else if (e.key === "ArrowRight") setSide(nextSide(side, "right"));
      else if (e.key === "Escape" && side !== "center") setSide("center");
      else if (e.key === "ArrowDown" && side === "center") onDown();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [side, setSide, onDown, terminalOpen, view]);

  return {
    onPointerDown: (e: React.PointerEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("[data-noswipe],input,textarea,select,video,a")) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      start.current = { x: e.clientX, y: e.clientY };
    },
    onPointerUp: (e: React.PointerEvent) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 1.4) setSide(nextSide(side, dx < 0 ? "left" : "right"));
    },
    onPointerCancel: () => {
      start.current = null;
    },
  };
}

function ExpandedHeader({ num, word, sub, onBack }: { num: string; word: string; sub: string; onBack: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] p-4 sm:p-5">
      <div>
        <h2 className="font-display text-4xl font-bold italic leading-none sm:text-5xl">
          {num} <span className="text-[var(--red)]/70">/</span> <span className="red-text">{word}</span>
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">{sub}</p>
      </div>
      <button onClick={onBack} className="btn-hud shrink-0" aria-label="Back to home">
        <ArrowLeft size={18} /> <span className="hidden sm:inline">Back</span>
      </button>
    </div>
  );
}

function DesktopHome() {
  const { side, setSide, go } = useNav();
  const swipe = useSwipe(side, setSide, () => go("about"));
  const expanded = side !== "center";

  const panel = (which: "creative" | "tech") => {
    const state: "center" | "open" | "rail" = side === "center" ? "center" : side === which ? "open" : "rail";
    const g = geo[which][side];
    const isC = which === "creative";
    return (
      <motion.div
        key={which}
        className="absolute z-20"
        initial={false}
        animate={g}
        transition={{ duration: dur, ease }}
        style={{ ...(!expanded && { top: TOP }) }}
      >
        <div className="hud-wrap h-full">
          <div className="hud h-full">
            <div className="hud-in h-full overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                {state === "center" && (
                  <motion.div key="s" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                    {isC ? (
                      <PanelSummary num="01" word="CREATIVE" sub="Multimedia & Creative" cats={creativeCats} cta="Explore Creative Studio" onCta={() => setSide("creative")} onExpand={() => setSide("creative")} />
                    ) : (
                      <PanelSummary num="02" word="TECH" sub="Academic & Professional" cats={techCats} cta="Explore Projects" onCta={() => go("projects")} onExpand={() => setSide("tech")} />
                    )}
                  </motion.div>
                )}
                {state === "open" && (
                  <motion.div key="o" className="flex h-full flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, delay: 0.25 }}>
                    <ExpandedHeader
                      num={isC ? "01" : "02"}
                      word={isC ? "CREATIVE STUDIO" : "TECH LAB"}
                      sub={isC ? "Multimedia production — video, design, motion & AI content" : "Academic & professional — software, security, AI, IoT, data"}
                      onBack={() => setSide("center")}
                    />
                    <div className="scroll-area flex-1 p-4 sm:p-5" data-noswipe tabIndex={0} aria-label={isC ? "Creative studio content" : "Tech lab content"}>
                      {isC ? <CreativeStudio /> : <TechLab />}
                    </div>
                  </motion.div>
                )}
                {state === "rail" && (
                  <motion.button
                    key="r"
                    className="grid h-full w-full place-items-center text-[var(--fg)]/80 transition hover:text-[var(--neon)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    onClick={() => setSide(which)}
                    aria-label={`Open ${which} panel`}
                  >
                    <span className="vtext font-mono text-xs">{which}</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative h-dvh w-full select-none overflow-hidden scanlines" style={{ touchAction: "pan-y" }} {...swipe}>
      <Atmosphere dim={expanded} />

      {/* Title */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-[9.5vh] z-10"
        initial={false}
        animate={{ opacity: expanded ? 0 : 1, y: expanded ? -30 : 0, scale: expanded ? 0.9 : 1 }}
        transition={{ duration: dur, ease }}
      >
        <HeroTitle />
      </motion.div>

      {/* Portrait */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[8.5vh] z-[15] flex justify-center">
        <motion.div
          className="parallax w-[min(70vh,44vw)] origin-bottom"
          style={{ ["--depth" as string]: -6 }}
          initial={{ opacity: 0, y: 60, scale: 0.94 }}
          animate={{ ...portraitPose[side], y: 0 }}
          transition={{ duration: dur, ease }}
        >
          <Portrait />
        </motion.div>
      </div>

      {/* Edge hints (desktop, center only) */}
      {!expanded && (
        <>
          <button onClick={() => setSide("creative")} aria-label="Open creative panel" className="vtext absolute left-3 top-1/2 z-20 -translate-y-1/2 font-mono text-[0.7rem] text-[var(--muted)] transition hover:text-[var(--neon)]">
            CREATIVE
          </button>
          <button onClick={() => setSide("tech")} aria-label="Open tech panel" className="vtext absolute right-3 top-1/2 z-20 -translate-y-1/2 font-mono text-[0.7rem] text-[var(--muted)] transition hover:text-[var(--neon)]">
            TECH
          </button>
        </>
      )}

      {panel("creative")}
      {panel("tech")}

      {/* Quote */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-[10.5vh] z-20 flex items-center justify-center gap-6 px-[6vw]"
        initial={false}
        animate={{ opacity: expanded ? 0 : 1, y: expanded ? 20 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="hidden h-px flex-1 bg-gradient-to-r from-transparent to-[var(--red)] lg:block" />
        <div className="rounded-sm bg-black/35 px-5 py-1 backdrop-blur-[2px]">
          <Quote />
        </div>
        <span className="hidden h-px flex-1 bg-gradient-to-l from-transparent to-[var(--red)] lg:block" />
      </motion.div>

      {/* Bottom bar */}
      <div className="absolute inset-x-0 bottom-0 z-30 flex items-end justify-between gap-3 px-4 pb-3 sm:px-6">
        <EduBadge />
        <button onClick={() => go("about")} className="group mb-1 flex items-center gap-3 font-mono text-xs text-[var(--fg)]/85 transition hover:text-[var(--neon)]" aria-label="Scroll to explore: open About">
          <ChevronsDown className="-rotate-90 text-[var(--red)]" size={18} />
          <span className="grid h-9 w-6 place-items-start justify-center rounded-full border border-[var(--fg)]/60 pt-1.5">
            <span className="h-2 w-0.5 animate-bounce bg-[var(--neon)]" />
          </span>
          Scroll to explore
          <ChevronsDown className="rotate-90 text-[var(--red)]" size={18} />
        </button>
        <Socials />
      </div>
    </div>
  );
}

function MobileHome() {
  const { side, setSide, go } = useNav();
  const [tab, setTab] = useState<"creative" | "tech">("creative");
  const startX = useRef<number | null>(null);

  useEffect(() => {
    if (side !== "center") setTab(side);
  }, [side]);

  const onCardDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
  };
  const onCardUp = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) > 50) setTab(dx < 0 ? "tech" : "creative");
  };

  // Escape closes the sheet; arrows switch tab
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && side !== "center") setSide("center");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [side, setSide]);

  const isC = tab === "creative";

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden scanlines">
      <div className="fixed inset-0 -z-0">
        <Atmosphere dim />
      </div>
      <div className="relative z-10 flex flex-col items-center px-4 pb-10 pt-[4.5rem]">
        <HeroTitle sizeClass="text-[clamp(2.1rem,11.6vw,4.4rem)]" />
        <div className="relative -mx-4 mt-2 w-[104%] max-w-[560px]">
          <Portrait />
        </div>
        <Quote className="-mt-4 px-2" />

        <div className="mt-6 w-full max-w-xl">
          <div role="tablist" aria-label="Choose a side" className="mb-3 grid grid-cols-2 border border-[var(--line)] bg-black/40">
            {(["creative", "tech"] as const).map((k, i) => (
              <button
                key={k}
                role="tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
                className={`min-h-12 font-display text-2xl font-bold uppercase italic tracking-wide transition ${tab === k ? "bg-[var(--red)] text-white" : "text-[var(--fg)]/80"}`}
              >
                0{i + 1} / {k}
              </button>
            ))}
          </div>

          <div onPointerDown={onCardDown} onPointerUp={onCardUp} style={{ touchAction: "pan-y" }} className="hud-wrap">
            <div className="hud">
              <div className="hud-in min-h-[22rem]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, x: isC ? -40 : 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isC ? 40 : -40 }}
                    transition={{ duration: 0.28, ease }}
                    className="h-full"
                  >
                    {isC ? (
                      <PanelSummary num="01" word="CREATIVE" sub="Multimedia & Creative" cats={creativeCats} cta="Explore Creative Studio" onCta={() => setSide("creative")} onExpand={() => setSide("creative")} />
                    ) : (
                      <PanelSummary num="02" word="TECH" sub="Academic & Professional" cats={techCats} cta="Explore Projects" onCta={() => go("projects")} onExpand={() => setSide("tech")} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
          <p className="mt-2 flex items-center justify-center gap-2 text-center font-mono text-[0.68rem] text-[var(--muted)]">
            <Mouse size={13} /> swipe the card to switch sides
          </p>
        </div>

        <div className="mt-6 flex w-full max-w-xl flex-col items-center gap-4">
          <EduBadge />
          <Socials />
          <button onClick={() => go("about")} className="btn-hud w-full max-w-xs">
            Scroll to explore <ChevronsDown size={18} />
          </button>
        </div>
      </div>

      {/* Full-screen sheet for expanded side */}
      <AnimatePresence>
        {side !== "center" && (
          <motion.div
            key="sheet"
            className="fixed inset-0 z-30 flex flex-col bg-[var(--bg)]"
            initial={{ x: side === "creative" ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: side === "creative" ? "-100%" : "100%" }}
            transition={{ duration: 0.5, ease }}
            role="dialog"
            aria-label={side === "creative" ? "Creative studio" : "Tech lab"}
          >
            <div className="pt-[4.2rem]" />
            <ExpandedHeader
              num={side === "creative" ? "01" : "02"}
              word={side === "creative" ? "CREATIVE" : "TECH"}
              sub={side === "creative" ? "Creative studio" : "Tech lab"}
              onBack={() => setSide("center")}
            />
            <div className="scroll-area flex-1 p-4" data-noswipe>
              {side === "creative" ? <CreativeStudio /> : <TechLab />}
            </div>
            <button onClick={() => setSide(side === "creative" ? "tech" : "creative")} className="btn-hud m-3">
              Switch to {side === "creative" ? "Tech" : "Creative"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  const mobile = useIsMobile();
  return mobile ? <MobileHome /> : <DesktopHome />;
}
