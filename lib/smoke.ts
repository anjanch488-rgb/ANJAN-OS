/**
 * Real-time 3D cigarette smoke — no dependencies (raw WebGL).
 *
 *  - A true 3D particle simulation (x, y, z) runs live every frame: buoyancy, drag,
 *    height-dependent turbulence (laminar near the tip, chaotic higher up), pointer wind.
 *  - A virtual perspective camera orbits slightly with the pointer + idle sway, so the
 *    smoke really parallaxes in depth. Puffs are depth-sorted back-to-front.
 *  - Each puff is a soft volumetric sprite: domain-warped fbm density in the fragment
 *    shader, with a fake normal/rim light (red backlight) and a warm ember tint near the tip.
 *  - A "breath" cycle: ember brightens (drag) -> short hold -> exhale plume from the mouth.
 *    Ember glow + flying sparks are drawn additively on top.
 *
 * Coordinates: world units are canvas-heights. x: 0..aspect, y: 0..1 (up), z: toward camera.
 */

export type SmokeFrame = { ember: number; yaw: number; pitch: number };

export type SmokeOptions = {
  mobile: boolean;
  /** Cigarette tip as a fraction of the canvas box (y measured from the top). */
  source: { x: number; y: number };
  /** Mouth / exhale origin as a fraction of the canvas box (y from the top). */
  mouth: { x: number; y: number };
  onFrame?: (f: SmokeFrame) => void;
  onLost?: () => void;
};

export type SmokeHandle = { destroy: () => void };

const VERT = `
attribute vec2 a_pos;
attribute vec2 a_uv;
attribute vec3 a_p;
varying vec2 v_uv;
varying vec3 v_p;
void main() {
  v_uv = a_uv;
  v_p = a_p;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const smokeFrag = (octaves: number) => `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 v_uv;
varying vec3 v_p; // x: age 0..1, y: seed, z: alpha
uniform float u_time;
uniform vec2 u_light;
uniform float u_ember;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < ${octaves}; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(17.1, 9.2);
    a *= 0.5;
  }
  return v;
}
float shape(vec2 uv, vec2 q, vec2 w, float age) {
  float n = fbm(q + 1.7 * w);
  float r = length(uv);
  float body = 1.0 - smoothstep(0.12, 1.0, r + (n - 0.5) * (0.55 + 0.75 * age));
  body *= 1.0 - smoothstep(0.72, 1.0, r);
  return clamp(body * (0.22 + 1.15 * n), 0.0, 1.0);
}
void main() {
  float age = v_p.x;
  vec2 uv = v_uv;
  vec2 q = uv * 1.5 + vec2(v_p.y * 17.3, v_p.y * 5.1);
  vec2 w = vec2(fbm(q + vec2(u_time * 0.07, 0.0)), fbm(q + vec2(5.2, 1.3 - u_time * 0.06)));
  float d0 = shape(uv, q, w, age);
  float d1 = shape(uv + u_light * 0.22, q + u_light * 0.33, w, age);
  float rim = clamp((d0 - d1) * 3.2, 0.0, 1.0);

  vec3 base = mix(vec3(0.50, 0.50, 0.56), vec3(0.93, 0.93, 0.97), clamp(d0 * 1.2, 0.0, 1.0));
  vec3 col = base * (0.55 + 0.45 * d0);
  col += vec3(1.0, 0.10, 0.16) * rim * 0.9;
  col += vec3(1.0, 0.55, 0.28) * pow(1.0 - age, 4.0) * (0.35 + 0.35 * d0) * u_ember;
  col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;

  float alpha = clamp(d0, 0.0, 1.0) * v_p.z;
  gl_FragColor = vec4(col * alpha, alpha);
}`;

const GLOW_FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 v_uv;
varying vec3 v_p; // z: intensity
void main() {
  float r2 = dot(v_uv, v_uv);
  if (r2 > 1.0) discard;
  float g = exp(-r2 * 4.5);
  vec3 c = mix(vec3(1.0, 0.28, 0.06), vec3(1.0, 0.86, 0.6), g * g);
  gl_FragColor = vec4(c * g * v_p.z, 0.0);
}`;

const rnd = Math.random;
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

export function createSmoke(canvas: HTMLCanvasElement, o: SmokeOptions): SmokeHandle | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
  }) as WebGLRenderingContext | null;
  if (!gl) return null;

  /* ---------- GL setup ---------- */
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn("[smoke] shader error:", gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  };
  const program = (fs: string) => {
    const v = compile(gl.VERTEX_SHADER, VERT);
    const f = compile(gl.FRAGMENT_SHADER, fs);
    const p = gl.createProgram();
    if (!v || !f || !p) return null;
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.bindAttribLocation(p, 0, "a_pos");
    gl.bindAttribLocation(p, 1, "a_uv");
    gl.bindAttribLocation(p, 2, "a_p");
    gl.linkProgram(p);
    gl.deleteShader(v);
    gl.deleteShader(f);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.warn("[smoke] link error:", gl.getProgramInfoLog(p));
      gl.deleteProgram(p);
      return null;
    }
    return p;
  };

  const pSmoke = program(smokeFrag(o.mobile ? 3 : 4));
  const pGlow = program(GLOW_FRAG);
  const vboSmoke = gl.createBuffer();
  const vboGlow = gl.createBuffer();
  if (!pSmoke || !pGlow || !vboSmoke || !vboGlow) {
    if (pSmoke) gl.deleteProgram(pSmoke);
    if (pGlow) gl.deleteProgram(pGlow);
    if (vboSmoke) gl.deleteBuffer(vboSmoke);
    if (vboGlow) gl.deleteBuffer(vboGlow);
    return null;
  }
  const uTime = gl.getUniformLocation(pSmoke, "u_time");
  const uLight = gl.getUniformLocation(pSmoke, "u_light");
  const uEmber = gl.getUniformLocation(pSmoke, "u_ember");

  /* ---------- Simulation state ---------- */
  const MAX = o.mobile ? 70 : 150;
  const MAXSP = 28;
  const STRIDE = 7; // ndc(2) uv(2) p(3)
  const f32 = (n: number) => new Float32Array(n);

  const alive = new Uint8Array(MAX);
  const px = f32(MAX), py = f32(MAX), pz = f32(MAX);
  const vx = f32(MAX), vy = f32(MAX), vz = f32(MAX);
  const age = f32(MAX), life = f32(MAX), s0 = f32(MAX), s1 = f32(MAX), seed = f32(MAX), a0 = f32(MAX);
  // projected (per frame)
  const qx = f32(MAX), qy = f32(MAX), qh = f32(MAX), qa = f32(MAX), qz = f32(MAX);

  // sparks
  const spAlive = new Uint8Array(MAXSP);
  const spx = f32(MAXSP), spy = f32(MAXSP), spvx = f32(MAXSP), spvy = f32(MAXSP), spAge = f32(MAXSP), spLife = f32(MAXSP), spSize = f32(MAXSP);

  const smokeBuf = f32(MAX * 6 * STRIDE);
  const glowBuf = f32((MAXSP + 1) * 6 * STRIDE);
  const order: number[] = [];

  let A = 1; // aspect
  const S = { x: 0, y: 0 }; // cigarette tip (world)
  const M = { x: 0, y: 0 }; // mouth (world)
  let time = 0;
  let yaw = 0;
  let pitch = 0;
  let ember = 0.4;
  const ptr = { x: 0, y: 0 };
  const wind = { x: 0, y: 0 };

  // breath cycle: 0 idle, 1 drag, 2 hold, 3 exhale
  let phase = 0;
  let phaseT = 0;
  let idleFor = 3.2;
  let freeze = false;
  let warmed = false;
  let creditA = 0;
  let creditE = 0;
  let creditS = 0;
  let cursor = 0;
  let spCursor = 0;

  const slot = () => {
    for (let k = 0; k < MAX; k++) {
      const i = (cursor + k) % MAX;
      if (!alive[i]) {
        cursor = (i + 1) % MAX;
        return i;
      }
    }
    return -1;
  };

  const emit = (exhale: boolean) => {
    const i = slot();
    if (i < 0) return;
    alive[i] = 1;
    age[i] = 0;
    seed[i] = rnd() * 10;
    if (!exhale) {
      px[i] = S.x + (rnd() - 0.5) * 0.006;
      py[i] = S.y + rnd() * 0.004;
      pz[i] = (rnd() - 0.5) * 0.012;
      vx[i] = (rnd() - 0.35) * 0.012;
      vy[i] = 0.045 + rnd() * 0.03;
      vz[i] = (rnd() - 0.5) * 0.01;
      life[i] = 5.5 + rnd() * 2.5;
      s0[i] = 0.011 + rnd() * 0.008;
      s1[i] = 0.07 + rnd() * 0.05;
      a0[i] = 0.32 + rnd() * 0.16;
    } else {
      px[i] = M.x + (rnd() - 0.5) * 0.01;
      py[i] = M.y + (rnd() - 0.5) * 0.01;
      pz[i] = (rnd() - 0.5) * 0.03;
      vx[i] = 0.09 + rnd() * 0.08;
      vy[i] = 0.004 + rnd() * 0.03;
      vz[i] = (rnd() - 0.5) * 0.06;
      life[i] = 6 + rnd() * 3;
      s0[i] = 0.028 + rnd() * 0.02;
      s1[i] = 0.13 + rnd() * 0.07;
      a0[i] = 0.26 + rnd() * 0.14;
    }
  };

  const emitSpark = () => {
    for (let k = 0; k < MAXSP; k++) {
      const i = (spCursor + k) % MAXSP;
      if (spAlive[i]) continue;
      spCursor = (i + 1) % MAXSP;
      spAlive[i] = 1;
      spx[i] = S.x + (rnd() - 0.5) * 0.004;
      spy[i] = S.y;
      spvx[i] = (rnd() - 0.3) * 0.07;
      spvy[i] = 0.03 + rnd() * 0.08;
      spAge[i] = 0;
      spLife[i] = 0.5 + rnd() * 0.7;
      spSize[i] = 0.0035 + rnd() * 0.004;
      return;
    }
  };

  const step = (dt: number) => {
    time += dt;

    // camera follows pointer + gentle idle sway (smoothed)
    const kc = 1 - Math.exp(-3 * dt);
    yaw += (ptr.x * 0.3 + Math.sin(time * 0.22) * 0.1 - yaw) * kc;
    pitch += (-ptr.y * 0.16 + Math.sin(time * 0.17 + 1) * 0.04 - pitch) * kc;
    const wd = Math.exp(-2.2 * dt);
    wind.x *= wd;
    wind.y *= wd;

    // breath cycle
    if (!freeze) {
      phaseT += dt;
      if (phase === 0 && phaseT > idleFor) { phase = 1; phaseT = 0; }
      else if (phase === 1 && phaseT > 1.3) { phase = 2; phaseT = 0; }
      else if (phase === 2 && phaseT > 0.5) { phase = 3; phaseT = 0; }
      else if (phase === 3 && phaseT > 1.9) { phase = 0; phaseT = 0; idleFor = 7 + rnd() * 6; }
    }
    const target = phase === 0 ? 0.4 + 0.07 * Math.sin(time * 2.3) : phase === 3 ? 0.55 : 1;
    ember += (target - ember) * (1 - Math.exp(-(phase === 1 ? 4 : 2.5) * dt));

    // emission
    const baseRate = o.mobile ? 10 : 17;
    creditA += baseRate * [1, 0.35, 0.2, 0.5][phase] * dt;
    while (creditA >= 1) { creditA -= 1; emit(false); }
    if (phase === 3) {
      creditE += (o.mobile ? 15 : 26) * Math.sin((Math.PI * phaseT) / 1.9) * dt;
      while (creditE >= 1) { creditE -= 1; emit(true); }
    }
    creditS += (phase === 1 ? 14 : phase === 0 ? 0.5 : 1) * dt;
    while (creditS >= 1) { creditS -= 1; emitSpark(); }

    // particles
    const kv = 1 - Math.exp(-0.8 * dt);
    const dragX = Math.exp(-0.35 * dt);
    for (let i = 0; i < MAX; i++) {
      if (!alive[i]) continue;
      age[i] += dt;
      const t = age[i] / life[i];
      if (t >= 1) { alive[i] = 0; continue; }

      const ph = seed[i] * 0.6;
      const amp = 0.012 + 0.07 * Math.pow(t, 1.2);
      const x = px[i], y = py[i], z = pz[i];
      const fx = Math.sin(y * 9 + time * 0.7 + z * 5 + ph) + 0.6 * Math.sin(y * 17 - time * 1.1 + x * 6);
      const fz = Math.cos(y * 8 - time * 0.6 + x * 4 + ph);
      const fy = Math.sin(x * 11 + time * 0.9 + ph);

      vx[i] = (vx[i] + (amp * fx + wind.x * 0.5 * (0.3 + t)) * dt) * dragX;
      vz[i] = (vz[i] + amp * 0.7 * fz * dt) * dragX;
      vy[i] += (0.07 - vy[i]) * kv + (amp * 0.3 * fy + wind.y * 0.3) * dt;

      px[i] += vx[i] * dt;
      py[i] += vy[i] * dt;
      pz[i] += vz[i] * dt;
    }

    // sparks
    for (let i = 0; i < MAXSP; i++) {
      if (!spAlive[i]) continue;
      spAge[i] += dt;
      if (spAge[i] >= spLife[i]) { spAlive[i] = 0; continue; }
      spvy[i] -= 0.22 * dt;
      spvx[i] += wind.x * 0.2 * dt;
      spx[i] += spvx[i] * dt;
      spy[i] += spvy[i] * dt;
    }
  };

  /* ---------- Rendering ---------- */
  const put = (b: Float32Array, o0: number, x: number, y: number, u: number, v: number, a: number, s: number, al: number) => {
    b[o0] = x; b[o0 + 1] = y; b[o0 + 2] = u; b[o0 + 3] = v; b[o0 + 4] = a; b[o0 + 5] = s; b[o0 + 6] = al;
  };
  const CORNERS = [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1];
  const quad = (b: Float32Array, n: number, cx: number, cy: number, hh: number, a: number, s: number, al: number) => {
    const hx = (hh / A) * 2;
    const hy = hh * 2;
    let o0 = n * 6 * STRIDE;
    for (let k = 0; k < 6; k++) {
      const u = CORNERS[k * 2];
      const v = CORNERS[k * 2 + 1];
      put(b, o0, cx + u * hx, cy + v * hy, u, v, a, s, al);
      o0 += STRIDE;
    }
  };

  const bindAttribs = () => {
    const bytes = STRIDE * 4;
    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, bytes, 0);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, bytes, 8);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, bytes, 16);
  };

  const draw = () => {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);

    // --- project particles through the 3D camera (pivot = cigarette tip)
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    order.length = 0;
    for (let i = 0; i < MAX; i++) {
      if (!alive[i]) continue;
      const t = age[i] / life[i];
      const dx = px[i] - S.x, dy = py[i] - S.y, dz = pz[i];
      const x1 = dx * cy + dz * sy;
      const z1 = -dx * sy + dz * cy;
      const y2 = dy * cp - z1 * sp;
      const z2 = dy * sp + z1 * cp;
      const w = Math.max(0.45, 1 - z2 * 0.8);
      const k = 1 / w;
      const X = S.x + x1 * k;
      const Y = S.y + y2 * k;
      const grow = 1 - (1 - t) * (1 - t);
      const size = (s0[i] + (s1[i] - s0[i]) * grow) * k;
      const fade = smooth(0, 0.08, t) * (1 - smooth(0.45, 1, t));
      const edge = smooth(0, 0.06, X) * smooth(0, 0.06, A - X) * smooth(0, 0.05, Y) * smooth(0, 0.12, 1 - Y);
      const depth = clamp(1 + z2 * 1.2, 0.55, 1.15); // far puffs a bit dimmer
      qx[i] = (X / A) * 2 - 1;
      qy[i] = Y * 2 - 1;
      qh[i] = size;
      qa[i] = a0[i] * fade * edge * depth;
      qz[i] = z2;
      order.push(i);
    }
    order.sort((a, b) => qz[a] - qz[b]); // far -> near

    let n = 0;
    for (const i of order) {
      quad(smokeBuf, n++, qx[i], qy[i], qh[i], age[i] / life[i], seed[i], qa[i]);
    }

    gl.useProgram(pSmoke);
    gl.uniform1f(uTime, time);
    gl.uniform2f(uLight, -0.8, 0.35);
    gl.uniform1f(uEmber, ember);
    gl.bindBuffer(gl.ARRAY_BUFFER, vboSmoke);
    gl.bufferData(gl.ARRAY_BUFFER, smokeBuf.subarray(0, n * 6 * STRIDE), gl.DYNAMIC_DRAW);
    bindAttribs();
    gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    if (n) gl.drawArrays(gl.TRIANGLES, 0, n * 6);

    // --- ember + sparks (additive)
    let g = 0;
    const tipX = (S.x / A) * 2 - 1;
    const tipY = S.y * 2 - 1;
    const flick = 0.9 + 0.1 * Math.sin(time * 31) * Math.sin(time * 7.3);
    quad(glowBuf, g++, tipX, tipY, 0.016 + 0.026 * ember, 0, 0, (0.3 + 0.9 * ember) * flick);
    for (let i = 0; i < MAXSP; i++) {
      if (!spAlive[i]) continue;
      const t = spAge[i] / spLife[i];
      quad(glowBuf, g++, (spx[i] / A) * 2 - 1, spy[i] * 2 - 1, spSize[i], 0, 0, (1 - t) * (1 - t) * 1.2);
    }
    gl.useProgram(pGlow);
    gl.bindBuffer(gl.ARRAY_BUFFER, vboGlow);
    gl.bufferData(gl.ARRAY_BUFFER, glowBuf.subarray(0, g * 6 * STRIDE), gl.DYNAMIC_DRAW);
    bindAttribs();
    gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ZERO, gl.ONE);
    gl.drawArrays(gl.TRIANGLES, 0, g * 6);
  };

  /* ---------- Sizing ---------- */
  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, o.mobile ? 1 : 1.25);
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    A = w / h;
    S.x = o.source.x * A;
    S.y = 1 - o.source.y;
    M.x = o.mouth.x * A;
    M.y = 1 - o.mouth.y;
    if (!warmed) {
      // Pre-warm: the plume is already fully formed when the page first paints (no empty start).
      warmed = true;
      freeze = true;
      for (let i = 0; i < 200; i++) step(1 / 30);
      freeze = false;
    }
  };

  resize();

  /* ---------- Loop / lifecycle ---------- */
  let raf = 0;
  let running = false;
  let visible = true;
  let last = 0;
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const dt = clamp((now - last) / 1000, 0, 0.05);
    last = now;
    step(dt);
    draw();
    o.onFrame?.({ ember, yaw, pitch });
  };
  const start = () => {
    if (running || !visible || document.hidden) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  const onVis = () => (document.hidden ? stop() : start());
  const io = new IntersectionObserver((e) => {
    visible = e[e.length - 1].isIntersecting;
    if (visible) start();
    else stop();
  });
  io.observe(canvas);
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  document.addEventListener("visibilitychange", onVis);

  let lx = 0, ly = 0, have = false;
  const onMove = (e: PointerEvent) => {
    const w = window.innerWidth, h = window.innerHeight;
    ptr.x = (e.clientX / w) * 2 - 1;
    ptr.y = (e.clientY / h) * 2 - 1;
    if (have) {
      wind.x = clamp(wind.x + ((e.clientX - lx) / w) * 22, -1.4, 1.4);
      wind.y = clamp(wind.y - ((e.clientY - ly) / h) * 12, -0.8, 0.8);
    }
    lx = e.clientX; ly = e.clientY; have = true;
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  const onLost = (e: Event) => {
    e.preventDefault();
    stop();
    o.onLost?.();
  };
  canvas.addEventListener("webglcontextlost", onLost);

  start();

  return {
    destroy() {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.deleteBuffer(vboSmoke);
      gl.deleteBuffer(vboGlow);
      gl.deleteProgram(pSmoke);
      gl.deleteProgram(pGlow);
    },
  };
}
