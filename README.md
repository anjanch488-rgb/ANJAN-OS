# ANJAN.OS — Chinthala Anjan

An immersive red-and-black cyberpunk "operating system" portfolio built with Next.js (App Router), React, TypeScript, Tailwind CSS v4 and Framer Motion.

## Install & run

```bash
npm install
cp .env.example .env.local   # then fill in what you need
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
```

Requires Node 20+.

**Open from another device (phone / other PC):** `npm run dev` now listens on all interfaces. Use `http://<your-PC-LAN-IP>:3000` (find it with `ipconfig` / `ifconfig`), keep both devices on the same Wi-Fi, and allow Node through the firewall if prompted. If your IP is in an unusual range or you use a hostname, add `ALLOWED_DEV_ORIGINS=your.ip.or.host` to `.env.local` and restart. Note: the smoke uses WebGL, which works over plain http on a LAN IP.

## Using it

- **Home split screen**: drag / swipe, `←` `→` arrow keys, or click a panel. Swipe/← = Creative, swipe/→ = Tech, `Esc` returns. On phones the two sides are a swipeable card + full-screen sheets.
- **Terminal**: click the top-right icon or press `` ` ``. Commands: `help about projects skills tech creative education contact clear` (plus a few hidden ones).
- Other shortcuts: `Alt+P` projects, `Shift+T` theme, `Shift+?` help toast.
- Routes are hash-based (`#/about`, `#/projects/meshguard`, `#/creative`, `#/tech`) so the back button works.

## Configuration

| What | Where |
|---|---|
| Social links, contact email | `.env.local` → `NEXT_PUBLIC_*_URL`, `NEXT_PUBLIC_CONTACT_EMAIL` (empty = shown as "not set") |
| Contact form delivery | `.env.local` → `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` (server-side only, via [Resend](https://resend.com)). Without them the form reports honestly that nothing was sent. |
| Projects, skills, about, timeline | `lib/data.ts` — everything tagged `[EDIT]` is a placeholder |
| Showreel video | put file in `public/media/`, set `site.showreel.src` in `lib/site.ts` |
| Project screenshots / GitHub / demo links | `screenshots`, `github`, `demo`, `status` fields in `lib/data.ts` |
| Portrait | `public/portrait.png` (transparent cutout) |

Nothing in the content invents metrics, awards, employment, certifications or demo URLs.

## Structure

```
app/            layout, page, global CSS, /api/contact route
components/     Home (split screen), Portrait, Atmosphere (ring/debris/particles),
                TechLab, CreativeStudio, About, Projects, Skills, Contact, Terminal, Boot
lib/            site.ts (config), data.ts (content), nav.tsx (state + hash routing), hooks.ts
public/         portrait.png, media/
```

## Deploy

Works on Vercel (import the repo, add the env vars) or any Node host (`npm run build && npm start`). The contact API route needs a server runtime (not a static export).

## Notes

- Reduced-motion preference disables the boot sequence, particles and smoke.
- **Live 3D smoke** (`lib/smoke.ts`, `components/SmokeCanvas.tsx`): a real-time 3D particle simulation rendered with raw WebGL (no extra dependency). Smoke rises from the cigarette continuously, parallaxes in depth with the pointer, is blown by fast mouse movement, and has a breath cycle (ember brightens -> exhale plume from the mouth, with sparks). Tune feel in `lib/smoke.ts` (emission rates, buoyancy `0.07`, turbulence `amp`) and the tip/mouth positions in `components/Portrait.tsx` (`TIP`, `MOUTH`).
- Extra effects: portrait 3D tilt, ember light on the face, breathing red aura, scan sweep, god-rays, drifting fog, sonar pulse rings and a pointer-following red light (see `Atmosphere.tsx` / `globals.css`).
- Falls back to the old CSS wisps if WebGL is unavailable; reduced-motion disables smoke and the animated layers. Rendering pauses when the tab is hidden or the portrait is off-screen.
- Other 3D layers (parallax, debris, ring) remain lightweight CSS/SVG.

## Background music
Put the track at `public/music/hes-a-pirate.mp3`. It loops, fades in, and starts automatically: browsers only allow sound after the visitor interacts, so if autoplay is blocked it starts on the first click / tap / key press (the boot-screen click counts). A speaker button in the header mutes it and remembers the choice. If the file is missing the button is simply hidden. To change the song, edit `SRC` in `components/MusicButton.tsx`.
