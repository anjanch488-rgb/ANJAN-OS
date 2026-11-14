"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Page from "./Page";
import { projects, skillCategories } from "@/lib/data";
import { useNav } from "@/lib/nav";

type Sel = { cat: string; skill: string };

const CX = 400;
const CY = 320;

export default function Skills() {
  const { openProject } = useNav();
  const [sel, setSel] = useState<Sel>({ cat: "programming", skill: "Python" });
  const [hoverCat, setHoverCat] = useState<string | null>(null);

  const layout = useMemo(
    () =>
      skillCategories.map((c, i) => {
        const a = (i / skillCategories.length) * Math.PI * 2 - Math.PI / 2;
        const x = CX + Math.cos(a) * 160;
        const y = CY + Math.sin(a) * 170;
        const skills = c.skills.map((s, j) => {
          const span = Math.min(Math.PI * 0.95, 0.62 * (c.skills.length - 1));
          const sa = a + (c.skills.length === 1 ? 0 : (j / (c.skills.length - 1) - 0.5) * span);
          return { s, x: x + Math.cos(sa) * 112, y: y + Math.sin(sa) * 100 };
        });
        return { c, x, y, skills };
      }),
    [],
  );

  const cat = skillCategories.find((c) => c.id === sel.cat)!;
  const skill = cat.skills.find((s) => s.name === sel.skill) ?? cat.skills[0];
  const related = projects.filter((p) => skill.projects.includes(p.id));

  return (
    <Page code="05 / ARSENAL" title="Tech Arsenal" wide>
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        {/* Constellation (desktop / tablet) */}
        <div className="glass hidden p-2 md:block">
          <svg viewBox="0 0 800 640" className="h-auto w-full" role="group" aria-label="Skills constellation. Use Tab and Enter to explore.">
            {layout.map(({ c, x, y, skills }) => (
              <g key={c.id} opacity={hoverCat && hoverCat !== c.id ? 0.35 : 1} style={{ transition: "opacity .25s" }}>
                <line x1={CX} y1={CY} x2={x} y2={y} stroke="#e50920" strokeOpacity=".45" strokeDasharray="3 5" />
                {skills.map(({ s, x: sx, y: sy }) => (
                  <line key={s.name} x1={x} y1={y} x2={sx} y2={sy} stroke="#ff253a" strokeOpacity=".4" />
                ))}
              </g>
            ))}
            {/* core */}
            <g>
              <circle cx={CX} cy={CY} r="46" fill="#120a0b" stroke="#ff253a" strokeWidth="2" className="pulse" />
              <text x={CX} y={CY - 2} textAnchor="middle" fontSize="15" fill="#fff" fontFamily="var(--font-display)" fontWeight="700">ANJAN</text>
              <text x={CX} y={CY + 16} textAnchor="middle" fontSize="11" fill="#ff253a" fontFamily="monospace">.OS</text>
            </g>
            {layout.map(({ c, x, y, skills }, ci) => (
              <g key={c.id} opacity={hoverCat && hoverCat !== c.id ? 0.35 : 1} style={{ transition: "opacity .25s" }} onMouseEnter={() => setHoverCat(c.id)} onMouseLeave={() => setHoverCat(null)}>
                <g
                  role="button"
                  tabIndex={0}
                  aria-label={`${c.name} category`}
                  onClick={() => setSel({ cat: c.id, skill: c.skills[0].name })}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSel({ cat: c.id, skill: c.skills[0].name })}
                  className="cursor-pointer"
                >
                  <rect x={x - 54} y={y - 17} width="108" height="34" fill={sel.cat === c.id ? "#e50920" : "#120a0b"} stroke="#ff253a" strokeWidth="1.4" />
                  <text x={x} y={y + 5} textAnchor="middle" fontSize="13" fill="#fff" fontFamily="var(--font-ui)" fontWeight="600">{c.name.toUpperCase()}</text>
                </g>
                {skills.map(({ s, x: sx, y: sy }, si) => {
                  const on = sel.cat === c.id && sel.skill === s.name;
                  return (
                    <g
                      key={s.name}
                      role="button"
                      tabIndex={0}
                      aria-label={`${s.name}, ${c.name}`}
                      aria-pressed={on}
                      onClick={() => setSel({ cat: c.id, skill: s.name })}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSel({ cat: c.id, skill: s.name })}
                      className="cursor-pointer"
                    >
                      <motion.g animate={{ y: [0, ci % 2 ? -3 : 3, 0] }} transition={{ duration: 4 + si, repeat: Infinity, ease: "easeInOut" }}>
                        <circle cx={sx} cy={sy} r={on ? 9 : 6} fill={on ? "#ff253a" : "#0b0708"} stroke="#ff253a" strokeWidth="1.5" />
                        <text x={sx + (sx >= x ? 12 : -12)} y={sy + 4} textAnchor={sx >= x ? "start" : "end"} fontSize="11" fill={on ? "#fff" : "#c4c6ca"} fontFamily="var(--font-mono)">{s.name}</text>
                      </motion.g>
                    </g>
                  );
                })}
              </g>
            ))}
          </svg>
        </div>

        {/* Mobile list */}
        <div className="space-y-3 md:hidden">
          {skillCategories.map((c) => (
            <div key={c.id} className="glass p-3">
              <p className="eyebrow mb-2">{c.name}</p>
              <div className="flex flex-wrap gap-2">
                {c.skills.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => setSel({ cat: c.id, skill: s.name })}
                    aria-pressed={sel.cat === c.id && sel.skill === s.name}
                    className={`chip min-h-10 px-3 ${sel.cat === c.id && sel.skill === s.name ? "!bg-[var(--red)] !text-white" : ""}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Detail */}
        <aside aria-live="polite" className="hud-wrap h-fit lg:sticky lg:top-4">
          <div className="hud">
            <div className="hud-in p-5">
              <p className="eyebrow">{cat.name}</p>
              <h2 className="font-display text-5xl font-bold uppercase leading-none text-[var(--red)]">{skill.name}</h2>
              <p className="mt-3 text-[var(--fg)]/90">{skill.description}</p>

              <p className="eyebrow mb-2 mt-5">Related tools</p>
              <div className="flex flex-wrap gap-2">
                {skill.tools.map((t) => (
                  <span key={t} className={`chip ${t.startsWith("[EDIT") ? "chip-todo" : ""}`}>
                    {t}
                  </span>
                ))}
              </div>

              <p className="eyebrow mb-2 mt-5">Related projects</p>
              <div className="flex flex-wrap gap-2">
                {related.length ? (
                  related.map((p) => (
                    <button key={p.id} onClick={() => openProject(p.id)} className="chip min-h-9 transition hover:!bg-[var(--red)] hover:!text-white">
                      {p.title} →
                    </button>
                  ))
                ) : (
                  <span className="font-mono text-xs text-[var(--muted)]">None linked yet</span>
                )}
              </div>

              <p className="eyebrow mb-2 mt-5">Learning status</p>
              <div className="flex gap-1" role="img" aria-label={`Status: ${skill.status}`}>
                {(["Exploring", "Learning", "Using"] as const).map((s) => (
                  <span
                    key={s}
                    className={`flex-1 border px-2 py-1.5 text-center font-mono text-xs ${s === skill.status ? "border-[var(--neon)] bg-[var(--red)] text-white" : "border-[var(--line)] text-[var(--muted)]"}`}
                  >
                    {s}
                  </span>
                ))}
              </div>
              <p className="mt-2 font-mono text-[0.68rem] text-[var(--muted)]">Status describes where I am with it — not a proficiency score.</p>
            </div>
          </div>
        </aside>
      </div>
    </Page>
  );
}
