"use client";

import { useState } from "react";
import { Clapperboard, ImageIcon, Play, Sparkles, Wand2 } from "lucide-react";
import { creativeGroups } from "@/lib/data";
import { site } from "@/lib/site";

const icons = { video: Clapperboard, graphic: ImageIcon, motion: Wand2, ai: Sparkles } as const;

const gallery = [
  { t: "Cinematic edit", c: "Video" },
  { t: "Short-form reel", c: "Video" },
  { t: "Poster design", c: "Graphic" },
  { t: "Thumbnail set", c: "Graphic" },
  { t: "Animated typography", c: "Motion" },
  { t: "AI visual study", c: "AI" },
];

function Placeholder({ title, cat, ratio = "16 / 9" }: { title: string; cat: string; ratio?: string }) {
  return (
    <figure
      className="group relative grid place-items-center overflow-hidden border border-dashed border-[var(--line)]"
      style={{
        aspectRatio: ratio,
        background:
          "repeating-linear-gradient(135deg, rgba(229,9,32,.07) 0 10px, transparent 10px 20px), linear-gradient(160deg, #160c0e, #070506)",
      }}
    >
      <Play className="text-[var(--neon)] opacity-70 transition group-hover:scale-125 group-hover:opacity-100" size={34} />
      <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-black/60 px-3 py-2">
        <span className="text-sm text-white">{title}</span>
        <span className="chip chip-todo">{cat} · [ADD MEDIA]</span>
      </figcaption>
    </figure>
  );
}

function BeforeAfter() {
  const [pos, setPos] = useState(50);
  return (
    <div className="glass p-4">
      <p className="eyebrow">Before / After</p>
      <h4 className="font-display text-2xl font-bold uppercase">Color grading demo</h4>
      <p className="mb-3 text-xs text-[var(--muted)]">
        Built from the portrait cutout using CSS filters — replace with your own before/after frames.
      </p>
      <div
        className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden"
        style={{ background: "radial-gradient(circle at 50% 60%, rgba(229,9,32,.35), #050505 70%)" }}
      >
        {/* AFTER (graded) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/portrait.png" alt="Graded version" loading="lazy" className="absolute inset-0 h-full w-full object-contain" style={{ filter: "contrast(1.25) saturate(1.35) drop-shadow(0 0 18px rgba(229,9,32,.55))" }} />
        {/* BEFORE (flat) */}
        <div className="absolute inset-0 bg-[#2b2b2d]" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/portrait.png" alt="Ungraded version" loading="lazy" className="absolute inset-0 h-full w-full object-contain" style={{ filter: "grayscale(1) brightness(1.15) contrast(.8)" }} />
        </div>
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-[var(--neon)] shadow-[0_0_14px_var(--neon)]" style={{ left: `${pos}%` }} />
        <span className="absolute left-2 top-2 chip">BEFORE</span>
        <span className="absolute right-2 top-2 chip">AFTER</span>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Before and after comparison slider"
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
          data-noswipe
        />
      </div>
    </div>
  );
}

export default function CreativeStudio() {
  return (
    <div className="flex flex-col gap-4 pb-6">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2">
        {creativeGroups.map((g) => {
          const Icon = icons[g.id as keyof typeof icons];
          return (
            <section key={g.id} className="glass p-4" aria-labelledby={`cg-${g.id}`}>
              <div className="mb-3 flex items-center gap-3">
                <Icon className="text-[var(--neon)]" size={26} />
                <div>
                  <p className="eyebrow">Module {g.code}</p>
                  <h3 id={`cg-${g.id}`} className="font-display text-3xl font-bold uppercase leading-none">
                    {g.title}
                  </h3>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {g.items.map((i) => (
                  <span key={i} className="chip">
                    {i}
                  </span>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section className="glass p-4" aria-labelledby="showreel">
        <p className="eyebrow">Module E</p>
        <h3 id="showreel" className="mb-3 font-display text-3xl font-bold uppercase leading-none">
          Creative Showreel
        </h3>
        {site.showreel.src ? (
          <video controls preload="none" poster={site.showreel.poster || undefined} className="mb-4 aspect-video w-full bg-black" data-noswipe>
            <source src={site.showreel.src} />
          </video>
        ) : (
          <div className="mb-4">
            <Placeholder title="Featured showreel" cat="Video" />
            <p className="mt-2 font-mono text-xs text-[var(--muted)]">
              Add your reel at <code>public/media/showreel.mp4</code> and set <code>site.showreel.src</code> in
              lib/site.ts.
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {gallery.map((g) => (
            <Placeholder key={g.t} title={g.t} cat={g.c} />
          ))}
        </div>
      </section>

      <BeforeAfter />
    </div>
  );
}
