"use client";

import { useEffect, useRef } from "react";
import { useIsMobile, useReducedMotion } from "@/lib/hooks";

const DEBRIS = [
  { l: "3%", t: "22%", w: 54, h: 40, r: -12, d: 0, dur: 10, c: "polygon(10% 0,90% 15%,100% 70%,60% 100%,0 75%)" },
  { l: "12%", t: "58%", w: 34, h: 28, r: 20, d: 1.2, dur: 8, c: "polygon(0 20%,70% 0,100% 55%,45% 100%)" },
  { l: "88%", t: "18%", w: 62, h: 46, r: 10, d: 0.6, dur: 11, c: "polygon(15% 0,100% 20%,85% 100%,0 70%)" },
  { l: "93%", t: "62%", w: 30, h: 26, r: -25, d: 2, dur: 9, c: "polygon(20% 0,100% 30%,70% 100%,0 60%)" },
  { l: "30%", t: "12%", w: 16, h: 14, r: 5, d: 0.3, dur: 7, c: "polygon(0 30%,60% 0,100% 70%,30% 100%)" },
  { l: "72%", t: "10%", w: 20, h: 16, r: 40, d: 1.8, dur: 8.5, c: "polygon(10% 0,100% 40%,60% 100%,0 60%)" },
  { l: "22%", t: "78%", w: 22, h: 18, r: -8, d: 0.9, dur: 9.5, c: "polygon(0 0,100% 30%,80% 100%,10% 70%)" },
  { l: "80%", t: "80%", w: 26, h: 20, r: 15, d: 1.5, dur: 10.5, c: "polygon(20% 0,100% 20%,90% 100%,0 80%)" },
] as const;

/** Layered cinematic backdrop: glow, holographic ring, debris, rocks, particles. */
export default function Atmosphere({ dim = false }: { dim?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const mobile = useIsMobile();
  const reduced = useReducedMotion();

  // Pointer parallax -> CSS variables (rAF throttled)
  useEffect(() => {
    if (reduced) return;
    const el = document.documentElement;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--mx", String(((e.clientX / window.innerWidth) * 2 - 1).toFixed(3)));
        el.style.setProperty("--my", String(((e.clientY / window.innerHeight) * 2 - 1).toFixed(3)));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  // Ember particles
  useEffect(() => {
    const c = canvas.current;
    if (!c || reduced) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const count = mobile ? 28 : 70;
    type P = { x: number; y: number; r: number; vx: number; vy: number; a: number; red: boolean };
    let ps: P[] = [];
    const resize = () => {
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const spawn = (): P => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -(Math.random() * 0.35 + 0.08),
      a: Math.random() * 0.6 + 0.15,
      red: Math.random() > 0.35,
    });
    resize();
    ps = Array.from({ length: count }, spawn);
    let raf = 0;
    let running = true;
    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -4) {
          p.y = h + 4;
          p.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.red ? `rgba(255,37,58,${p.a})` : `rgba(235,235,238,${p.a * 0.6})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    const onVis = () => {
      running = !document.hidden;
      if (running) tick();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", resize);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", resize);
    };
  }, [mobile, reduced]);

  return (
    <div ref={root} aria-hidden className="absolute inset-0 overflow-hidden" style={{ opacity: dim ? 0.55 : 1 }}>
      {/* base glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 58%, rgba(229,9,32,0.28), rgba(229,9,32,0.06) 55%, transparent 75%), radial-gradient(40% 30% at 50% 100%, rgba(255,37,58,0.22), transparent 70%), var(--bg)",
        }}
      />
      {/* slow rotating god-rays behind the subject */}
      <div className="rays" />
      {/* drifting red fog banks */}
      <div className="fog fog-a" />
      <div className="fog fog-b" />
      {/* soft red light that follows the pointer */}
      <div className="spot" />
      {/* sonar pulses from the ring */}
      <div className="pulse-ring" />
      <div className="pulse-ring" style={{ animationDelay: "3s" }} />
      {/* holographic ring */}
      <div className="parallax absolute left-1/2 top-[56%] aspect-square w-[min(78vh,92vw)] -translate-x-1/2 -translate-y-1/2" style={{ ["--depth" as string]: 6 }}>
        <svg viewBox="0 0 400 400" className="h-full w-full" fill="none">
          <g className="ring-a">
            <circle cx="200" cy="200" r="190" stroke="#e50920" strokeWidth="1.2" opacity=".55" />
            <circle cx="200" cy="200" r="176" stroke="#ff253a" strokeWidth="5" strokeDasharray="70 32 10 32" opacity=".75" />
            {Array.from({ length: 36 }).map((_, i) => (
              <line key={i} x1="200" y1="14" x2="200" y2={i % 3 === 0 ? 26 : 20} stroke="#ff253a" strokeWidth="1" opacity=".6" transform={`rotate(${i * 10} 200 200)`} />
            ))}
          </g>
          <g className="ring-b">
            <circle cx="200" cy="200" r="150" stroke="#e50920" strokeWidth="1" strokeDasharray="2 6" opacity=".6" />
            <circle cx="200" cy="200" r="140" stroke="#ff253a" strokeWidth="2.5" strokeDasharray="40 90" opacity=".6" />
          </g>
        </svg>
      </div>
      {/* debris */}
      {DEBRIS.map((d, i) => (
        <div
          key={i}
          className="parallax absolute"
          style={{ left: d.l, top: d.t, ["--depth" as string]: 8 + (i % 4) * 7 }}
        >
          <div
            className="debris"
            style={
              {
                width: d.w,
                height: d.h,
                clipPath: d.c,
                ["--r0" as string]: `${d.r}deg`,
                ["--dur" as string]: `${d.dur}s`,
                ["--delay" as string]: `${d.d}s`,
                ["--fx" as string]: `${(i % 2 ? -1 : 1) * 8}px`,
              } as React.CSSProperties
            }
          />
        </div>
      ))}
      {/* foreground rocks */}
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1600 260" preserveAspectRatio="none" style={{ height: "30%" }}>
        <defs>
          <linearGradient id="rockL" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a2123" />
            <stop offset="1" stopColor="#070506" />
          </linearGradient>
        </defs>
        <polygon points="0,260 0,120 70,70 150,110 240,40 330,120 400,170 470,260" fill="url(#rockL)" stroke="#e50920" strokeOpacity=".55" strokeWidth="1.5" />
        <polygon points="1600,260 1600,90 1520,60 1450,120 1370,80 1290,150 1210,190 1150,260" fill="url(#rockL)" stroke="#e50920" strokeOpacity=".55" strokeWidth="1.5" />
        <polygon points="470,260 560,200 650,235 760,215 880,240 1010,205 1150,260" fill="#050405" stroke="#ff253a" strokeOpacity=".3" strokeWidth="1" />
      </svg>
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
      <div className="vignette" />
    </div>
  );
}
