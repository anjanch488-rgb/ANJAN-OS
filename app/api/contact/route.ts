import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Tiny in-memory rate limiter (per server instance). Use a shared store (Redis/KV) if you scale out.
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function limited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > MAX_PER_WINDOW;
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot: pretend success so bots don't learn anything.
  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const name = oneLine(String(body.name ?? ""));
  const email = oneLine(String(body.email ?? ""));
  const subject = oneLine(String(body.subject ?? ""));
  const message = String(body.message ?? "").trim();

  if (name.length < 2 || name.length > 80) return NextResponse.json({ ok: false, error: "Invalid name." }, { status: 422 });
  if (!emailRe.test(email) || email.length > 120) return NextResponse.json({ ok: false, error: "Invalid email address." }, { status: 422 });
  if (subject.length < 3 || subject.length > 120) return NextResponse.json({ ok: false, error: "Invalid subject." }, { status: 422 });
  if (message.length < 10 || message.length > 4000) return NextResponse.json({ ok: false, error: "Message must be 10–4000 characters." }, { status: 422 });

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!key || !to || !from) {
    // Be honest: nothing is sent when the service isn't configured.
    return NextResponse.json(
      {
        ok: false,
        code: "not_configured",
        error: "The contact service isn't configured on this deployment, so your message was NOT sent.",
      },
      { status: 503 },
    );
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) {
    return NextResponse.json({ ok: false, error: "Too many messages. Please try again later." }, { status: 429 });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `[ANJAN.OS] ${subject}`,
        text: `From: ${name} <${email}>\n\n${message}`,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error("Resend error", res.status, await res.text().catch(() => ""));
      return NextResponse.json({ ok: false, error: "The mail service rejected the message. Please try again later." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact send failed", err);
    return NextResponse.json({ ok: false, error: "Couldn't reach the mail service. Please try again later." }, { status: 502 });
  }
}
