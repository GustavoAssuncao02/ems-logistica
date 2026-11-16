import { GROUND_Y, MONO } from "./config";

const G = GROUND_Y;
const { ink: INK, paper: W, g5: G5 } = MONO;

/** Comprimento da cancela (do eixo até a ponta). */
export const BARRIER_LENGTH = 232;
/** Altura do eixo de giro da cancela. */
export const BARRIER_PIVOT_Y = G - 104;

/**
 * Praça de pedágio em vista lateral: cobertura, cabine, poste e cancela.
 * A cancela gira a partir do eixo (data-j="toll-arm"); a luz do poste
 * (data-j="toll-lamp") acende quando a passagem é liberada.
 */
export function TollBooth({ pivot }: { pivot: number }) {
  const P = pivot;
  return (
    <g>
      {/* colunas da cobertura */}
      <rect x={P - 590} y={G - 342} width={16} height={342} fill={INK} stroke={W} strokeWidth={1.5} />
      <rect x={P + 226} y={G - 342} width={16} height={342} fill={INK} stroke={W} strokeWidth={1.5} />

      {/* cabine de cobrança */}
      <g>
        <rect x={P + 40} y={G - 206} width={164} height={12} rx={2} fill={INK} stroke={W} strokeWidth={1.6} />
        <rect x={P + 48} y={G - 194} width={148} height={194} fill={INK} stroke={W} strokeWidth={2} />
        <rect x={P + 62} y={G - 172} width={120} height={58} rx={3} fill={G5} stroke={W} strokeWidth={1.5} />
        <line x1={P + 122} y1={G - 172} x2={P + 122} y2={G - 114} stroke={W} strokeWidth={1.2} opacity={0.5} />
        <rect x={P + 62} y={G - 100} width={120} height={6} fill={W} opacity={0.5} />
        <rect x={P + 112} y={G - 78} width={40} height={64} fill="none" stroke={W} strokeWidth={1.2} opacity={0.5} />
      </g>

      {/* cobertura */}
      <rect x={P - 610} y={G - 372} width={872} height={30} fill={INK} stroke={W} strokeWidth={2} />
      <text x={P - 174} y={G - 352} textAnchor="middle" fontSize={13} fontWeight={800} letterSpacing={6} fill={W}>
        PEDÁGIO
      </text>
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={P - 560 + i * 92} y={G - 340} width={30} height={4} rx={2} fill={MONO.g3} />
      ))}

      {/* poste da cancela */}
      <rect x={P - 18} y={G - 132} width={36} height={10} rx={2} fill={INK} stroke={W} strokeWidth={1.6} />
      <rect x={P - 14} y={G - 122} width={28} height={122} fill={INK} stroke={W} strokeWidth={2} />
      <circle data-j="toll-lamp" cx={P} cy={G - 66} r={7} fill={MONO.g4} stroke={W} strokeWidth={1.4} />

      {/* cancela (gira a partir do eixo) */}
      <g transform={`translate(${P} ${BARRIER_PIVOT_Y})`}>
        <g data-j="toll-arm">
          <rect x={-BARRIER_LENGTH} y={-6} width={BARRIER_LENGTH + 8} height={12} rx={3} fill={W} stroke={INK} strokeWidth={1.6} />
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={-BARRIER_LENGTH + 10 + i * 38} y={-4.5} width={19} height={9} fill={INK} />
          ))}
          <rect x={8} y={-10} width={26} height={20} rx={3} fill={INK} stroke={W} strokeWidth={1.6} />
          <circle r={5} fill={W} stroke={INK} strokeWidth={1.6} />
        </g>
      </g>
    </g>
  );
}
