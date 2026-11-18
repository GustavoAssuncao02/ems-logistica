import { catmullRom, clamp, curvePath, frameAt, lerp, pathOf, pointAt, ribbon, sAtX, seeded, type Pt } from "./geometry";

/**
 * Geometria da cena "Visão de operação" (coordenadas da arte: 1800 × 874).
 * Calculada uma vez, no módulo: o servidor e o navegador geram os mesmos caminhos.
 */

export const ART_W = 1800;
export const ART_H = 874;

/* ------------------------------------------------------------------ */
/* Estrada: sai do canto inferior esquerdo e sobe até a borda direita   */
/* ------------------------------------------------------------------ */

const ROAD_POINTS: Pt[] = [
  { x: 80, y: 1030 },
  { x: 330, y: 862 },
  { x: 560, y: 748 },
  { x: 800, y: 672 },
  { x: 1050, y: 638 },
  { x: 1290, y: 620 },
  { x: 1480, y: 578 },
  { x: 1640, y: 494 },
  { x: 1752, y: 380 },
  { x: 1835, y: 220 },
  { x: 1880, y: 120 },
];

export const road = catmullRom(ROAD_POINTS, 40);

/** Largura da pista: mais larga perto de quem olha, estreita ao longe (perspectiva). */
export const roadWidth = (s: number) => 92 + 188 * Math.pow(1 - clamp(s / road.length), 1.5);
const half = (s: number) => roadWidth(s) / 2;
const edge = (s: number) => Math.max(2.4, roadWidth(s) * 0.024);

function dashes() {
  const parts: string[] = [];
  let s = 30;
  while (s < road.length) {
    const w = roadWidth(s);
    const len = w * 0.3;
    const t = Math.max(2.2, w * 0.042);
    const end = Math.min(road.length, s + len);
    parts.push(ribbon(road, () => -t / 2, () => t / 2, s, end, len / 3));
    s = end + w * 0.36;
  }
  return parts.join("");
}

export const ROAD = {
  body: ribbon(road, (s) => -half(s), half),
  shoulder: ribbon(road, (s) => -half(s) - 18, (s) => half(s) + 18),
  glowL: ribbon(road, (s) => -half(s) - 10, (s) => -half(s) + 6),
  glowR: ribbon(road, (s) => half(s) - 6, (s) => half(s) + 10),
  edgeL: ribbon(road, (s) => -half(s), (s) => -half(s) + edge(s)),
  edgeR: ribbon(road, (s) => half(s) - edge(s), half),
  /** Faixa levemente mais clara na metade de cima: dá volume ao asfalto. */
  sheen: ribbon(road, (s) => -half(s) + edge(s) * 2, (s) => -half(s) * 0.25),
  dashes: dashes(),
};

/* ------------------------------------------------------------------ */
/* Caminhão: posição ao longo da estrada para um progresso 0..1          */
/* ------------------------------------------------------------------ */

const S_START = sAtX(road, 700);
const S_END = sAtX(road, 1600);
/** Largura de pista em que o caminhão é desenhado em escala 1. */
const TRUCK_REF_WIDTH = 160;
/** Comprimento da carreta (unidades da arte) em escala 1. */
export const TRUCK_LEN_UNITS = 300;
/** Maior escala do percurso (no começo, perto de quem olha). */
export const MAX_TRUCK_SCALE = roadWidth(S_START) / TRUCK_REF_WIDTH;

export function truckPose(p: number) {
  const s = lerp(S_START, S_END, clamp(p));
  const f = frameAt(road, s);
  const w = roadWidth(s);
  // faixa da direita (sentido de marcha), como nas rodovias brasileiras
  const off = w * 0.23;
  return { x: f.x + f.nx * off, y: f.y + f.ny * off, angle: f.angle, scale: w / TRUCK_REF_WIDTH };
}

export const truckTransform = (p: number) => {
  const t = truckPose(p);
  return `translate(${t.x.toFixed(1)} ${t.y.toFixed(1)}) rotate(${t.angle.toFixed(2)}) scale(${t.scale.toFixed(3)})`;
};

/* ------------------------------------------------------------------ */
/* Rota no mapa (origem → destino) e marcador que acompanha o caminhão  */
/* ------------------------------------------------------------------ */

const ROUTE_POINTS: Pt[] = [
  { x: 985, y: 170 },
  { x: 1032, y: 207 },
  { x: 1088, y: 236 },
  { x: 1160, y: 243 },
  { x: 1232, y: 240 },
  { x: 1294, y: 266 },
  { x: 1344, y: 312 },
  { x: 1402, y: 339 },
  { x: 1472, y: 347 },
  { x: 1540, y: 348 },
  { x: 1592, y: 348 },
];

export const route = catmullRom(ROUTE_POINTS, 24);
export const ROUTE_PATH = curvePath(route, 8);
export const PIN_A = ROUTE_POINTS[0];
export const PIN_B = ROUTE_POINTS[ROUTE_POINTS.length - 1];

export const trackerTransform = (p: number) => {
  const q = pointAt(route, clamp(p) * route.length);
  return `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)})`;
};

/* ------------------------------------------------------------------ */
/* Mapa: malha de ruas, avenidas e rio (desvanece para a esquerda/baixo) */
/* ------------------------------------------------------------------ */

function streets() {
  const rnd = seeded(20261118);
  const minor: string[] = [];
  const major: string[] = [];

  /** Divide a rua em trechos e pula alguns, para a malha parecer orgânica. */
  const push = (out: string[], pts: Pt[], gap: number) => {
    let i = 0;
    while (i < pts.length - 1) {
      const k = 2 + Math.floor(rnd() * 4);
      const chunk = pts.slice(i, Math.min(pts.length, i + k + 1));
      if (rnd() > gap && chunk.length > 1) out.push(pathOf(chunk));
      i += k;
    }
  };

  // ruas "verticais", levemente inclinadas
  for (let x = 736, i = 0; x < 1880; i++) {
    const pts: Pt[] = [];
    for (let y = -20; y <= 640; y += 44) pts.push({ x: x - 0.16 * (y - 300) + Math.sin(y * 0.011 + i) * 6, y });
    if (i % 3 === 1) push(major, pts, 0.04);
    else push(minor, pts, 0.22);
    x += 66 + rnd() * 56;
  }
  // ruas "horizontais"
  for (let y = 4, j = 0; y < 660; j++) {
    const pts: Pt[] = [];
    for (let x = 680; x <= 1840; x += 44) pts.push({ x, y: y + 0.08 * (x - 1200) + Math.sin(x * 0.009 + j * 1.7) * 5 });
    if (j % 3 === 2) push(major, pts, 0.04);
    else push(minor, pts, 0.22);
    y += 50 + rnd() * 42;
  }
  return { minor: minor.join(""), major: major.join("") };
}

const AVENUES: Pt[][] = [
  [
    { x: 700, y: 480 },
    { x: 880, y: 410 },
    { x: 1070, y: 388 },
    { x: 1250, y: 336 },
    { x: 1420, y: 252 },
    { x: 1610, y: 200 },
    { x: 1840, y: 164 },
  ],
  [
    { x: 1182, y: -30 },
    { x: 1150, y: 120 },
    { x: 1192, y: 262 },
    { x: 1258, y: 420 },
    { x: 1300, y: 600 },
  ],
  [
    { x: 1560, y: -30 },
    { x: 1622, y: 140 },
    { x: 1706, y: 262 },
    { x: 1840, y: 330 },
  ],
];

const RIVER: Pt[] = [
  { x: 1712, y: -40 },
  { x: 1596, y: 84 },
  { x: 1506, y: 178 },
  { x: 1474, y: 292 },
  { x: 1436, y: 404 },
  { x: 1362, y: 504 },
  { x: 1296, y: 600 },
];

export const MAP = {
  ...streets(),
  avenues: AVENUES.map((pts) => curvePath(catmullRom(pts, 20), 10)),
  river: curvePath(catmullRom(RIVER, 24), 10),
};
