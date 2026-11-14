"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { useNav } from "@/lib/nav";
import { useReducedMotion } from "@/lib/hooks";
import type { SmokeFrame } from "@/lib/smoke";
import SmokeCanvas from "./SmokeCanvas";

/** Positions as % of the portrait box. */
const TIP = { x: 66.6, y: 46.4 }; // cigarette tip
const MOUTH = { x: 60.0, y: 44.0 }; // exhale origin

/**
 * Cutout portrait with red rim light, a breathing aura, a scan sweep, a gentle 3D tilt that follows
 * the pointer, and LIVE 3D smoke (WebGL) that rises from the cigarette — see lib/smoke.ts.
 */
export default function Portrait({ className = "" }: { className?: string }) {
  const { unlock } = useNav();
  const reduced = useReducedMotion();
  const [fallback, setFallback] = useState(false);
  const tilt = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);

  // Driven by the smoke loop (single rAF): tilt the portrait and light the face from the ember.
  const onFrame = useCallback((f: SmokeFrame) => {
    const t = tilt.current;
    if (t) t.style.transform = `perspective(1100px) rotateY(${(f.yaw * 9).toFixed(2)}deg) rotateX(${(-f.pitch * 7).toFixed(2)}deg)`;
    const g = glow.current;
    if (g) g.style.opacity = (0.1 + 0.6 * f.ember).toFixed(3);
  }, []);

  const showCssSmoke = fallback && !reduced;

  return (
    <div
      className={`relative select-none ${className}`}
      style={{ aspectRatio: "1340 / 1160" }}
      onDoubleClick={() => unlock("portrait", "ACHIEVEMENT UNLOCKED — Identity confirmed: ANJAN")}
      title="ID: ANJAN — double-click to verify"
    >
      <div ref={tilt} className="absolute inset-0 will-change-transform" style={{ transformOrigin: "50% 100%" }}>
        {/* breathing red aura behind the subject */}
        <div className="portrait-aura pointer-events-none absolute inset-[-10%]" aria-hidden />

        <Image
          src="/portrait.png"
          alt="Chinthala Anjan in a black hoodie, looking to the side with a cigarette, red rim light"
          fill
          priority
          sizes="(max-width: 900px) 92vw, 46vw"
          draggable={false}
          className="pointer-events-none object-contain"
          style={{
            filter: "drop-shadow(0 0 2px rgba(255,37,58,.75)) drop-shadow(0 0 26px rgba(229,9,32,.45))",
            WebkitMaskImage: "linear-gradient(to bottom, #000 78%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, #000 78%, transparent 100%)",
          }}
        />

        {/* red scan sweep that only shows on the subject (masked by the cutout) */}
        {!reduced && (
          <div className="portrait-sweep pointer-events-none absolute inset-0" aria-hidden>
            <span />
          </div>
        )}

        {/* warm ember light on the face — brightens when he takes a drag */}
        <div
          ref={glow}
          className="pointer-events-none absolute"
          aria-hidden
          style={{
            left: "46%",
            top: "29%",
            width: "36%",
            height: "36%",
            opacity: 0.22,
            mixBlendMode: "screen",
            background: "radial-gradient(circle at 50% 50%, rgba(255,125,55,.5), rgba(255,60,20,.16) 42%, transparent 70%)",
          }}
        />

        {/* LIVE 3D smoke */}
        <SmokeCanvas tip={TIP} mouth={MOUTH} onFrame={onFrame} onUnavailable={() => setFallback(true)} />

        {/* Fallbacks: static ember (reduced motion / no WebGL) + old CSS wisps (no WebGL only) */}
        {(fallback || reduced) && (
          <div className="pointer-events-none absolute" style={{ left: `${TIP.x}%`, top: `${TIP.y}%` }} aria-hidden>
            <span className="ember" />
            {showCssSmoke &&
              [0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="wisp"
                  style={
                    {
                      left: -6,
                      top: -10,
                      ["--dur" as string]: `${4 + i * 0.7}s`,
                      ["--delay" as string]: `${i * 1.1}s`,
                      ["--sx" as string]: `${i % 2 ? -10 : 16}px`,
                    } as React.CSSProperties
                  }
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
