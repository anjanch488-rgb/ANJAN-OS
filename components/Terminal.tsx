"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useNav } from "@/lib/nav";
import { projects, skillCategories } from "@/lib/data";
import { site } from "@/lib/site";

type Line = { kind: "in" | "out" | "err" | "sys"; text: string };

const BANNER: Line[] = [
  { kind: "sys", text: "ANJAN.OS TERMINAL v1.0" },
  { kind: "sys", text: "Type `help` for available commands." },
];

const MATRIX = "01アイウエオカキクケコ░▒▓";

export default function Terminal() {
  const nav = useNav();
  const [lines, setLines] = useState<Line[]>(BANNER);
  const [value, setValue] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [hi, setHi] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    return () => returnFocus.current?.focus?.();
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [lines]);

  const push = useCallback((...l: Line[]) => setLines((p) => [...p, ...l]), []);
  const out = (text: string): Line => ({ kind: "out", text });

  const run = useCallback(
    (raw: string) => {
      const cmd = raw.trim();
      if (!cmd) return;
      push({ kind: "in", text: cmd });
      setHist((h) => [cmd, ...h].slice(0, 50));
      setHi(-1);
      const [c, ...args] = cmd.toLowerCase().split(/\s+/);
      switch (c) {
        case "help":
          push(
            out("Available commands:"),
            ...["about", "projects", "skills", "tech", "creative", "education", "contact", "clear"].map((x) => out("  " + x)),
          );
          break;
        case "about":
          push(out(`${site.name} — ${site.roles.join(" · ")}`), out("Opening ABOUT…"));
          nav.go("about");
          break;
        case "projects":
          push(out("Project Lab:"), ...projects.map((p) => out(`  ${p.id.padEnd(14)} ${p.tagline}`)), out("Tip: `open <project-id>` opens a project file."));
          nav.go("projects");
          break;
        case "open": {
          const p = projects.find((x) => x.id === args[0] || x.title.toLowerCase() === args[0]);
          if (!p) push({ kind: "err", text: `open: no project "${args[0] ?? ""}". Try: ${projects.map((x) => x.id).join(", ")}` });
          else {
            push(out(`Opening ${p.title}…`));
            nav.openProject(p.id);
          }
          break;
        }
        case "skills":
          push(out("Tech Arsenal:"), ...skillCategories.map((s) => out(`  ${s.name.padEnd(18)} ${s.skills.map((k) => k.name).join(", ")}`)));
          nav.go("skills");
          break;
        case "tech":
          push(out("Opening TECH lab: software · cybersecurity · AI/ML · IoT · data engineering"));
          nav.setSide("tech");
          break;
        case "creative":
          push(out("Opening CREATIVE studio: video · graphic design · motion · AI content"));
          nav.setSide("creative");
          break;
        case "education":
          push(out(site.degree), out(site.collegeFull), out(`${site.location} · Expected graduation ${site.gradYear}`));
          break;
        case "contact":
          push(out(site.email ? `Email: ${site.email}` : "Email: not set (see .env.example)"), out("Opening CONTACT…"));
          nav.go("contact");
          break;
        case "clear":
          setLines([]);
          break;
        case "home":
          nav.go("home");
          push(out("Returning home."));
          break;
        case "exit":
        case "quit":
          nav.setTerminalOpen(false);
          break;
        // ---- hidden commands ----
        case "whoami":
          push(out("anjan — develop. create. innovate."));
          nav.unlock("whoami", "ACHIEVEMENT UNLOCKED — whoami: self-aware shell");
          break;
        case "ls":
          push(out("about/  projects/  skills/  creative/  tech/  contact/  .secrets"));
          break;
        case "cat":
          if (args[0] === ".secrets") {
            push(out("“Powerful people make places powerful.”"), out("(there is nothing else. keep building.)"));
            nav.unlock("secrets", "ACHIEVEMENT UNLOCKED — .secrets: you read the manifesto");
          } else push({ kind: "err", text: `cat: ${args[0] ?? ""}: No such file` });
          break;
        case "sudo":
          push({ kind: "err", text: "anjan is not in the sudoers file. This incident will be reported." });
          nav.unlock("sudo", "ACHIEVEMENT UNLOCKED — sudo: nice try");
          break;
        case "matrix": {
          push(out(Array.from({ length: 6 }, () => Array.from({ length: 32 }, () => MATRIX[Math.floor(Math.random() * MATRIX.length)]).join("")).join("\n")));
          nav.unlock("matrix", "ACHIEVEMENT UNLOCKED — Wake up, Anjan");
          break;
        }
        case "coffee":
          push(out("  ( (\n   ) )\n  .______.\n  |      |]\n  \\      /\n   `----'   brewing… done."));
          nav.unlock("coffee", "ACHIEVEMENT UNLOCKED — Fuel acquired");
          break;
        case "hack":
          push(out("Scanning… 0 vulnerabilities found. This portfolio is defensive-only."), out("(Nmap says hi.)"));
          nav.unlock("hack", "ACHIEVEMENT UNLOCKED — White hat");
          break;
        case "theme":
          nav.toggleTheme();
          push(out("Theme toggled."));
          break;
        case "achievements":
          push(out(nav.achievements.length ? "Unlocked: " + nav.achievements.join(", ") : "No achievements yet. Explore."));
          break;
        default:
          push({ kind: "err", text: `${c}: command not found. Type \`help\`.` });
      }
    },
    [nav, push],
  );

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(value);
      setValue("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const n = Math.min(hi + 1, hist.length - 1);
      if (n >= 0) {
        setHi(n);
        setValue(hist[n]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const n = hi - 1;
      setHi(n);
      setValue(n >= 0 ? hist[n] : "");
    } else if (e.key === "Escape") {
      nav.setTerminalOpen(false);
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <motion.div
      role="dialog"
      aria-label="ANJAN.OS terminal"
      className="fixed inset-x-2 bottom-2 z-[60] sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[min(560px,92vw)]"
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.25 }}
      data-noswipe
    >
      <div className="hud-wrap">
        <div className="hud hud-sm">
          <div className="hud-in flex h-[min(58dvh,420px)] flex-col" style={{ background: "rgba(5,5,5,0.97)" }} onClick={() => inputRef.current?.focus()}>
            <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2">
              <span className="font-mono text-xs tracking-widest text-[var(--neon)]">● ANJAN.OS TERMINAL</span>
              <button onClick={() => nav.setTerminalOpen(false)} aria-label="Close terminal" className="grid h-9 w-9 place-items-center hover:text-[var(--neon)]">
                <X size={18} />
              </button>
            </div>
            <div ref={logRef} role="log" aria-live="polite" className="scroll-area flex-1 px-3 py-2 font-mono text-[0.8rem] leading-relaxed">
              {lines.map((l, i) => (
                <pre
                  key={i}
                  className={`m-0 whitespace-pre-wrap break-words font-[inherit] ${l.kind === "in" ? "text-white" : l.kind === "err" ? "text-[var(--neon)]" : l.kind === "sys" ? "text-[var(--muted)]" : "text-[#d6d7da]"}`}
                >
                  {l.kind === "in" ? "> " : ""}
                  {l.text}
                </pre>
              ))}
            </div>
            <label className="flex items-center gap-2 border-t border-[var(--line)] px-3 py-2 font-mono text-sm">
              <span aria-hidden className="text-[var(--neon)]">
                &gt;
              </span>
              <span className="sr-only">Terminal command</span>
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKey}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="send"
                className="min-h-9 flex-1 bg-transparent text-base text-white outline-none sm:text-sm"
                placeholder="type help"
              />
            </label>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
