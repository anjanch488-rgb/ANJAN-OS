"use client";

import { useRef, useState } from "react";
import { Menu, Moon, SquareTerminal, Sun, X } from "lucide-react";
import { Logo } from "./Icons";
import MusicButton from "./MusicButton";
import { navItems, type NavId } from "@/lib/site";
import { useNav } from "@/lib/nav";

export default function Header() {
  const nav = useNav();
  const [open, setOpen] = useState(false);
  const clicks = useRef({ n: 0, t: 0 });

  const active: NavId =
    nav.view === "home" ? (nav.side === "creative" ? "creative" : "home") : (nav.view as NavId);

  const go = (id: NavId) => {
    setOpen(false);
    if (id === "home") nav.go("home");
    else if (id === "creative") nav.go("home", { side: "creative" });
    else nav.go(id);
  };

  // Easter egg: click the logo five times quickly.
  const onLogo = () => {
    const now = Date.now();
    const c = clicks.current;
    c.n = now - c.t < 700 ? c.n + 1 : 1;
    c.t = now;
    if (c.n >= 5) {
      c.n = 0;
      document.body.classList.add("glitch");
      window.setTimeout(() => document.body.classList.remove("glitch"), 1100);
      nav.unlock("logo", "ACHIEVEMENT UNLOCKED — Logo glitch: you found the signal");
    } else if (nav.view !== "home" || nav.side !== "center") {
      nav.go("home");
    }
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
      <div className="pointer-events-auto mx-auto flex max-w-[1800px] items-center justify-between gap-3 px-3 py-3 sm:px-6">
        <button onClick={onLogo} className="flex items-center gap-3 text-left" aria-label="ANJAN.OS home">
          <Logo className="h-9 w-9 drop-shadow-[0_0_8px_rgba(255,37,58,.7)]" />
          <span className="leading-none">
            <span className="block font-display text-2xl font-bold tracking-wide">ANJAN.OS</span>
            <span className="hidden font-mono text-[0.58rem] tracking-[0.2em] text-[var(--muted)] sm:block">
              BUILD · SECURE · CREATE
            </span>
          </span>
        </button>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {navItems.map((it) => {
            const on = active === it.id;
            return (
              <button
                key={it.id}
                onClick={() => go(it.id)}
                aria-current={on ? "page" : undefined}
                className={`group relative px-4 py-3 text-sm font-medium tracking-wide transition-colors ${on ? "text-[var(--red)]" : "text-[var(--fg)]/85 hover:text-[var(--neon)]"}`}
              >
                <span className="mr-1.5 font-mono text-[0.65rem] text-[var(--muted)]">[{it.n}]</span>
                {it.label}
                <span
                  className={`absolute inset-x-3 bottom-1 h-[2px] origin-left bg-[var(--red)] shadow-[0_0_10px_var(--neon)] transition-transform ${on ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                />
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <MusicButton />
          <button
            onClick={nav.toggleTheme}
            aria-label={`Switch to ${nav.theme === "dark" ? "light" : "dark"} theme`}
            className="grid h-11 w-11 place-items-center text-[var(--fg)] transition hover:text-[var(--neon)]"
          >
            {nav.theme === "dark" ? <Sun size={22} /> : <Moon size={22} />}
          </button>
          <button
            onClick={() => nav.setTerminalOpen(true)}
            aria-label="Open terminal (shortcut: backtick)"
            aria-haspopup="dialog"
            className="grid h-11 w-12 place-items-center border border-[var(--red)] bg-[rgba(229,9,32,.08)] text-[var(--neon)] transition hover:bg-[var(--red)] hover:text-white hover:shadow-[0_0_18px_var(--neon)]"
          >
            <SquareTerminal size={22} />
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid h-11 w-11 place-items-center lg:hidden"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Mobile" className="pointer-events-auto mx-3 mb-2 border border-[var(--line)] bg-[var(--panel)] p-2 backdrop-blur-xl lg:hidden">
          {navItems.map((it) => (
            <button
              key={it.id}
              onClick={() => go(it.id)}
              aria-current={active === it.id ? "page" : undefined}
              className={`flex min-h-12 w-full items-center gap-3 px-3 text-left text-base tracking-wide ${active === it.id ? "text-[var(--red)]" : ""}`}
            >
              <span className="font-mono text-xs text-[var(--muted)]">[{it.n}]</span>
              {it.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
