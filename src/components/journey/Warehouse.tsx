import { GROUND_Y, MONO, TRUCK } from "./config";

const G = GROUND_Y;
const { ink: INK, paper: W } = MONO;

export const WAREHOUSE = {
  wall: 34,
  roofTop: G - 372,
  roofBottom: G - 348,
  doorTop: G - 270,
} as const;

type Props = {
  variant: "origin" | "destination";
  /** Borda esquerda da parede esquerda (mundo). */
  wallL: number;
  /** Borda esquerda da parede direita (mundo). */
  wallR: number;
  /** Traseira do caminhão estacionado nesta cena (mundo). */
  truckX: number;
};

/**
 * Galpão em corte (cutaway): parede de fundo, estrutura, porta seccional
 * que sobe e, no destino, a doca de descarga com sinalização e luz.
 * Renderizado em duas camadas: `WarehouseBack` (atrás do caminhão) e
 * `WarehouseFront` (paredes e porta, à frente).
 */
export function WarehouseBack({ variant, wallL, wallR, truckX }: Props) {
  const inL = wallL + WAREHOUSE.wall;
  const inR = wallR;
  const front = truckX + TRUCK.length;
  const columns: number[] = [];
  for (let c = inL + 150; c < inR - 40; c += 170) columns.push(c);

  return (
    <g>
      {/* parede de fundo */}
      <rect x={inL} y={WAREHOUSE.roofBottom} width={inR - inL} height={G - WAREHOUSE.roofBottom} fill={MONO.wall} />
      {columns.map((c) => (
        <rect key={c} x={c} y={WAREHOUSE.roofBottom} width={10} height={G - WAREHOUSE.roofBottom} fill="#D8D8D8" />
      ))}
      {/* tesouras do telhado */}
      <path
        d={trussPath(inL, inR, WAREHOUSE.roofBottom, 26)}
        fill="none"
        stroke={MONO.g3}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* luminárias */}
      {columns.map((c) => (
        <g key={`lamp${c}`}>
          <line x1={c + 85} y1={WAREHOUSE.roofBottom + 26} x2={c + 85} y2={WAREHOUSE.roofBottom + 50} stroke={MONO.g4} strokeWidth={1.5} />
          <path d={`M${c + 72} ${WAREHOUSE.roofBottom + 58} L${c + 77} ${WAREHOUSE.roofBottom + 50} H${c + 93} L${c + 98} ${WAREHOUSE.roofBottom + 58} Z`} fill={MONO.g4} />
        </g>
      ))}

      {variant === "origin" ? (
        <>
          <Rack x={inL + 14} w={180} levels={3} />
          <PalletStack x={front + 30} w={96} />
        </>
      ) : (
        <>
          <Rack x={inL + 14} w={180} levels={3} />
          <Rack x={inL + 214} w={360} levels={3} />
          {/* doca de descarga */}
          <g>
            <rect x={front + 36} y={G - 64} width={inR - front - 36} height={64} fill={INK} stroke={W} strokeWidth={2} />
            <line x1={front + 44} y1={G - 50} x2={inR - 8} y2={G - 50} stroke={W} strokeWidth={1} opacity={0.35} />
            {/* para-choques da doca */}
            <rect x={front + 28} y={G - 58} width={10} height={18} rx={2} fill={INK} stroke={W} strokeWidth={1.5} />
            <rect x={front + 28} y={G - 30} width={10} height={18} rx={2} fill={INK} stroke={W} strokeWidth={1.5} />
            <PalletStack x={front + 70} w={100} base={G - 64} />
          </g>
          {/* placa DOCA 01 */}
          <g>
            <line x1={front - 40} y1={WAREHOUSE.roofBottom} x2={front - 40} y2={WAREHOUSE.roofBottom + 22} stroke={MONO.g4} strokeWidth={1.5} />
            <line x1={front + 40} y1={WAREHOUSE.roofBottom} x2={front + 40} y2={WAREHOUSE.roofBottom + 22} stroke={MONO.g4} strokeWidth={1.5} />
            <rect x={front - 62} y={WAREHOUSE.roofBottom + 22} width={124} height={34} rx={4} fill={INK} stroke={W} strokeWidth={1.6} />
            <text x={front} y={WAREHOUSE.roofBottom + 45} textAnchor="middle" fontSize={15} fontWeight={800} letterSpacing={3} fill={W}>
              DOCA 01
            </text>
          </g>
          {/* luz da doca */}
          <g transform={`translate(${inR - 10} ${G - 214})`}>
            <rect x={-16} y={-6} width={16} height={12} fill={INK} />
            <circle data-j="dock-light" cx={-26} cy={0} r={11} fill={MONO.g4} stroke={W} strokeWidth={1.8} />
            <g data-j="dock-rays" opacity={0} stroke={INK} strokeWidth={2} strokeLinecap="round">
              <line x1={-44} y1={0} x2={-56} y2={0} />
              <line x1={-40} y1={-14} x2={-50} y2={-22} />
              <line x1={-40} y1={14} x2={-50} y2={22} />
            </g>
          </g>
          {/* marcações de vaga no piso */}
          <rect x={truckX - 16} y={G + 6} width={4} height={48} fill={W} opacity={0.55} />
          <rect x={front + 14} y={G + 6} width={4} height={48} fill={W} opacity={0.55} />
        </>
      )}
    </g>
  );
}

export function WarehouseFront({ variant, wallL, wallR }: Omit<Props, "truckX">) {
  const doorAtLeft = variant === "destination";
  const doorWall = doorAtLeft ? wallL : wallR;
  const solidWall = doorAtLeft ? wallR : wallL;
  const id = variant === "origin" ? "origin" : "dest";
  const W2 = WAREHOUSE.wall;
  const clipId = `door-clip-${id}`;
  const label = variant === "origin" ? "CENTRO DE DISTRIBUIÇÃO" : "CENTRO LOGÍSTICO";

  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <rect x={doorWall - 2} y={WAREHOUSE.doorTop} width={W2 + 4} height={G - WAREHOUSE.doorTop} />
        </clipPath>
      </defs>
      {/* telhado */}
      <rect
        x={wallL - 26}
        y={WAREHOUSE.roofTop}
        width={wallR + W2 + 26 - (wallL - 26)}
        height={WAREHOUSE.roofBottom - WAREHOUSE.roofTop}
        fill={INK}
        stroke={W}
        strokeWidth={2}
      />
      <text
        x={(wallL + wallR + W2) / 2}
        y={WAREHOUSE.roofTop + 16.5}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        letterSpacing={5}
        fill={W}
      >
        {label}
      </text>
      {/* parede sólida */}
      <rect x={solidWall} y={WAREHOUSE.roofBottom} width={W2} height={G - WAREHOUSE.roofBottom + 2} fill={INK} stroke={W} strokeWidth={2} />
      {/* parede com porta: verga + porta seccional */}
      <rect x={doorWall} y={WAREHOUSE.roofBottom} width={W2} height={WAREHOUSE.doorTop - WAREHOUSE.roofBottom} fill={INK} stroke={W} strokeWidth={2} />
      <circle data-j={`${id}-door-lamp`} cx={doorWall + W2 / 2} cy={WAREHOUSE.roofBottom + 30} r={6} fill={MONO.g4} stroke={W} strokeWidth={1.4} />
      <g clipPath={`url(#${clipId})`}>
        <g data-j={`${id}-door`}>
          <rect x={doorWall + 3} y={WAREHOUSE.doorTop} width={W2 - 6} height={G - WAREHOUSE.doorTop} fill={INK} stroke={W} strokeWidth={1.8} />
          {Array.from({ length: 11 }, (_, i) => (
            <line
              key={i}
              x1={doorWall + 6}
              x2={doorWall + W2 - 6}
              y1={WAREHOUSE.doorTop + 24 * (i + 1)}
              y2={WAREHOUSE.doorTop + 24 * (i + 1)}
              stroke={W}
              strokeWidth={1}
              opacity={0.55}
            />
          ))}
        </g>
      </g>
    </g>
  );
}

function trussPath(a: number, b: number, y: number, h: number) {
  const step = 44;
  let d = `M${a} ${y + h}`;
  let up = true;
  for (let x = a + step / 2; x <= b; x += step / 2) {
    d += ` L${x} ${up ? y : y + h}`;
    up = !up;
  }
  d += ` M${a} ${y + h} H${b}`;
  return d;
}

function Rack({ x, w, levels }: { x: number; w: number; levels: number }) {
  const h = 92;
  const bays = Math.max(1, Math.round(w / 90));
  const bw = w / bays;
  return (
    <g>
      {Array.from({ length: levels }, (_, l) =>
        Array.from({ length: bays }, (_, b) => (
          <g key={`${l}-${b}`}>
            <rect x={x + b * bw + 10} y={G - (l + 1) * h + 18} width={bw - 20} height={h - 30} fill={MONO.g2} />
            <line x1={x + b * bw + 10 + (bw - 20) / 2} y1={G - (l + 1) * h + 18} x2={x + b * bw + 10 + (bw - 20) / 2} y2={G - l * h - 12} stroke={MONO.wall} strokeWidth={2} />
            <rect x={x + b * bw + 8} y={G - l * h - 12} width={bw - 16} height={5} fill={MONO.g3} />
          </g>
        )),
      )}
      {Array.from({ length: levels }, (_, l) => (
        <rect key={`beam${l}`} x={x} y={G - (l + 1) * h - 2 + h - 6} width={w} height={6} fill={MONO.g3} />
      ))}
      {Array.from({ length: bays + 1 }, (_, b) => (
        <rect key={`up${b}`} x={x + b * bw - 3} y={G - levels * h - 8} width={6} height={levels * h + 8} fill={MONO.g3} />
      ))}
    </g>
  );
}

function PalletStack({ x, w, base = G }: { x: number; w: number; base?: number }) {
  return (
    <g>
      <rect x={x} y={base - 10} width={w} height={10} fill={MONO.g4} />
      <rect x={x + 4} y={base - 58} width={w / 2 - 6} height={48} fill={MONO.g2} stroke={MONO.g4} strokeWidth={1.4} />
      <rect x={x + w / 2 + 2} y={base - 58} width={w / 2 - 6} height={48} fill={MONO.g2} stroke={MONO.g4} strokeWidth={1.4} />
      <rect x={x + w / 4} y={base - 104} width={w / 2} height={46} fill={MONO.g2} stroke={MONO.g4} strokeWidth={1.4} />
    </g>
  );
}
