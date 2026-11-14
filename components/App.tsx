"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NavProvider, useNav } from "@/lib/nav";
import { useReducedMotion } from "@/lib/hooks";
import Header from "./Header";
import Home from "./Home";
import About from "./About";
import Projects from "./Projects";
import Skills from "./Skills";
import Contact from "./Contact";
import Terminal from "./Terminal";
import Boot from "./Boot";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

function Shell() {
  const nav = useNav();
  const reduced = useReducedMotion();
  const [booted, setBooted] = useState(false);
  const done = useCallback(() => setBooted(true), []);

  useEffect(() => {
    if (reduced) setBooted(true);
  }, [reduced]);

  // Global shortcuts + easter eggs
  useEffect(() => {
    let seq: string[] = [];
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = !!t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);

      // Konami code
      seq = [...seq, e.key.length === 1 ? e.key.toLowerCase() : e.key].slice(-KONAMI.length);
      if (seq.join() === KONAMI.join()) {
        seq = [];
        document.body.classList.add("glitch");
        window.setTimeout(() => document.body.classList.remove("glitch"), 1100);
        nav.unlock("konami", "ACHIEVEMENT UNLOCKED — Konami code: ↑↑↓↓←→←→BA");
      }
      if (typing) return;
      if (e.key === "`" || (e.ctrlKey && e.key === "`")) {
        e.preventDefault();
        nav.setTerminalOpen(!nav.terminalOpen);
      } else if (!e.altKey && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === "t" && e.shiftKey) {
        nav.toggleTheme();
      } else if (e.altKey && e.key.toLowerCase() === "p") {
        nav.go("projects");
        nav.unlock("shortcut", "ACHIEVEMENT UNLOCKED — Power user: Alt+P");
      } else if (e.key === "?" && e.shiftKey) {
        nav.notify("Shortcuts: ` terminal · ←/→ sides · Esc back · Alt+P projects · Shift+T theme");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nav]);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:bg-[var(--red)] focus:px-3 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <AnimatePresence>{!booted && <Boot key="boot" onDone={done} />}</AnimatePresence>
      <Header />
      <div id="main">
        <Home />
      </div>
      <AnimatePresence mode="wait">
        {nav.view === "about" && <About key="about" />}
        {nav.view === "projects" && <Projects key="projects" />}
        {nav.view === "skills" && <Skills key="skills" />}
        {nav.view === "contact" && <Contact key="contact" />}
      </AnimatePresence>
      <AnimatePresence>{nav.terminalOpen && <Terminal key="term" />}</AnimatePresence>

      {/* Toasts */}
      <div className="pointer-events-none fixed inset-x-0 top-20 z-[90] flex flex-col items-center gap-2 px-3" aria-live="polite" role="status">
        <AnimatePresence>
          {nav.toasts.map((t) => (
            <motion.p
              key={t.id}
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="hud-wrap max-w-md"
            >
              <span className="block border border-[var(--neon)] bg-black/90 px-4 py-2 font-mono text-xs text-white shadow-[0_0_20px_rgba(255,37,58,.45)]">{t.text}</span>
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

export default function App() {
  return (
    <NavProvider>
      <Shell />
    </NavProvider>
  );
}
