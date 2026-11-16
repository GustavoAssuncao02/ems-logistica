import { GROUND_Y, MONO } from "./config";

/**
 * Camadas de fundo em parallax. Cada camada é um "ladrilho" repetido duas
 * vezes; o renderizador desloca a camada em módulo da largura do ladrilho,
 * criando um cenário infinito com velocidades diferentes por profundidade.
 */

export const TILE = { clouds: 2200, far: 2400, mid: 1800 } as const;

const G = GROUND_Y;

export function CloudLayer() {
  return (
    <g data-j="layer-clouds">
      {[0, TILE.clouds].map((ox) => (
        <g key={ox} transform={`translate(${ox} 0)`} fill={MONO.bg} stroke={MONO.g3} strokeWidth={2}>
          <Cloud x={180} y={118} s={1} />
          <Cloud x={980} y={78} s={0.75} />
          <Cloud x={1640} y={140} s={0.9} />
        </g>
      ))}
    </g>
  );
}

function Cloud({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 30 H150 C162 30 168 22 166 14 C164 4 152 0 142 4 C140 -14 122 -24 104 -18 C96 -34 70 -38 56 -24 C46 -30 28 -26 26 -10 C12 -12 0 -2 2 10 C-6 14 -6 30 0 30 Z"
      strokeLinejoin="round"
    />
  );
}

export function FarLayer() {
  return (
    <g data-j="layer-far">
      {[0, TILE.far].map((ox) => (
        <g key={ox} transform={`translate(${ox} 0)`}>
          <path
            d={`M0 ${G} V440 C200 404 380 398 560 424 C720 446 880 402 1080 392 C1300 382 1420 428 1600 434 C1800 440 1960 398 2160 404 C2280 408 2340 428 2400 440 V${G} Z`}
            fill={MONO.g1}
          />
          <Turbine x={690} base={426} h={150} />
          <Turbine x={790} base={418} h={120} />
          <Turbine x={1980} base={406} h={140} />
        </g>
      ))}
    </g>
  );
}

function Turbine({ x, base, h }: { x: number; base: number; h: number }) {
  const top = base - h;
  const b = h * 0.42;
  return (
    <g stroke={MONO.g3} strokeLinecap="round">
      <line x1={x} y1={base} x2={x} y2={top} strokeWidth={3} />
      <g data-j="turbine" transform={`translate(${x} ${top})`}>
        <g data-j="turbine-rot">
          {[0, 120, 240].map((a) => (
            <path key={a} d={`M0 0 L3 ${-b * 0.25} L0 ${-b} L-2 ${-b * 0.3} Z`} fill={MONO.g3} strokeWidth={1} transform={`rotate(${a})`} />
          ))}
          <circle r={3.5} fill={MONO.g3} />
        </g>
      </g>
    </g>
  );
}

export function MidLayer() {
  return (
    <g data-j="layer-mid">
      {[0, TILE.mid].map((ox) => (
        <g key={ox} transform={`translate(${ox} 0)`}>
          {/* fiação entre postes */}
          <g fill="none" stroke={MONO.g3} strokeWidth={1.2}>
            {[150, 750, 1350].map((px) => (
              <g key={px}>
                <path d={`M${px} ${G - 168} Q${px + 300} ${G - 138} ${px + 600} ${G - 168}`} />
                <path d={`M${px} ${G - 156} Q${px + 300} ${G - 128} ${px + 600} ${G - 156}`} />
              </g>
            ))}
          </g>
          {[150, 750, 1350].map((px) => (
            <g key={px} stroke={MONO.g3} strokeLinecap="round">
              <line x1={px} y1={G} x2={px} y2={G - 176} strokeWidth={4} />
              <line x1={px - 16} y1={G - 168} x2={px + 16} y2={G - 168} strokeWidth={3} />
            </g>
          ))}
          <g fill={MONO.g2}>
            <TreeRound x={60} r={30} h={70} />
            <TreeRound x={110} r={40} h={86} />
            <TreeCone x={176} w={44} h={120} />
            <TreeRound x={236} r={26} h={60} />
            <TreeCone x={560} w={36} h={96} />
            <TreeCone x={600} w={44} h={124} />
            <TreeRound x={660} r={32} h={74} />
            <TreeRound x={1010} r={36} h={80} />
            <TreeRound x={1070} r={28} h={64} />
            <TreeCone x={1124} w={40} h={110} />
            <TreeRound x={1186} r={42} h={92} />
            <TreeCone x={1250} w={34} h={88} />
            <TreeRound x={1540} r={30} h={70} />
            <TreeCone x={1596} w={42} h={118} />
          </g>
        </g>
      ))}
    </g>
  );
}

function TreeRound({ x, r, h }: { x: number; r: number; h: number }) {
  return (
    <g>
      <rect x={x - 2.5} y={G - h} width={5} height={h} />
      <circle cx={x} cy={G - h - r * 0.55} r={r} />
    </g>
  );
}

function TreeCone({ x, w, h }: { x: number; w: number; h: number }) {
  return (
    <g>
      <rect x={x - 2.5} y={G - 20} width={5} height={20} />
      <path d={`M${x} ${G - h} L${x + w / 2} ${G - 14} H${x - w / 2} Z`} />
    </g>
  );
}
