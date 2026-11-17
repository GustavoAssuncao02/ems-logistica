import type { ReactNode } from "react";
import { C, GROUND, RIG, ROAD } from "./constants";

/**
 * Acontecimentos sorteados na estrada. Cada um tem até quatro camadas (atrás
 * da carreta, pintura no asfalto, à frente da carreta e por cima do capim do
 * primeiro plano), deslocadas juntas pelo motor. Coordenadas locais: x = 0 é
 * a âncora de cada acontecimento.
 *
 * Com parada (a carreta freia até o ponto exato):
 *  toll  — pedágio; âncora no poste da cancela.
 *  fuel  — posto; âncora alinhada ao bocal do tanque da carreta parada.
 *  light — semáforo; âncora na faixa de retenção.
 *  scale — balança; âncora no fim da plataforma de pesagem.
 * Sem parada (a carreta passa direto):
 *  tunnel — túnel atravessando um morro.
 *  bridge — ponte sobre um rio.
 */
export type StopKind = "toll" | "fuel" | "light" | "scale" | "tunnel" | "bridge";
export type StopLayer = "back" | "road" | "front" | "over";

type StopConfig = {
  /** A carreta para neste acontecimento? */
  stop: boolean;
  /** Posição do para-choque parado, relativa à âncora. */
  front: number;
  /** Tempo parado (s). */
  go: number;
  /** Extensão do desenho em relação à âncora (para entrar/sair de cena). */
  left: number;
  right: number;
};

export const STOPS: Record<StopKind, StopConfig> = {
  toll: { stop: true, front: -24, go: 2.0, left: -300, right: 320 },
  fuel: { stop: true, front: RIG.length - RIG.tankCap.x, go: 4.1, left: -360, right: 480 },
  light: { stop: true, front: -18, go: 3.0, left: -540, right: 460 },
  scale: { stop: true, front: -12, go: 2.6, left: -660, right: 270 },
  tunnel: { stop: false, front: 0, go: 0, left: 0, right: 1000 },
  bridge: { stop: false, front: 0, go: 0, left: -60, right: 1160 },
};

export const STOP_KINDS = Object.keys(STOPS) as StopKind[];
export const STOPPING = STOP_KINDS.filter((k) => STOPS[k].stop);
export const PASSING = STOP_KINDS.filter((k) => !STOPS[k].stop);

export function Stop({ kind, layer }: { kind: StopKind; layer: StopLayer }) {
  const props = { "data-r": `stop-${kind}-${layer}`, display: "none" } as const;
  return <g {...props}>{PARTS[kind][layer]}</g>;
}

// ── Pedágio ───────────────────────────────────────────────────────────────

const TOLL_BACK = (
  <>
    <rect x={-262} y={88} width={12} height={126} fill="#CDD3DB" />
    <rect x={238} y={88} width={12} height={126} fill="#CDD3DB" />
    <rect x={-290} y={64} width={580} height={16} rx={2} fill="#F3F4F6" />
    <rect x={-290} y={80} width={580} height={10} fill={C.orange} />
    {[-220, -120, -20, 80, 180].map((x) => (
      <rect key={x} x={x} y={90} width={30} height={3} rx={1.5} fill={C.warm} opacity={0.9} />
    ))}
    {/* cabine */}
    <rect x={30} y={146} width={86} height={68} rx={3} fill="#E9ECF0" />
    <rect x={40} y={156} width={66} height={26} rx={2} fill={C.glass} />
    <rect x={44} y={160} width={22} height={3} rx={1.5} fill="#FFFFFF" opacity={0.25} />
    <rect x={26} y={140} width={94} height={8} rx={2} fill={C.orange} />
    <rect x={60} y={116} width={24} height={20} rx={4} fill="#1F242C" />
    <circle data-r="toll-light" cx={72} cy={126} r={5.5} fill="#EF4444" />
  </>
);

const TOLL_FRONT = (
  <>
    <g data-r="toll-arm">
      <rect x={5} y={196} width={176} height={9} rx={4.5} fill="#FFFFFF" />
      {[22, 58, 94, 130, 166].map((x) => (
        <rect key={x} x={x} y={196} width={16} height={9} fill="#E11D48" />
      ))}
    </g>
    <rect x={-4} y={188} width={18} height={GROUND - 188} rx={3} fill="#E9ECF0" stroke="#B9C0C9" strokeWidth={1} />
    <circle cx={5} cy={200} r={4} fill="#B9C0C9" />
  </>
);

// ── Posto de combustível ─────────────────────────────────────────────────

const FUEL_BACK = (
  <>
    <rect x={-306} y={88} width={14} height={126} fill="#DFE3E8" />
    <rect x={166} y={88} width={14} height={126} fill="#DFE3E8" />
    <rect x={-340} y={60} width={560} height={16} rx={2} fill="#F7F8FA" />
    <rect x={-340} y={76} width={560} height={12} fill={C.teal} />
    {[-280, -170, -60, 50, 150].map((x) => (
      <rect key={x} x={x} y={88} width={34} height={3} rx={1.5} fill={C.warm} opacity={0.9} />
    ))}
    {/* loja de conveniência */}
    <rect x={262} y={136} width={200} height={78} fill="#EFE6D6" />
    <rect x={254} y={126} width={216} height={12} rx={2} fill={C.teal} />
    <rect x={280} y={154} width={100} height={36} rx={2} fill={C.warm} opacity={0.85} />
    <line x1={313} y1={154} x2={313} y2={190} stroke="#EFE6D6" strokeWidth={3} />
    <line x1={346} y1={154} x2={346} y2={190} stroke="#EFE6D6" strokeWidth={3} />
    <rect x={404} y={160} width={34} height={54} rx={2} fill={C.glass} />
  </>
);

const FUEL_FRONT = (
  <>
    <rect x={-80} y={GROUND + 16} width={104} height={9} rx={2} fill={C.curb} />
    {/* bomba */}
    <rect x={-66} y={204} width={42} height={GROUND + 16 - 204} rx={5} fill="#F5F6F8" stroke="#C3C9D1" strokeWidth={1} />
    <rect x={-66} y={204} width={42} height={16} rx={5} fill={C.teal} />
    <rect x={-60} y={228} width={30} height={18} rx={2} fill="#0E2433" />
    <rect x={-57} y={239} width={24} height={4} rx={1} fill="#1F3A2E" />
    <rect data-r="fuel-bar" x={-57} y={239} width={0} height={4} rx={1} fill="#4ADE80" />
    <rect x={-57} y={232} width={10} height={3} rx={1} fill="#4ADE80" opacity={0.7} />
    {/* bico no suporte (some quando a mangueira está em uso) */}
    <g data-r="fuel-holster">
      <path d="M-24 236 C-12 250 -14 268 -26 274" fill="none" stroke="#1D2026" strokeWidth={3.5} strokeLinecap="round" />
      <rect x={-26} y={232} width={8} height={14} rx={2} fill="#1D2026" />
    </g>
    {/* mangueira até o tanque da carreta */}
    <g data-r="fuel-hose" opacity={0}>
      <path
        d={`M-24 238 C-4 ${GROUND - 4} 6 ${GROUND - 14} 0 ${GROUND + RIG.tankCap.y + 6}`}
        fill="none"
        stroke="#1D2026"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <rect x={-6} y={GROUND + RIG.tankCap.y + 2} width={12} height={8} rx={2} fill="#1D2026" />
    </g>
  </>
);

// ── Semáforo ─────────────────────────────────────────────────────────────

const BUILDINGS = [
  { x: -520, w: 120, h: 92, c: "#454B70" },
  { x: -392, w: 90, h: 64, c: "#5A4A6E" },
  { x: -294, w: 130, h: 104, c: "#3E5470" },
  { x: 120, w: 110, h: 80, c: "#4F4468" },
  { x: 238, w: 150, h: 98, c: "#40496C" },
];

/** Calçada urbana: os prédios assentam nela, no nível da pista. */
const SIDEWALK = ROAD.top - 6;

const LIGHT_BACK = (
  <>
    <rect x={-560} y={SIDEWALK} width={1000} height={6} fill="#8B939E" />
    <rect x={-560} y={SIDEWALK - 1} width={1000} height={1.5} fill="#B5BCC6" />
    {BUILDINGS.map((b, i) => (
      <g key={b.x}>
        <rect x={b.x} y={SIDEWALK - b.h} width={b.w} height={b.h} fill={b.c} />
        <rect x={b.x - 4} y={SIDEWALK - b.h - 5} width={b.w + 8} height={5} fill="#2F3552" />
        {Array.from({ length: Math.floor((b.h - 16) / 18) }, (_, row) =>
          Array.from({ length: Math.floor((b.w - 12) / 20) }, (_, col) => (
            <rect
              key={`${row}-${col}`}
              x={b.x + 10 + col * 20}
              y={SIDEWALK - b.h + 10 + row * 18}
              width={10}
              height={8}
              fill={C.warm}
              opacity={(row * 7 + col * 3 + i) % 4 === 0 ? 0.15 : 0.75}
            />
          )),
        )}
      </g>
    ))}
    <rect x={54} y={62} width={8} height={152} fill="#2D333D" />
    <rect x={42} y={60} width={32} height={82} rx={7} fill="#1C2128" />
    <circle data-r="sig-red" cx={58} cy={78} r={8.5} fill="#EF4444" />
    <circle cx={58} cy={101} r={8.5} fill="#4A3D16" />
    <circle data-r="sig-green" cx={58} cy={124} r={8.5} fill="#123B22" />
  </>
);

const LIGHT_ROAD = (
  <>
    <rect x={-3} y={ROAD.center + 2} width={6} height={ROAD.bottom - ROAD.center - 8} fill={C.line} />
    {[16, 40, 64, 88, 112].map((x) => (
      <rect key={x} x={x} y={ROAD.top + 7} width={13} height={ROAD.bottom - ROAD.top - 14} fill={C.line} opacity={0.85} />
    ))}
  </>
);

// ── Balança ───────────────────────────────────────────────────────────────

const SCALE_BACK = (
  <>
    <rect x={40} y={148} width={130} height={66} fill="#D9DDE3" />
    <rect x={34} y={140} width={142} height={10} rx={2} fill="#5B6B85" />
    <rect x={52} y={160} width={74} height={24} rx={2} fill={C.glass} />
    <rect x={56} y={164} width={24} height={3} rx={1.5} fill="#FFFFFF" opacity={0.25} />
    <rect x={136} y={170} width={22} height={44} rx={2} fill="#5B6B85" />
    {/* painel de pesagem */}
    <rect x={214} y={124} width={6} height={90} fill={C.pole} />
    <rect x={184} y={90} width={66} height={38} rx={4} fill="#0E2433" stroke="#3A4150" strokeWidth={2} />
    <rect x={192} y={110} width={50} height={7} rx={2} fill="#1F3A2E" />
    <rect data-r="scale-bar" x={192} y={110} width={0} height={7} rx={2} fill="#4ADE80" />
    <circle data-r="scale-light" cx={236} cy={99} r={4.5} fill="#EF4444" />
    <rect x={192} y={96} width={30} height={5} rx={1} fill="#4ADE80" opacity={0.6} />
  </>
);

const SCALE_ROAD = (
  <>
    <rect x={-646} y={ROAD.center + 4} width={652} height={ROAD.bottom - ROAD.center - 10} fill="#4A4F58" />
    <rect x={-646} y={ROAD.center + 4} width={652} height={2} fill="#8A929C" />
    <rect x={-646} y={ROAD.bottom - 8} width={652} height={2} fill="#8A929C" />
    {[-566, -486, -406, -326, -246, -166, -86].map((x) => (
      <rect key={x} x={x} y={ROAD.center + 6} width={2} height={ROAD.bottom - ROAD.center - 14} fill="#646B75" />
    ))}
  </>
);

// ── Túnel ────────────────────────────────────────────────────────────────

const TUNNEL_FRONT = (
  <>
    <defs>
      <linearGradient id="hr-hill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4A7D4F" />
        <stop offset="1" stopColor="#2C5234" />
      </linearGradient>
    </defs>
    <path d="M0 300 V112 Q0 100 12 100 H40 Q170 40 500 34 Q830 40 960 100 H988 Q1000 100 1000 112 V300 Z" fill="url(#hr-hill)" />
    {[140, 230, 330, 460, 580, 700, 800].map((x, i) => (
      <g key={x}>
        <rect x={x - 3} y={58 - (i % 3) * 6} width={6} height={20} fill={C.trunk} />
        <circle cx={x} cy={52 - (i % 3) * 6} r={16 + (i % 2) * 5} fill={C.trees[i % C.trees.length]} />
      </g>
    ))}
    <path d="M120 210 Q160 196 200 212 Z M640 150 Q690 132 740 152 Z" fill="#5E6B60" opacity={0.6} />
    {/* bocas do túnel (concreto) */}
    {[0, 958].map((x) => (
      <g key={x}>
        <rect x={x} y={98} width={42} height={178} fill="#A7ADB6" />
        <rect x={x} y={98} width={42} height={8} fill="#C4C9D0" />
        <rect x={x + 6} y={116} width={30} height={4} fill="#8A929C" />
        <circle cx={x + 21} cy={134} r={4} fill={C.warm} />
      </g>
    ))}
  </>
);

// ── Ponte ────────────────────────────────────────────────────────────────

const WATER = "#3B6EA5";

const BRIDGE_BACK = (
  <>
    <rect x={-60} y={190} width={1220} height={26} fill={WATER} />
    {[60, 300, 520, 760, 980].map((x) => (
      <path key={x} d={`M${x} 200 q12 -4 24 0 t24 0`} fill="none" stroke="#6FA3D6" strokeWidth={2} opacity={0.7} />
    ))}
    <rect x={-60} y={206} width={1220} height={3} fill="#C9CED6" />
    {Array.from({ length: 31 }, (_, i) => (
      <rect key={i} x={-50 + i * 40} y={206} width={3} height={10} fill="#C9CED6" />
    ))}
  </>
);

const BRIDGE_OVER = (
  <>
    <rect x={-60} y={ROAD.bottom} width={1220} height={300 - ROAD.bottom} fill={WATER} />
    {[90, 340, 610, 880].map((x) => (
      <path key={x} d={`M${x} 296 q14 -4 28 0 t28 0`} fill="none" stroke="#6FA3D6" strokeWidth={2} opacity={0.8} />
    ))}
    <rect x={-60} y={ROAD.bottom - 2} width={1220} height={13} fill="#8A929C" />
    {[250, 540, 830].map((x) => (
      <rect key={x} x={x} y={ROAD.bottom + 11} width={24} height={14} fill="#7A828D" />
    ))}
    {/* guarda-corpo do lado de cá */}
    <rect x={-60} y={GROUND - 30} width={1220} height={4} rx={2} fill="#D9DDE3" />
    <rect x={-60} y={GROUND - 14} width={1220} height={3} rx={1.5} fill="#D9DDE3" opacity={0.8} />
    {Array.from({ length: 35 }, (_, i) => (
      <rect key={i} x={-56 + i * 35} y={GROUND - 30} width={4} height={ROAD.bottom - GROUND + 28} fill="#D9DDE3" />
    ))}
    {[-60, 1120].map((x) => (
      <rect key={x} x={x} y={ROAD.bottom - 6} width={40} height={30} fill="#8A929C" />
    ))}
  </>
);

const PARTS: Record<StopKind, Record<StopLayer, ReactNode>> = {
  toll: { back: TOLL_BACK, road: null, front: TOLL_FRONT, over: null },
  fuel: { back: FUEL_BACK, road: null, front: FUEL_FRONT, over: null },
  light: { back: LIGHT_BACK, road: LIGHT_ROAD, front: null, over: null },
  scale: { back: SCALE_BACK, road: SCALE_ROAD, front: null, over: null },
  tunnel: { back: null, road: null, front: TUNNEL_FRONT, over: null },
  bridge: { back: BRIDGE_BACK, road: null, front: null, over: BRIDGE_OVER },
};
