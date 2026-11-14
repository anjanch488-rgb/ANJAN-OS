"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import Page from "./Page";
import { aboutPanels, timeline } from "@/lib/data";
import { site } from "@/lib/site";

export default function About() {
  const [active, setActive] = useState<(typeof aboutPanels)[number]["id"]>("intro");
  const panel = aboutPanels.find((p) => p.id === active)!;

  return (
    <Page code="02 / ABOUT" title="About Me">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section aria-label="Profile" className="flex flex-col gap-4">
          <div role="tablist" aria-label="Profile sections" className="flex flex-wrap gap-2">
            {aboutPanels.map((p) => (
              <button
                key={p.id}
                role="tab"
                aria-selected={active === p.id}
                onClick={() => setActive(p.id)}
                className={`chip min-h-10 px-4 transition ${active === p.id ? "!bg-[var(--red)] !text-white !border-[var(--neon)]" : "hover:border-[var(--neon)]"}`}
              >
                {p.title}
              </button>
            ))}
          </div>
          <div className="hud-wrap">
            <div className="hud">
              <div className="hud-in min-h-56 p-6">
                <AnimatePresence mode="wait">
                  <motion.div key={panel.id} role="tabpanel" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                    <h2 className="font-display text-4xl font-bold uppercase leading-none text-[var(--red)]">{panel.title}</h2>
                    <p className="mt-3 text-lg leading-relaxed text-[var(--fg)]/90">{panel.body}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
          <div className="glass p-4">
            <p className="eyebrow mb-2">Identity</p>
            <div className="flex flex-wrap gap-2">
              {site.roles.map((r) => (
                <span key={r} className="chip">
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div className="glass flex items-start gap-4 p-4">
            <GraduationCap className="mt-1 shrink-0 text-[var(--red)]" size={30} />
            <div>
              <p className="eyebrow">Education</p>
              <p className="font-semibold">{site.degree}</p>
              <p className="text-sm text-[var(--muted)]">{site.collegeFull}</p>
              <p className="font-mono text-xs text-[var(--muted)]">
                {site.location} · Expected graduation {site.gradYear}
              </p>
            </div>
          </div>
        </section>

        <section aria-label="Timeline">
          <p className="eyebrow mb-4">Timeline</p>
          <ol className="relative ml-3 border-l border-[var(--line)]">
            {timeline.map((t, i) => (
              <motion.li
                key={i}
                className="relative mb-6 pl-6"
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <span className={`absolute -left-[7px] top-1.5 h-3.5 w-3.5 rotate-45 border border-[var(--neon)] ${t.todo ? "bg-transparent" : "bg-[var(--red)] shadow-[0_0_10px_var(--neon)]"}`} />
                <p className="font-mono text-xs text-[var(--neon)]">{t.when}</p>
                <h3 className={`font-display text-2xl font-bold uppercase leading-tight ${t.todo ? "text-[var(--muted)]" : ""}`}>{t.title}</h3>
                <p className="text-sm text-[var(--fg)]/80">{t.body}</p>
              </motion.li>
            ))}
          </ol>
        </section>
      </div>
    </Page>
  );
}
