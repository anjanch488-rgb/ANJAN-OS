"use client";

import { ArrowRight, BrainCircuit, Clapperboard, Cpu, Database, GraduationCap, Image as Img, Palette, Play, Radio, Shield, Code2, Film, Layers } from "lucide-react";
import { Brand } from "./Icons";
import { site, socials } from "@/lib/site";
import { useNav } from "@/lib/nav";

export const creativeCats = [
  { t: "Video Editing & Motion Graphics", i: Play },
  { t: "Graphic Design", i: Palette },
  { t: "AI Content Creation", i: Img },
  { t: "Digital Storytelling", i: Clapperboard },
  { t: "Visual Effects & Animation", i: Film },
  { t: "Multimedia Projects", i: Layers },
];

export const techCats = [
  { t: "Software Development", i: Code2 },
  { t: "Cybersecurity", i: Shield },
  { t: "AI / ML", i: BrainCircuit },
  { t: "IoT & Embedded Systems", i: Radio },
  { t: "Data Engineering", i: Database },
  { t: "Education & Research", i: GraduationCap },
];

export function HeroTitle({ className = "", sizeClass = "text-[clamp(2.6rem,7.2vw,7.4rem)]" }: { className?: string; sizeClass?: string }) {
  return (
    <div className={`text-center ${className}`}>
      <h1 className={`hero-name ${sizeClass} whitespace-nowrap`}>
        <span className="metal-text">{site.first}</span> <span className="red-text">{site.last}</span>
      </h1>
      <div className="mt-1 flex items-center justify-center gap-3 sm:gap-5" aria-label={site.tagline.join(". ") + "."}>
        <span className="hidden h-px w-[10vw] bg-gradient-to-r from-transparent to-[var(--red)] sm:block" />
        <p className="font-mono text-[0.62rem] tracking-[0.5em] text-[var(--fg)]/90 sm:text-sm sm:tracking-[0.7em]">
          {site.tagline.join(" • ")}
        </p>
        <span className="hidden h-px w-[10vw] bg-gradient-to-l from-transparent to-[var(--red)] sm:block" />
      </div>
    </div>
  );
}

export function Quote({ className = "" }: { className?: string }) {
  const q = site.quote;
  return (
    <p className={`text-center text-[clamp(1rem,1.9vw,1.7rem)] font-light italic tracking-[0.12em] ${className}`}>
      “{q.before}
      <span className="font-medium not-italic text-[var(--neon)] drop-shadow-[0_0_8px_rgba(255,37,58,.7)]">{q.accent}</span>
      {q.after}”
    </p>
  );
}

export function Socials({ className = "" }: { className?: string }) {
  const { notify } = useNav();
  return (
    <ul className={`flex items-center gap-2 ${className}`}>
      {socials.map((s) => {
        const Icon = Brand[s.key];
        const cls =
          "grid h-11 w-11 place-items-center border border-[var(--line)] bg-black/40 text-[var(--fg)] transition hover:border-[var(--neon)] hover:bg-[var(--red)] hover:text-white hover:shadow-[0_0_16px_var(--neon)]";
        return (
          <li key={s.key}>
            {s.url ? (
              <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} className={cls}>
                <Icon className="h-5 w-5" />
              </a>
            ) : (
              <button
                aria-label={`${s.label} (link not set)`}
                className={`${cls} opacity-75`}
                onClick={() => notify(`${s.label} link not set — add NEXT_PUBLIC_${s.key.toUpperCase()}_URL to .env.local`)}
              >
                <Icon className="h-5 w-5" />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function EduBadge() {
  return (
    <div className="hud-wrap">
      <div className="hud hud-sm">
        <div className="hud-in flex items-center gap-3 px-4 py-2.5">
          <Cpu className="text-[var(--red)]" size={28} />
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-wide">
              {site.college} &rsquo;{site.gradYear.slice(2)}
            </p>
            <p className="font-mono text-[0.68rem] text-[var(--muted)]">{site.degreeShort}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PanelSummary({
  num,
  word,
  sub,
  cats,
  cta,
  onCta,
  onExpand,
}: {
  num: string;
  word: string;
  sub: string;
  cats: { t: string; i: React.ComponentType<{ size?: number; className?: string }> }[];
  cta: string;
  onCta: () => void;
  onExpand: () => void;
}) {
  return (
    <div className="flex h-full flex-col p-5 xl:p-6">
      <button onClick={onExpand} className="group text-left" aria-label={`Expand ${word.toLowerCase()} panel`}>
        <h2 className="font-display text-[clamp(2rem,3.1vw,3.3rem)] font-bold italic leading-none">
          <span className="text-[var(--fg)]/90">{num}</span> <span className="text-[var(--red)]/70">/</span>{" "}
          <span className="red-text transition group-hover:drop-shadow-[0_0_10px_var(--neon)]">{word}</span>
        </h2>
        <p className="mt-1 text-[clamp(.95rem,1.25vw,1.2rem)]">{sub}</p>
      </button>
      <ul className="mt-4 flex flex-1 flex-col justify-between gap-1 overflow-hidden">
        {cats.map(({ t, i: I }) => (
          <li key={t}>
            <button
              onClick={onExpand}
              className="group flex min-h-9 w-full items-center gap-4 text-left text-[clamp(.78rem,1vw,.98rem)] text-[var(--fg)]/85 transition hover:text-[var(--neon)]"
            >
              <I size={20} className="shrink-0 text-[var(--red)] transition group-hover:scale-110" />
              {t}
            </button>
          </li>
        ))}
      </ul>
      <button onClick={onCta} className="btn-hud mt-3 w-full text-[clamp(.8rem,1vw,.95rem)]">
        {cta} <ArrowRight size={17} />
      </button>
    </div>
  );
}
