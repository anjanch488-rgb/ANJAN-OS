"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Cloud, Captions, ExternalLink, Network, ShieldCheck, X } from "lucide-react";
import Page from "./Page";
import { projects, type Project } from "@/lib/data";
import { useNav } from "@/lib/nav";

const icons = { shield: ShieldCheck, mesh: Network, cloud: Cloud, caption: Captions } as const;

function Architecture({ nodes }: { nodes: string[] }) {
  const w = 172;
  const gap = 34;
  const total = nodes.length * w + (nodes.length - 1) * gap;
  return (
    <div className="scroll-area overflow-x-auto" data-noswipe>
      <svg viewBox={`0 0 ${total + 20} 90`} className="h-24 min-w-[640px] w-full" role="img" aria-label={`Architecture: ${nodes.join(" to ")}`}>
        {nodes.map((n, i) => {
          const x = 10 + i * (w + gap);
          return (
            <g key={n}>
              <rect x={x} y="22" width={w} height="46" fill="#120a0b" stroke="#ff253a" strokeWidth="1.3" />
              <path d={`M${x} 30V22h8`} stroke="#fff" strokeWidth="1.5" />
              <text x={x + w / 2} y="50" textAnchor="middle" fontSize="11" fill="#f5f5f5" fontFamily="monospace">
                {n}
              </text>
              {i < nodes.length - 1 && <line x1={x + w} y1="45" x2={x + w + gap} y2="45" stroke="#ff253a" strokeWidth="2" className="flow" />}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function LinkOrNot({ href, label }: { href: string; label: string }) {
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="btn-hud">
      {label} <ExternalLink size={16} />
    </a>
  ) : (
    <button className="btn-hud" disabled aria-label={`${label} (not set yet)`} title="Not set — add the URL in lib/data.ts">
      {label} · not set
    </button>
  );
}

function Detail({ p, onClose }: { p: Project; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const Icon = icons[p.icon];
  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-3 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`${p.title} details`}
        className="hud-wrap max-h-[94dvh] w-full max-w-5xl"
        initial={{ y: 40, scale: 0.97, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hud">
          <div className="hud-in flex max-h-[94dvh] flex-col">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] p-5">
              <div className="flex items-center gap-4">
                <Icon className="text-[var(--neon)]" size={40} />
                <div>
                  <p className="eyebrow">Project file</p>
                  <h2 className="font-display text-4xl font-bold uppercase leading-none sm:text-5xl">{p.title}</h2>
                  <p className="text-sm text-[var(--muted)]">{p.tagline}</p>
                </div>
              </div>
              <button ref={closeRef} onClick={onClose} className="btn-hud" aria-label="Close project">
                <X size={18} />
              </button>
            </div>
            <div className="scroll-area flex-1 space-y-5 p-5" data-noswipe>
              <p className="text-lg text-[var(--fg)]/90">{p.description}</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="glass p-4">
                  <p className="eyebrow mb-1">Problem</p>
                  <p className="text-sm leading-relaxed">{p.problem}</p>
                </div>
                <div className="glass p-4">
                  <p className="eyebrow mb-1">Solution</p>
                  <p className="text-sm leading-relaxed">{p.solution}</p>
                </div>
              </div>
              <div>
                <p className="eyebrow mb-2">Technology stack {p.stackIsPlaceholder && <span className="chip chip-todo ml-2"></span>}</p>
                <div className="flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <span key={s} className="chip">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="eyebrow mb-1">Architecture <span className="chip chip-todo ml-2">draft diagram — edit</span></p>
                <div className="glass p-3">
                  <Architecture nodes={p.architecture} />
                </div>
              </div>
              <div>
                <p className="eyebrow mb-2">Screenshots</p>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {(p.screenshots.length ? p.screenshots : ["", "", ""]).map((s, i) =>
                    s ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={s} src={s} alt={`${p.title} screenshot ${i + 1}`} loading="lazy" className="aspect-video w-full border border-[var(--line)] object-cover" />
                    ) : (
                      <div key={i} className="grid aspect-video place-items-center border border-dashed border-[var(--line)] font-mono text-xs text-[var(--muted)]" style={{ background: "repeating-linear-gradient(135deg, rgba(229,9,32,.07) 0 10px, transparent 10px 20px)" }}>
                        [ADD SCREENSHOT {i + 1}]
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 border-t border-[var(--line)] pt-4">
                <span className={`chip ${p.statusIsPlaceholder ? "chip-todo" : ""}`}>STATUS: {p.status}</span>
                <LinkOrNot href={p.github} label="GitHub" />
                <LinkOrNot href={p.demo} label="Live demo" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Projects() {
  const { project, openProject } = useNav();
  const current = projects.find((p) => p.id === project) ?? null;

  return (
    <>
      <Page code="03 / PROJECT LAB" title="Project Lab">
        <p className="mb-6 max-w-2xl text-[var(--fg)]/80">
          Four builds across security, IoT, data and AI. Open a file for the problem, solution, stack and architecture.
           <span className="chip chip-todo">Disclimer</span> Project repos and Git-links are not available because they are still building. Once Deployed links will we live .
        </p>
        <ul className="grid gap-5 md:grid-cols-2">
          {projects.map((p, i) => {
            const Icon = icons[p.icon];
            return (
              <motion.li key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }}>
                <button onClick={() => openProject(p.id)} className="hud-wrap group block h-full w-full text-left" aria-label={`Open ${p.title}`}>
                  <div className="hud h-full transition group-hover:brightness-125">
                    <div className="hud-in flex h-full flex-col gap-3 p-5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-[var(--muted)]">PRJ-0{i + 1}</span>
                        <Icon className="text-[var(--neon)] transition group-hover:scale-110" size={30} />
                      </div>
                      <h2 className="font-display text-4xl font-bold uppercase leading-none">{p.title}</h2>
                      <p className="text-sm text-[var(--fg)]/80">{p.tagline}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.stack.slice(0, 4).map((s) => (
                          <span key={s} className="chip">
                            {s}
                          </span>
                        ))}
                      </div>
                      <span className="mt-auto flex items-center gap-1 font-mono text-xs text-[var(--neon)]">
                        OPEN FILE <ArrowUpRight size={14} />
                      </span>
                    </div>
                  </div>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </Page>
      <AnimatePresence>{current && <Detail key={current.id} p={current} onClose={() => openProject(null)} />}</AnimatePresence>
    </>
  );
}
