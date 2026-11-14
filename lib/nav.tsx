"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type View = "home" | "about" | "projects" | "skills" | "contact";
export type Side = "center" | "creative" | "tech";

type NavState = { view: View; side: Side; project: string | null };

type NavCtx = NavState & {
  go: (view: View, opts?: { side?: Side; project?: string | null }) => void;
  setSide: (side: Side) => void;
  openProject: (id: string | null) => void;
  terminalOpen: boolean;
  setTerminalOpen: (v: boolean) => void;
  achievements: string[];
  unlock: (id: string, message: string) => void;
  notify: (message: string) => void;
  toasts: { id: number; text: string }[];
  theme: "dark" | "light";
  toggleTheme: () => void;
};

const Ctx = createContext<NavCtx | null>(null);

function parse(hash: string): NavState {
  const h = hash.replace(/^#\/?/, "");
  const [a, b] = h.split("/");
  switch (a) {
    case "about":
    case "skills":
    case "contact":
      return { view: a, side: "center", project: null };
    case "projects":
      return { view: "projects", side: "center", project: b || null };
    case "creative":
      return { view: "home", side: "creative", project: null };
    case "tech":
      return { view: "home", side: "tech", project: null };
    default:
      return { view: "home", side: "center", project: null };
  }
}

function toHash(s: NavState): string {
  if (s.view === "home") return s.side === "center" ? "#/" : `#/${s.side}`;
  if (s.view === "projects") return s.project ? `#/projects/${s.project}` : "#/projects";
  return `#/${s.view}`;
}

function safeGet(k: string): string | null {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
function safeSet(k: string, v: string) {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* storage unavailable */
  }
}

export function NavProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NavState>({ view: "home", side: "center", project: null });
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // hash -> state
  useEffect(() => {
    const apply = () => setState(parse(window.location.hash));
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  // restore persisted prefs
  useEffect(() => {
    try {
      const a = JSON.parse(safeGet("anjanos.achievements") ?? "[]");
      if (Array.isArray(a)) setAchievements(a.filter((x) => typeof x === "string"));
    } catch {
      /* ignore */
    }
    const t = safeGet("anjanos.theme");
    if (t === "light" || t === "dark") setTheme(t);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const commit = useCallback((next: NavState) => {
    setState(next);
    const h = toHash(next);
    if (window.location.hash !== h) history.pushState(null, "", h);
  }, []);

  const go = useCallback<NavCtx["go"]>(
    (view, opts) => commit({ view, side: view === "home" ? (opts?.side ?? "center") : "center", project: opts?.project ?? null }),
    [commit],
  );
  const setSide = useCallback((side: Side) => commit({ view: "home", side, project: null }), [commit]);
  const openProject = useCallback(
    (id: string | null) => commit({ view: "projects", side: "center", project: id }),
    [commit],
  );

  const unlock = useCallback((id: string, message: string) => {
    setAchievements((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      safeSet("anjanos.achievements", JSON.stringify(next));
      const tid = Date.now() + Math.random();
      setToasts((t) => [...t, { id: tid, text: message }]);
      window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== tid)), 4200);
      return next;
    });
  }, []);

  const notify = useCallback((message: string) => {
    const tid = Date.now() + Math.random();
    setToasts((t) => [...t, { id: tid, text: message }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== tid)), 4200);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const n = t === "dark" ? "light" : "dark";
      safeSet("anjanos.theme", n);
      return n;
    });
  }, []);

  const value = useMemo<NavCtx>(
    () => ({ ...state, go, setSide, openProject, terminalOpen, setTerminalOpen, achievements, unlock, notify, toasts, theme, toggleTheme }),
    [state, go, setSide, openProject, terminalOpen, achievements, unlock, notify, toasts, theme, toggleTheme],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNav() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useNav must be used inside NavProvider");
  return c;
}
