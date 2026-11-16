import { GROUND_Y, MONO, TRUCK } from "./config";
import { PUMP_OFFSET } from "./plan";

const G = GROUND_Y;
const { ink: INK, paper: W, g5: G5, g4: G4 } = MONO;

/** Pontos da bomba relativos ao seu eixo (mundo = pump + dx). */
export const PUMP = {
  outlet: { x: 22, y: G - 114 },
  holster: { x: 40, y: G - 64, angle: 90 },
  /** Bocal do tanque do caminhão estacionado, relativo à bomba. */
  cap: { x: TRUCK.tankCap.x - PUMP_OFFSET, y: G + TRUCK.tankCap.y },
  gaugeBars: 8,
} as const;

/** Cobertura, colunas, loja e totem — atrás do caminhão. */
export function FuelStationBack({ pump }: { pump: number }) {
  const P = pump;
  return (
    <g>
      {/* loja de conveniência */}
      <g>
        <rect x={P + 600} y={G - 170} width={270} height={170} fill={MONO.g2} />
        <rect x={P + 590} y={G - 184} width={290} height={16} fill={MONO.g3} />
        <rect x={P + 622} y={G - 136} width={150} height={76} fill={MONO.g1} />
        {[1, 2].map((i) => (
          <line key={i} x1={P + 622 + i * 50} y1={G - 136} x2={P + 622 + i * 50} y2={G - 60} stroke={MONO.g2} strokeWidth={3} />
        ))}
        <rect x={P + 792} y={G - 116} width={56} height={116} fill={MONO.g1} />
      </g>
      {/* totem (somente pictograma, sem marca) */}
      <g>
        <rect x={P + 945} y={G - 250} width={10} height={250} fill={INK} stroke={W} strokeWidth={1.4} />
        <rect x={P + 905} y={G - 340} width={90} height={100} rx={6} fill={INK} stroke={W} strokeWidth={2} />
        <g transform={`translate(${P + 950} ${G - 290})`} fill={W}>
          <rect x={-16} y={-26} width={24} height={46} rx={3} />
          <rect x={-11} y={-20} width={14} height={12} fill={INK} />
          <path d="M8 -16 H15 V12 Q15 18 21 14 V-4" fill="none" stroke={W} strokeWidth={3} strokeLinecap="round" />
        </g>
      </g>
      {/* colunas da cobertura */}
      <rect x={P - 404} y={G - 296} width={18} height={296} fill={INK} stroke={W} strokeWidth={1.5} />
      <rect x={P + 504} y={G - 296} width={18} height={296} fill={INK} stroke={W} strokeWidth={1.5} />
      {/* cobertura */}
      <rect x={P - 440} y={G - 326} width={1000} height={30} fill={INK} stroke={W} strokeWidth={2} />
      <line x1={P - 430} y1={G - 316} x2={P + 550} y2={G - 316} stroke={W} strokeWidth={1} opacity={0.5} />
      <line x1={P - 430} y1={G - 306} x2={P + 550} y2={G - 306} stroke={W} strokeWidth={1} opacity={0.5} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={P - 380 + i * 116} y={G - 294} width={34} height={4} rx={2} fill={MONO.g3} />
      ))}
    </g>
  );
}

/** Bomba em primeiro plano, mangueira, bico e indicador. */
export function FuelPump({ pump }: { pump: number }) {
  const P = pump;
  const bars = Array.from({ length: PUMP.gaugeBars }, (_, i) => i);
  return (
    <g>
      {/* ilha */}
      <rect x={P - 56} y={G + 30} width={112} height={18} rx={3} fill={INK} stroke={W} strokeWidth={1.8} />
      {/* corpo da bomba */}
      <rect x={P - 32} y={G - 118} width={64} height={150} rx={7} fill={INK} stroke={W} strokeWidth={2.2} />
      <rect x={P - 36} y={G - 126} width={72} height={12} rx={3} fill={INK} stroke={W} strokeWidth={1.8} />
      {/* mostrador */}
      <rect x={P - 23} y={G - 104} width={46} height={38} rx={3} fill={G5} stroke={W} strokeWidth={1.3} />
      <path d={`M${P - 15} ${G - 96} q-4 6 0 9 q4 -3 0 -9`} fill={W} />
      <rect x={P - 6} y={G - 95} width={22} height={5} rx={1.5} fill={W} opacity={0.5} />
      {bars.map((i) => (
        <rect key={i} data-j="gauge-bar" x={P - 18 + i * 4.75} y={G - 82} width={3.2} height={10} rx={0.8} fill={G4} />
      ))}
      <rect x={P - 20} y={G - 52} width={40} height={60} rx={3} fill="none" stroke={W} strokeWidth={1.2} opacity={0.4} />
      {/* suporte do bico */}
      <rect x={P + 32} y={G - 74} width={12} height={34} rx={2} fill={INK} stroke={W} strokeWidth={1.6} />

      {/* mangueira: contorno branco + miolo preto (paths atualizados pelo renderizador) */}
      <path data-j="hose-outline" d="" fill="none" stroke={W} strokeWidth={8} strokeLinecap="round" />
      <path data-j="hose" d="" fill="none" stroke={INK} strokeWidth={4.4} strokeLinecap="round" />

      {/* bico */}
      <g data-j="nozzle">
        <path d="M-7 -11 H5 Q8 -11 8 -8 V8 Q8 11 5 11 H-7 Z" fill={INK} stroke={W} strokeWidth={1.8} />
        <path d="M8 -4 L21 -1" stroke={W} strokeWidth={4.6} strokeLinecap="round" />
        <path d="M8 -4 L21 -1" stroke={INK} strokeWidth={2} strokeLinecap="round" />
        <path d="M-3 11 Q2 18 8 12" fill="none" stroke={W} strokeWidth={1.6} />
      </g>

      {/* indicador de abastecimento */}
      <g data-j="fuel-chip" opacity={0} transform={`translate(${P - 30} ${G + 92})`}>
        <rect x={0} y={0} width={244} height={40} rx={20} fill={W} stroke={INK} strokeWidth={2} />
        <g transform="translate(24 20)" fill={INK}>
          <rect x={-8} y={-11} width={13} height={22} rx={2} />
          <rect x={-5} y={-8} width={7} height={6} fill={W} />
          <path d="M5 -6 H9 V7 Q9 10 12 8 V-3" fill="none" stroke={INK} strokeWidth={2} />
        </g>
        <text x={48} y={25} fontSize={12} fontWeight={800} letterSpacing={2.2} fill={INK}>
          ABASTECENDO
        </text>
        <rect x={160} y={15} width={68} height={10} rx={5} fill="none" stroke={INK} strokeWidth={1.6} />
        <rect data-j="chip-fill" x={162} y={17} width={0} height={6} rx={3} fill={INK} />
      </g>
    </g>
  );
}
