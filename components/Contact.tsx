"use client";

import { useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Send } from "lucide-react";
import Page from "./Page";
import { Brand } from "./Icons";
import { site, socials } from "@/lib/site";

type Fields = { name: string; email: string; subject: string; message: string };
type Status = { kind: "idle" } | { kind: "loading" } | { kind: "success" } | { kind: "error"; message: string; notConfigured?: boolean };

const empty: Fields = { name: "", email: "", subject: "", message: "" };
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(f: Fields) {
  const e: Partial<Record<keyof Fields, string>> = {};
  if (f.name.trim().length < 2) e.name = "Please enter your name (2+ characters).";
  if (!emailRe.test(f.email.trim())) e.email = "Enter a valid email address.";
  if (f.subject.trim().length < 3) e.subject = "Add a short subject (3+ characters).";
  if (f.message.trim().length < 10) e.message = "Message should be at least 10 characters.";
  if (f.message.length > 4000) e.message = "Message is too long (max 4000).";
  return e;
}

export default function Contact() {
  const [f, setF] = useState<Fields>(empty);
  const [errors, setErrors] = useState<ReturnType<typeof validate>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [honey, setHoney] = useState("");
  const firstErr = useRef<HTMLFormElement>(null);

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setF((p) => ({ ...p, [k]: e.target.value }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status.kind === "loading") return;
    const v = validate(f);
    setErrors(v);
    if (Object.keys(v).length) {
      (firstErr.current?.querySelector("[aria-invalid='true']") as HTMLElement | null)?.focus();
      return;
    }
    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, website: honey }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; code?: string };
      if (res.ok && data.ok) {
        setStatus({ kind: "success" });
        setF(empty);
      } else {
        setStatus({
          kind: "error",
          message: data.error ?? `Something went wrong (HTTP ${res.status}).`,
          notConfigured: data.code === "not_configured",
        });
      }
    } catch {
      setStatus({ kind: "error", message: "Network error — your message was not sent. Check your connection and try again." });
    }
  };

  const field = (k: keyof Fields, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`c-${k}`} className="eyebrow mb-1 block">
        {label}
      </label>
      <input
        id={`c-${k}`}
        value={f[k]}
        onChange={set(k)}
        aria-invalid={!!errors[k]}
        aria-describedby={errors[k] ? `e-${k}` : undefined}
        className="min-h-12 w-full border border-[var(--line)] bg-black/40 px-3 text-base text-[var(--fg)] outline-none transition focus:border-[var(--neon)] focus:shadow-[0_0_14px_rgba(255,37,58,.4)] aria-[invalid=true]:border-[var(--neon)]"
        {...props}
      />
      {errors[k] && (
        <p id={`e-${k}`} role="alert" className="mt-1 font-mono text-xs text-[var(--neon)]">
          {errors[k]}
        </p>
      )}
    </div>
  );

  return (
    <Page code="06 / CONTACT" title="Establish Link">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="hud-wrap">
          <div className="hud">
            <form ref={firstErr} onSubmit={submit} noValidate className="hud-in space-y-4 p-5 sm:p-6" aria-label="Contact form">
              <div className="grid gap-4 sm:grid-cols-2">
                {field("name", "Name", { autoComplete: "name", maxLength: 80 })}
                {field("email", "Email", { type: "email", autoComplete: "email", maxLength: 120 })}
              </div>
              {field("subject", "Subject", { maxLength: 120 })}
              <div>
                <label htmlFor="c-message" className="eyebrow mb-1 block">
                  Message
                </label>
                <textarea
                  id="c-message"
                  rows={6}
                  value={f.message}
                  onChange={set("message")}
                  maxLength={4000}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "e-message" : undefined}
                  className="w-full border border-[var(--line)] bg-black/40 px-3 py-3 text-base text-[var(--fg)] outline-none transition focus:border-[var(--neon)] focus:shadow-[0_0_14px_rgba(255,37,58,.4)] aria-[invalid=true]:border-[var(--neon)]"
                />
                {errors.message && (
                  <p id="e-message" role="alert" className="mt-1 font-mono text-xs text-[var(--neon)]">
                    {errors.message}
                  </p>
                )}
              </div>
              {/* honeypot — hidden from people, bots fill it */}
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>
                  Website
                  <input tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} />
                </label>
              </div>

              <button type="submit" disabled={status.kind === "loading"} className="btn-hud btn-solid w-full sm:w-auto">
                {status.kind === "loading" ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Transmitting…
                  </>
                ) : (
                  <>
                    <Send size={18} /> Send message
                  </>
                )}
              </button>

              <div aria-live="polite" role="status">
                {status.kind === "success" && (
                  <p className="flex items-start gap-2 border border-[var(--line)] bg-[rgba(229,9,32,.1)] p-3 text-sm">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-[var(--neon)]" size={18} /> Message delivered to the mail service. Thanks — you&rsquo;ll get a reply by email.
                  </p>
                )}
                {status.kind === "error" && (
                  <p className="flex items-start gap-2 border border-[var(--neon)] bg-[rgba(229,9,32,.12)] p-3 text-sm">
                    <AlertTriangle className="mt-0.5 shrink-0 text-[var(--neon)]" size={18} />
                    <span>
                      {status.message}
                      {status.notConfigured && site.email && (
                        <>
                          {" "}
                          You can email directly: <a className="underline" href={`mailto:${site.email}`}>{site.email}</a>
                        </>
                      )}
                    </span>
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="glass p-5">
            <p className="eyebrow mb-2">Direct</p>
            {site.email ? (
              <a href={`mailto:${site.email}`} className="break-all text-lg underline decoration-[var(--red)] underline-offset-4 hover:text-[var(--neon)]">
                {site.email}
              </a>
            ) : (
              <p className="font-mono text-sm text-[var(--muted)]">[EDIT] Set NEXT_PUBLIC_CONTACT_EMAIL in .env.local</p>
            )}
            <p className="mt-2 text-sm text-[var(--muted)]">{site.location}</p>
          </div>
          <div className="glass p-5">
            <p className="eyebrow mb-3">Channels</p>
            <ul className="space-y-2">
              {socials.map((s) => {
                const I = Brand[s.key];
                return (
                  <li key={s.key}>
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-3 hover:text-[var(--neon)]">
                        <I className="h-5 w-5 text-[var(--red)]" /> {s.label}
                      </a>
                    ) : (
                      <span className="flex min-h-11 items-center gap-3 text-[var(--muted)]">
                        <I className="h-5 w-5" /> {s.label} <span className="chip chip-todo">not set</span>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </Page>
  );
}
