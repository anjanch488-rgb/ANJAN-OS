"use client";

import { useEffect, useRef } from "react";
import { createSmoke, type SmokeFrame } from "@/lib/smoke";
import { useIsMobile, useReducedMotion } from "@/lib/hooks";

/** Canvas box as a percentage of the portrait box (it overhangs the image so smoke can rise freely). */
export const SMOKE_BOX = { left: 28, top: -30, w: 76, h: 90 } as const;

/** Convert a point given as % of the portrait box into a fraction of the smoke canvas. */
export const toCanvas = (xPct: number, yPct: number) => ({
  x: (xPct - SMOKE_BOX.left) / SMOKE_BOX.w,
  y: (yPct - SMOKE_BOX.top) / SMOKE_BOX.h,
});

type Props = {
  tip: { x: number; y: number }; // % of portrait box
  mouth: { x: number; y: number }; // % of portrait box
  onFrame?: (f: SmokeFrame) => void;
  onUnavailable?: () => void;
};

/** Live WebGL smoke. Calls onUnavailable if WebGL / shaders fail so the CSS fallback can take over. */
export default function SmokeCanvas({ tip, mouth, onFrame, onUnavailable }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const mobile = useIsMobile();
  const reduced = useReducedMotion();

  // keep the latest callbacks without re-creating the GL context
  const frameCb = useRef(onFrame);
  const failCb = useRef(onUnavailable);
  useEffect(() => {
    frameCb.current = onFrame;
    failCb.current = onUnavailable;
  });

  useEffect(() => {
    const c = ref.current;
    if (!c || reduced) return;
    const handle = createSmoke(c, {
      mobile,
      source: toCanvas(tip.x, tip.y),
      mouth: toCanvas(mouth.x, mouth.y),
      onFrame: (f) => frameCb.current?.(f),
      onLost: () => failCb.current?.(),
    });
    if (!handle) {
      failCb.current?.();
      return;
    }
    return () => handle.destroy();
  }, [mobile, reduced, tip.x, tip.y, mouth.x, mouth.y]);

  if (reduced) return null;
  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        left: `${SMOKE_BOX.left}%`,
        top: `${SMOKE_BOX.top}%`,
        width: `${SMOKE_BOX.w}%`,
        height: `${SMOKE_BOX.h}%`,
      }}
    />
  );
}
