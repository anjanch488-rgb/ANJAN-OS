"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Logo } from "./Icons";

const steps = ["INITIALIZING ANJAN.OS", "LOADING MODULES  ▸ TECH ▸ CREATIVE", "SECURE LINK ESTABLISHED", "WELCOME"];

export default function Boot({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (i >= steps.length) {
      onDone();
      return;
    }
    const t = window.setTimeout(() => setI((n) => n + 1), 380);
    return () => window.clearTimeout(t);
  }, [i, onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] grid cursor-pointer place-items-center bg-[#050505]"
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.6 }}
      onClick={onDone}
      role="status"
      aria-label="Loading ANJAN.OS. Click to skip."
    >
      <div className="w-[min(420px,86vw)]">
        <Logo className="mx-auto mb-6 h-16 w-16 drop-shadow-[0_0_14px_rgba(255,37,58,.8)]" />
        <div className="font-mono text-xs leading-7 text-[#c4c6ca]">
          {steps.slice(0, i + 1).map((s, k) => (
            <p key={s} className={k === steps.length - 1 ? "text-[#ff253a]" : ""}>
              <span className="text-[#e50920]">▸</span> {s}
              {k === i && i < steps.length && <span className="caret ml-1" />}
            </p>
          ))}
        </div>
        <div className="mt-4 h-0.5 w-full overflow-hidden bg-[#1a1a1a]">
          <motion.div className="h-full bg-[#ff253a] shadow-[0_0_10px_#ff253a]" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.6, ease: "easeInOut" }} />
        </div>
        <p className="mt-3 text-center font-mono text-[0.6rem] tracking-widest text-[#8b8d92]">CLICK TO SKIP · SOUND ON</p>
      </div>
    </motion.div>
  );
}
