import { GROUND_Y, MONO, STAGE, WATER_Y } from "./config";
import { FERRY_DECK } from "./plan";

const G = GROUND_Y;
const { ink: INK, paper: W, g5: G5 } = MONO;

export const RAMP_LENGTH = 74;
export const RAMP_RAISED = 58;
export const WAVE = { length: 64, rows: [WATER_Y + 16, WATER_Y + 40, WATER_Y + 66, WATER_Y + 92] } as const;

/**
 * Balsa em vista lateral (mesmo ângulo de câmera do resto da viagem).
 * Grupo móvel `data-j="ferry"`: o renderizador desloca a balsa e aplica o
 * mesmo deslocamento (e balanço) ao caminhão embarcado.
 */
export function Ferry({ deckStart }: { deckStart: number }) {
  const D = deckStart;
  const L = FERRY_DECK;
  return (
    <g data-j="ferry">
      {/* esteira (aparece com a balsa em movimento) */}
      <g data-j="wake" opacity={0} fill="none" stroke={W} strokeWidth={2.4} strokeLinecap="round">
        <path d={`M${D - 10} ${WATER_Y + 6} Q${D - 60} ${WATER_Y + 2} ${D - 120} ${WATER_Y + 8}`} />
        <path d={`M${D - 4} ${WATER_Y + 20} Q${D - 80} ${WATER_Y + 16} ${D - 170} ${WATER_Y + 24}`} />
        <path d={`M${D + 6} ${WATER_Y + 34} Q${D - 70} ${WATER_Y + 32} ${D - 140} ${WATER_Y + 38}`} />
      </g>

      {/* casa de comando elevada (lado oposto, atrás do caminhão) */}
      <g>
        <rect x={D + L - 150} y={G - 268} width={8} height={268} fill={INK} stroke={W} strokeWidth={1.2} />
        <rect x={D + L - 52} y={G - 268} width={8} height={268} fill={INK} stroke={W} strokeWidth={1.2} />
        <rect x={D + L - 170} y={G - 330} width={146} height={64} rx={4} fill={INK} stroke={W} strokeWidth={2} />
        <rect x={D + L - 178} y={G - 340} width={162} height={12} rx={2} fill={INK} stroke={W} strokeWidth={1.6} />
        <rect x={D + L - 158} y={G - 318} width={122} height={26} rx={2} fill={G5} stroke={W} strokeWidth={1.4} />
        {[1, 2, 3].map((i) => (
          <line key={i} x1={D + L - 158 + i * 30.5} y1={G - 318} x2={D + L - 158 + i * 30.5} y2={G - 292} stroke={W} strokeWidth={1.2} />
        ))}
        <line x1={D + L - 40} y1={G - 340} x2={D + L - 40} y2={G - 392} stroke={INK} strokeWidth={3} />
        <path data-j="pennant" d={`M${D + L - 40} ${G - 392} L${D + L - 8} ${G - 384} L${D + L - 40} ${G - 376} Z`} fill={INK} />
      </g>

      {/* guarda-corpo do lado oposto */}
      <g stroke={INK} strokeWidth={1.6}>
        <line x1={D + 14} y1={G - 38} x2={D + L - 14} y2={G - 38} />
        {Array.from({ length: 19 }, (_, i) => (
          <line key={i} x1={D + 14 + i * 40.7} y1={G - 38} x2={D + 14 + i * 40.7} y2={G} />
        ))}
      </g>
      <circle cx={D + 64} cy={G - 19} r={11} fill="none" stroke={INK} strokeWidth={4} />

      {/* rampas articuladas */}
      <g transform={`translate(${D} ${G})`}>
        <g data-j="ramp-left">
          <rect x={-RAMP_LENGTH} y={-1} width={RAMP_LENGTH} height={7} rx={1.5} fill={INK} stroke={W} strokeWidth={1.6} />
          {[16, 36, 56].map((v) => (
            <line key={v} x1={-v} y1={0} x2={-v} y2={5} stroke={W} strokeWidth={1} opacity={0.6} />
          ))}
        </g>
        <circle r={4} fill={W} stroke={INK} strokeWidth={1.4} />
      </g>
      <g transform={`translate(${D + L} ${G})`}>
        <g data-j="ramp-right" transform={`rotate(${-RAMP_RAISED})`}>
          <rect x={0} y={-1} width={RAMP_LENGTH} height={7} rx={1.5} fill={INK} stroke={W} strokeWidth={1.6} />
          {[16, 36, 56].map((v) => (
            <line key={v} x1={v} y1={0} x2={v} y2={5} stroke={W} strokeWidth={1} opacity={0.6} />
          ))}
        </g>
        <circle r={4} fill={W} stroke={INK} strokeWidth={1.4} />
      </g>

      {/* casco */}
      <path d={`M${D} ${G} H${D + L} L${D + L - 30} ${G + 66} H${D + 30} Z`} fill={INK} stroke={W} strokeWidth={2.6} strokeLinejoin="round" />
      <line x1={D + 4} y1={G + 3} x2={D + L - 4} y2={G + 3} stroke={W} strokeWidth={2} />
      <line x1={D + 10} y1={G + 16} x2={D + L - 10} y2={G + 16} stroke={W} strokeWidth={1.2} opacity={0.5} />
      {[0.12, 0.88].map((k) => (
        <circle key={k} cx={D + L * k} cy={G + 26} r={8} fill="none" stroke={W} strokeWidth={2} />
      ))}
    </g>
  );
}

/** Rio: cais das duas margens, água e ondas animadas. Fica à frente do casco. */
export function River({ bankLeft, bankRight }: { bankLeft: number; bankRight: number }) {
  const w = bankRight - bankLeft;
  const waveD = wavePath(bankLeft - WAVE.length * 2, w + WAVE.length * 4, 3.2);
  return (
    <g>
      <defs>
        <clipPath id="river-clip">
          <rect x={bankLeft} y={WATER_Y - 6} width={w} height={STAGE.h} />
        </clipPath>
      </defs>
      <rect x={bankLeft} y={WATER_Y} width={w} height={STAGE.h - WATER_Y + 40} fill={MONO.water} />
      <g clipPath="url(#river-clip)">
        {WAVE.rows.map((y, i) => (
          <g key={y} transform={`translate(0 ${y})`}>
            <path
              data-j="wave"
              d={waveD}
              fill="none"
              stroke={i % 2 ? W : MONO.g4}
              strokeWidth={i % 2 ? 2.2 : 1.8}
              strokeLinecap="round"
              strokeDasharray={i % 2 ? "44 84" : "96 32"}
              opacity={i === 0 ? 0.9 : 0.75}
            />
          </g>
        ))}
        {/* linha da superfície */}
        <g transform={`translate(0 ${WATER_Y})`}>
          <path data-j="wave" d={waveD} fill="none" stroke={MONO.g4} strokeWidth={2} />
        </g>
      </g>
      {/* cais */}
      <Quay x={bankLeft - 30} />
      <Quay x={bankRight} />
    </g>
  );
}

function Quay({ x }: { x: number }) {
  return (
    <g>
      <rect x={x} y={G} width={30} height={STAGE.h - G + 40} fill={INK} stroke={W} strokeWidth={2} />
      {[G + 30, G + 70, G + 110].map((y) => (
        <line key={y} x1={x + 4} y1={y} x2={x + 26} y2={y} stroke={W} strokeWidth={1} opacity={0.4} />
      ))}
    </g>
  );
}

function wavePath(x0: number, width: number, amp: number) {
  const L = WAVE.length;
  let d = `M${x0} 0`;
  for (let x = x0; x < x0 + width; x += L) {
    d += ` q${L / 4} ${-amp} ${L / 2} 0 t${L / 2} 0`;
  }
  return d;
}
