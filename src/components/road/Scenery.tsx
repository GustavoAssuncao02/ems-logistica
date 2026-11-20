import type { ReactNode } from "react";
import { C, H, ROAD } from "./constants";

/**
 * Camadas do cenário. Cada uma é um "ladrilho" repetido lado a lado; o motor
 * desloca a camada em módulo da largura do ladrilho, com velocidade
 * proporcional a `f` (0 = parado, 1 = acompanha o asfalto).
 */
export const LAYERS = [
  { id: "far", f: 0.03, tile: 2400 },
  { id: "near", f: 0.07, tile: 2000 },
  { id: "hills", f: 0.1, tile: 1600 },
  { id: "grove", f: 0.27, tile: 1400 },
  { id: "trees", f: 0.62, tile: 2200 },
  { id: "side", f: 1, tile: 1800 },
  { id: "dash", f: 1, tile: 100 },
  { id: "fore", f: 1.18, tile: 1300 },
] as const;

export type LayerId = (typeof LAYERS)[number]["id"];

/** Gerador pseudoaleatório com semente (cenário igual no servidor e no cliente). */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (v: number) => Math.round(v * 10) / 10;

/** Silhueta periódica (começa e termina na mesma altura → emenda perfeita). */
function ridge(tile: number, y0: number, harmonics: [number, number, number][], bottom = 222) {
  let d = `M0 ${bottom}`;
  for (let x = 0; x <= tile; x += 16) {
    let y = y0;
    for (const [n, a, p] of harmonics) y -= a * (0.5 + 0.5 * Math.sin((2 * Math.PI * n * x) / tile + p));
    d += ` L${x} ${r1(y)}`;
  }
  return `${d} L${tile} ${bottom} Z`;
}

const copiesFor = (width: number, tile: number) => Math.ceil(width / tile) + 1;

function TileCopies({ id, tile, copies, children }: { id: LayerId; tile: number; copies: number; children: ReactNode }) {
  const tileId = `hr-tile-${id}`;
  return (
    <>
      <g id={tileId}>{children}</g>
      {Array.from({ length: copies - 1 }, (_, i) => (
        <use key={i} href={`#${tileId}`} x={(i + 1) * tile} />
      ))}
    </>
  );
}

function Tiled({ id, tile, width, children }: { id: LayerId; tile: number; width: number; children: ReactNode }) {
  return (
    <g data-r={`layer-${id}`}>
      <TileCopies id={id} tile={tile} copies={copiesFor(width, tile)}>{children}</TileCopies>
    </g>
  );
}

/**
 * Plano do cenário: um <svg> próprio, empilhado sob a pista. Os planos que
 * se movem (`moving`) são deslocados pelo motor com `transform` de CSS e
 * viram camadas da GPU — são rasterizados uma vez e só "deslizam", sem
 * redesenhar a cada quadro (essencial no celular).
 *
 * `units` = largura do plano em unidades da cena; `scale` = px por unidade.
 */
type PlaneProps = { id: string; units: number; scale: number; moving?: boolean; hidden?: boolean; children: ReactNode };

function Plane({ id, units, scale, moving = false, hidden = false, children }: PlaneProps) {
  return (
    <svg
      data-plane={id}
      viewBox={`0 0 ${units} ${H}`}
      preserveAspectRatio="xMinYMax meet"
      className="absolute bottom-0 left-0 block h-full max-w-none"
      style={{ width: units * scale, display: hidden ? "none" : undefined, willChange: moving ? "transform" : undefined }}
      focusable="false"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** Camada repetida lado a lado, num plano próprio movido pela GPU. */
function TiledPlane({ id, tile, width, scale, children }: { id: LayerId; tile: number; width: number; scale: number; children: ReactNode }) {
  const copies = copiesFor(width, tile);
  return (
    <Plane id={`layer-${id}`} units={copies * tile} scale={scale} moving>
      <TileCopies id={id} tile={tile} copies={copies}>{children}</TileCopies>
    </Plane>
  );
}

// ── Elementos ─────────────────────────────────────────────────────────────

function RoundTree({ x, base, h, color }: { x: number; base: number; h: number; color: string }) {
  const r = h * 0.3;
  return (
    <g>
      <rect x={r1(x - h * 0.035)} y={r1(base - h * 0.5)} width={r1(h * 0.07)} height={r1(h * 0.5)} fill={C.trunk} />
      <circle cx={r1(x - r * 0.62)} cy={r1(base - h * 0.5)} r={r1(r * 0.72)} fill={color} />
      <circle cx={r1(x + r * 0.62)} cy={r1(base - h * 0.52)} r={r1(r * 0.68)} fill={color} />
      <circle cx={r1(x)} cy={r1(base - h * 0.68)} r={r1(r)} fill={color} />
      <circle cx={r1(x - r * 0.35)} cy={r1(base - h * 0.76)} r={r1(r * 0.45)} fill="#FFFFFF" opacity={0.08} />
    </g>
  );
}

function PineTree({ x, base, h, color }: { x: number; base: number; h: number; color: string }) {
  const w = h * 0.42;
  return (
    <g>
      <rect x={r1(x - h * 0.03)} y={r1(base - h * 0.2)} width={r1(h * 0.06)} height={r1(h * 0.2)} fill={C.trunk} />
      <path d={`M${r1(x)} ${r1(base - h)} L${r1(x + w * 0.38)} ${r1(base - h * 0.55)} H${r1(x - w * 0.38)} Z`} fill={color} />
      <path d={`M${r1(x)} ${r1(base - h * 0.78)} L${r1(x + w * 0.5)} ${r1(base - h * 0.18)} H${r1(x - w * 0.5)} Z`} fill={color} />
    </g>
  );
}

function trees(seed: number, tile: number, count: number, base: number, hMin: number, hMax: number) {
  const rnd = rng(seed);
  const out: ReactNode[] = [];
  let x = 40;
  for (let i = 0; i < count && x < tile - 40; i++) {
    const h = hMin + rnd() * (hMax - hMin);
    const color = C.trees[Math.floor(rnd() * C.trees.length)];
    const props = { x: r1(x), base: base + rnd() * 3, h, color };
    out.push(rnd() < 0.6 ? <RoundTree key={i} {...props} /> : <PineTree key={i} {...props} />);
    // agrupamentos: às vezes árvores juntas, às vezes clareiras
    x += rnd() < 0.55 ? 30 + rnd() * 40 : 140 + rnd() * 260;
  }
  return out;
}

const FAR = ridge(2400, 152, [
  [2, 36, 0.3],
  [3, 22, 1.4],
  [7, 10, 2.2],
  [13, 4, 0.7],
]);
const NEAR = ridge(2000, 184, [
  [3, 26, 2.1],
  [5, 14, 0.4],
  [11, 6, 1.7],
]);
const HILLS = ridge(1600, 204, [
  [2, 12, 0.9],
  [4, 8, 2.6],
  [9, 4, 0.2],
]);

/**
 * Fundo completo, do céu ao acostamento, em planos empilhados (ver `Plane`).
 * `width` = largura da cena (unidades); `scale` = px por unidade.
 */
export function Scenery({ width, scale }: { width: number; scale: number }) {
  return (
    <>
      {/* céu e sol (estáticos); as definições servem a todos os planos — este nunca é ocultado */}
      <Plane id="sky" units={width} scale={scale}>
        <defs>
          <linearGradient id="hr-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0B1A38" stopOpacity="0" />
            <stop offset="0.3" stopColor="#1A2350" stopOpacity="0.55" />
            <stop offset="0.55" stopColor="#3C3768" />
            <stop offset="0.78" stopColor="#8D5A72" />
            <stop offset="0.95" stopColor="#E48A5A" />
          </linearGradient>
          <radialGradient id="hr-sun">
            <stop offset="0" stopColor={C.sun} stopOpacity="0.9" />
            <stop offset="0.35" stopColor="#FFB070" stopOpacity="0.35" />
            <stop offset="1" stopColor="#FFB070" stopOpacity="0" />
          </radialGradient>
          <pattern id="hr-win-a" width={10} height={12} patternUnits="userSpaceOnUse">
            <rect x={3} y={3} width={3.5} height={4.5} fill={C.warm} opacity={0.75} />
          </pattern>
          <pattern id="hr-win-b" width={14} height={10} patternUnits="userSpaceOnUse">
            <rect x={4} y={2} width={6} height={3} fill={C.warm} opacity={0.6} />
          </pattern>
          <radialGradient id="hr-lamp">
            <stop offset="0" stopColor={C.warm} stopOpacity="0.8" />
            <stop offset="1" stopColor={C.warm} stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x={0} y={0} width={width} height={ROAD.top + 4} fill="url(#hr-sky)" />
        <circle cx={r1(width * 0.8)} cy={166} r={120} fill="url(#hr-sun)" />
        <circle cx={r1(width * 0.8)} cy={166} r={24} fill={C.sun} />
      </Plane>

      <TiledPlane id="far" tile={2400} width={width} scale={scale}>
        <path d={FAR} fill={C.mountFar} />
      </TiledPlane>
      <TiledPlane id="near" tile={2000} width={width} scale={scale}>
        <path d={NEAR} fill={C.mountNear} />
      </TiledPlane>
      <TiledPlane id="hills" tile={1600} width={width} scale={scale}>
        <path d={HILLS} fill={C.hills} />
      </TiledPlane>
      <Cities scale={scale} />
      <TiledPlane id="grove" tile={1400} width={width} scale={scale}>
        <Grove />
      </TiledPlane>

      <Plane id="verge" units={width} scale={scale}>
        <rect x={0} y={194} width={width} height={22} fill={C.verge} />
      </Plane>

      <TiledPlane id="trees" tile={2200} width={width} scale={scale}>
        {trees(7, 2200, 22, 210, 54, 104)}
      </TiledPlane>
      <TiledPlane id="side" tile={1800} width={width} scale={scale}>
        <Roadside />
      </TiledPlane>
    </>
  );
}

function Grove() {
  const rnd = rng(3);
  const out: ReactNode[] = [];
  for (let x = 10; x < 1390; x += 14 + rnd() * 30) {
    const h = 12 + rnd() * 16;
    const b = 202 + rnd() * 4;
    out.push(<path key={x} d={`M${r1(x)} ${r1(b - h)} L${r1(x + h * 0.32)} ${r1(b)} H${r1(x - h * 0.32)} Z`} fill={C.grove} />);
  }
  return <>{out}</>;
}

function Roadside() {
  const rnd = rng(11);
  const posts = [100, 400, 700, 1000, 1300, 1600];
  const lamps = [250, 1150];
  return (
    <>
      {Array.from({ length: 7 }, (_, i) => {
        const x = 60 + i * 250 + rnd() * 80;
        return <ellipse key={`b${i}`} cx={r1(x)} cy={212} rx={r1(16 + rnd() * 14)} ry={r1(7 + rnd() * 5)} fill={C.vergeDark} />;
      })}
      {lamps.map((x) => (
        <g key={`l${x}`}>
          <rect x={x - 2.5} y={96} width={5} height={118} fill={C.pole} />
          <path d={`M${x} 98 Q${x} 88 ${x + 12} 88 H${x + 26}`} fill="none" stroke={C.pole} strokeWidth={4} />
          <rect x={x + 20} y={85} width={16} height={6} rx={2} fill={C.pole} />
          <circle cx={x + 28} cy={92} r={22} fill="url(#hr-lamp)" />
          <rect x={x + 22} y={90} width={12} height={2.5} rx={1} fill={C.warm} />
        </g>
      ))}
      {posts.map((x) => (
        <g key={`p${x}`}>
          <rect x={x - 2} y={194} width={4} height={20} fill="#F1F3F5" />
          <rect x={x - 2} y={196} width={4} height={4} fill={C.orange} />
        </g>
      ))}
    </>
  );
}

/** Asfalto, faixas e acostamento — desenhados abaixo dos veículos. */
export function RoadSurface({ width }: { width: number }) {
  return (
    <>
      <rect x={0} y={ROAD.top} width={width} height={ROAD.bottom - ROAD.top} fill={C.asphalt} />
      <rect x={0} y={ROAD.top} width={width} height={3} fill={C.asphaltEdge} />
      <rect x={0} y={ROAD.top + 4} width={width} height={2} fill={C.line} opacity={0.85} />
      <rect x={0} y={ROAD.bottom - 6} width={width} height={2.5} fill={C.line} opacity={0.9} />
      <Tiled id="dash" tile={100} width={width}>
        <rect x={0} y={ROAD.center - 2} width={48} height={4} rx={1} fill={C.center} />
      </Tiled>
    </>
  );
}

/** Acostamento e capim em primeiro plano (passam à frente da carreta). */
export function Foreground({ width }: { width: number }) {
  const rnd = rng(19);
  const tufts: ReactNode[] = [];
  for (let x = 20; x < 1280; x += 40 + rnd() * 90) {
    const h = 6 + rnd() * 10;
    const y = 290 + rnd() * 8;
    tufts.push(
      <path
        key={x}
        d={`M${r1(x - 5)} ${r1(y)} L${r1(x - 2)} ${r1(y - h)} L${r1(x)} ${r1(y)} L${r1(x + 3)} ${r1(y - h * 0.8)} L${r1(x + 5)} ${r1(y)} Z`}
        fill={rnd() < 0.5 ? "#5C8F4A" : "#2F5A30"}
      />,
    );
    if (rnd() < 0.3) tufts.push(<circle key={`f${x}`} cx={r1(x + 8)} cy={r1(y - 3)} r={2} fill={rnd() < 0.5 ? "#F2C94C" : "#F7F7F7"} />);
  }
  return (
    <>
      <rect x={0} y={ROAD.bottom} width={width} height={H - ROAD.bottom} fill={C.nearVerge} />
      <rect x={0} y={ROAD.bottom} width={width} height={4} fill={C.curb} />
      <rect x={0} y={ROAD.bottom + 4} width={width} height={3} fill="#2D4F2D" opacity={0.6} />
      <Tiled id="fore" tile={1300} width={width}>
        {tufts}
      </Tiled>
    </>
  );
}

// ── Cidades ao fundo ─────────────────────────────────────────────────────

/** Larguras dos horizontes de cidade (unidades). O motor usa para o trajeto. */
export const CITY_WIDTHS = [980, 1180, 1060] as const;
const CITY_COLORS = ["#4D4A78", "#585384", "#45436E", "#5F5A8C"];
const CITY_BASE = 206;

/**
 * Horizonte de uma cidade grande: prédios de alturas variadas (mais altos
 * no centro), torres com antena, uma cúpula e janelas acesas. Cada variante
 * tem semente própria — as três cidades nunca são iguais.
 */
function Skyline({ seed, width }: { seed: number; width: number }) {
  const rnd = rng(seed);
  const out: ReactNode[] = [];
  let x = 0;
  let i = 0;
  while (x < width - 20) {
    const w = 26 + rnd() * 46;
    const env = Math.sin((Math.PI * (x + w / 2)) / width);
    const h = 26 + env * (40 + rnd() * 100);
    const top = CITY_BASE - h;
    const color = CITY_COLORS[Math.floor(rnd() * CITY_COLORS.length)];
    const kind = rnd();
    out.push(
      <g key={i}>
        <rect x={r1(x)} y={r1(top)} width={r1(w)} height={r1(h)} fill={color} />
        <rect x={r1(x)} y={r1(top)} width={r1(w)} height={r1(h)} fill={`url(#hr-win-${kind < 0.5 ? "a" : "b"})`} />
        {kind > 0.86 && h > 90 && (
          <line x1={r1(x + w / 2)} y1={r1(top)} x2={r1(x + w / 2)} y2={r1(top - 26)} stroke={color} strokeWidth={2.5} />
        )}
        {kind > 0.86 && h > 90 && <circle cx={r1(x + w / 2)} cy={r1(top - 26)} r={2} fill="#FF6B6B" />}
        {kind > 0.7 && kind <= 0.86 && <path d={`M${r1(x)} ${r1(top)} L${r1(x + w / 2)} ${r1(top - w * 0.45)} L${r1(x + w)} ${r1(top)} Z`} fill={color} />}
        {kind > 0.62 && kind <= 0.7 && <path d={`M${r1(x + 2)} ${r1(top)} A${r1(w / 2 - 2)} ${r1(w / 2 - 2)} 0 0 1 ${r1(x + w - 2)} ${r1(top)} Z`} fill={color} />}
      </g>,
    );
    x += w + (rnd() < 0.3 ? 0 : 2 + rnd() * 6);
    i++;
  }
  return <>{out}</>;
}

/**
 * Três cidades reutilizáveis, cada uma num plano próprio; o motor posiciona,
 * mostra e esconde cada uma (a folga de 80 unidades acomoda o último prédio,
 * que pode passar um pouco da largura nominal).
 */
function Cities({ scale }: { scale: number }) {
  return (
    <>
      {CITY_WIDTHS.map((w, i) => (
        <Plane key={i} id={`city-${i}`} units={w + 80} scale={scale} moving hidden>
          <Skyline seed={101 + i * 37} width={w} />
        </Plane>
      ))}
    </>
  );
}
