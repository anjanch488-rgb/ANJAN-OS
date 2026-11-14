"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import TechViz from "./TechViz";
import { techGroups, type TechGroup } from "@/lib/data";
import { useNav } from "@/lib/nav";

function GroupCard({ g }: { g: TechGroup }) {
  const [sel, setSel] = useState(0);
  return (
    <section className="glass flex min-w-0 flex-col gap-3 p-4" aria-labelledby={`tg-${g.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Module {g.code}</p>
          <h3 id={`tg-${g.id}`} className="font-display text-3xl font-bold uppercase leading-none">
            {g.title}
          </h3>
        </div>
        <div className="h-20 w-36 shrink-0 opacity-90">
          <TechViz kind={g.viz} />
        </div>
      </div>
      <p className="text-sm text-[var(--muted)]">{g.blurb}</p>
      <div role="tablist" aria-label={`${g.title} topics`} className="flex flex-wrap gap-2">
        {g.items.map((it, i) => (
          <button
            key={it.name}
            role="tab"
            aria-selected={sel === i}
            onClick={() => setSel(i)}
            onMouseEnter={() => setSel(i)}
            onFocus={() => setSel(i)}
            className={`chip min-h-9 transition ${sel === i ? "!border-[var(--neon)] !bg-[var(--red)] !text-white" : "hover:border-[var(--neon)]"}`}
          >
            {it.name}
          </button>
        ))}
      </div>
      <p role="tabpanel" aria-live="polite" className="min-h-10 border-l-2 border-[var(--red)] pl-3 font-mono text-xs text-[var(--fg)]/85">
        {g.items[sel].note}
      </p>
    </section>
  );
}

export default function TechLab() {
  const nav = useNav();
  return (
    <div className="flex flex-col gap-4 pb-6">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-2">
        {techGroups.map((g) => (
          <GroupCard key={g.id} g={g} />
        ))}
        <section className="glass flex flex-col justify-between gap-4 p-4">
          <div>
            <p className="eyebrow">Next</p>
            <h3 className="font-display text-3xl font-bold uppercase leading-none">Project Lab</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              CyberShield-X, MeshGuard, RainWatch and CaptionForge — where these modules come together.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn-hud" onClick={() => nav.go("projects")}>
              Explore Projects <ArrowRight size={18} />
            </button>
            <button className="btn-hud" onClick={() => nav.go("skills")}>
              Tech Arsenal <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
