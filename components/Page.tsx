"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import Atmosphere from "./Atmosphere";
import { useNav } from "@/lib/nav";

/** Full-screen scrolling "window" used by About / Projects / Skills / Contact. */
export default function Page({ code, title, children, wide = false }: { code: string; title: string; children: React.ReactNode; wide?: boolean }) {
  const { go } = useNav();
  return (
    <motion.main
      className="fixed inset-0 z-30 overflow-hidden bg-[var(--bg)]"
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.01 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      aria-label={title}
    >
      <Atmosphere dim />
      <div className="scroll-area absolute inset-0 pt-20">
        <div className={`mx-auto px-4 pb-24 sm:px-8 ${wide ? "max-w-[1400px]" : "max-w-6xl"}`}>
          <div className="mb-8 flex items-end justify-between gap-4 border-b border-[var(--line)] pb-4">
            <div>
              <p className="eyebrow">/ {code}</p>
              <h1 className="section-title">{title}</h1>
            </div>
            <button onClick={() => go("home")} className="btn-hud" aria-label="Close and return home">
              <X size={18} /> <span className="hidden sm:inline">Close</span>
            </button>
          </div>
          {children}
        </div>
      </div>
    </motion.main>
  );
}
