/**
 * Utilitários geométricos das cenas guiadas pela rolagem.
 * Tudo é determinístico (mesmo resultado no servidor e no navegador).
 */

export type Pt = { x: number; y: number };

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Número com 1 casa decimal, para caminhos SVG compactos. */
export const n1 = (v: number) => String(Math.round(v * 10) / 10);

export const pathOf = (pts: Pt[], close = false) =>
  `M${pts.map((p) => `${n1(p.x)} ${n1(p.y)}`).join("L")}${close ? "Z" : ""}`;

/* ------------------------------------------------------------------ */
/* Curva amostrada (Catmull-Rom) com comprimento de arco                */
/* ------------------------------------------------------------------ */

export type Curve = { xs: number[]; ys: number[]; acc: number[]; length: number };

export function catmullRom(points: Pt[], perSeg = 40): Curve {
  const xs: number[] = [];
  const ys: number[] = [];
  const n = points.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(n - 1, i + 2)];
    for (let j = 0; j < perSeg; j++) {
      const t = j / perSeg;
      const t2 = t * t;
      const t3 = t2 * t;
      xs.push(0.5 * (2 * p1.x + (p2.x - p0.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (3 * p1.x - p0.x - 3 * p2.x + p3.x) * t3));
      ys.push(0.5 * (2 * p1.y + (p2.y - p0.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (3 * p1.y - p0.y - 3 * p2.y + p3.y) * t3));
    }
  }
  xs.push(points[n - 1].x);
  ys.push(points[n - 1].y);
  const acc = [0];
  for (let i = 1; i < xs.length; i++) acc.push(acc[i - 1] + Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]));
  return { xs, ys, acc, length: acc[acc.length - 1] };
}

export function pointAt(c: Curve, s: number): Pt {
  const d = clamp(s, 0, c.length);
  let lo = 0;
  let hi = c.acc.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (c.acc[mid] <= d) lo = mid;
    else hi = mid;
  }
  const seg = c.acc[hi] - c.acc[lo] || 1;
  const t = (d - c.acc[lo]) / seg;
  return { x: lerp(c.xs[lo], c.xs[hi], t), y: lerp(c.ys[lo], c.ys[hi], t) };
}

/** Ponto, tangente, normal (à direita do sentido de marcha) e ângulo em graus. */
export function frameAt(c: Curve, s: number) {
  const p = pointAt(c, s);
  const a = pointAt(c, s - 5);
  const b = pointAt(c, s + 5);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const tx = dx / len;
  const ty = dy / len;
  return { x: p.x, y: p.y, tx, ty, nx: -ty, ny: tx, angle: (Math.atan2(ty, tx) * 180) / Math.PI };
}

/** Comprimento de arco no primeiro ponto em que a curva alcança `x`. */
export function sAtX(c: Curve, x: number) {
  for (let i = 1; i < c.xs.length; i++) {
    if (c.xs[i] >= x) {
      const t = (x - c.xs[i - 1]) / (c.xs[i] - c.xs[i - 1] || 1);
      return lerp(c.acc[i - 1], c.acc[i], t);
    }
  }
  return c.length;
}

/** Faixa ao longo da curva entre dois deslocamentos laterais (que podem variar com s). */
export function ribbon(c: Curve, a: (s: number) => number, b: (s: number) => number, s0 = 0, s1 = c.length, step = 12) {
  const left: Pt[] = [];
  const right: Pt[] = [];
  const n = Math.max(1, Math.ceil((s1 - s0) / step));
  for (let i = 0; i <= n; i++) {
    const s = s0 + ((s1 - s0) * i) / n;
    const f = frameAt(c, s);
    const oa = a(s);
    const ob = b(s);
    left.push({ x: f.x + f.nx * oa, y: f.y + f.ny * oa });
    right.push({ x: f.x + f.nx * ob, y: f.y + f.ny * ob });
  }
  return pathOf([...left, ...right.reverse()], true);
}

/** Linha central da curva (para traços com espessura constante). */
export function curvePath(c: Curve, step = 10) {
  const pts: Pt[] = [];
  const n = Math.max(1, Math.ceil(c.length / step));
  for (let i = 0; i <= n; i++) pts.push(pointAt(c, (c.length * i) / n));
  return pathOf(pts);
}

/** Gerador pseudoaleatório com semente (resultado idêntico no servidor e no cliente). */
export function seeded(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
