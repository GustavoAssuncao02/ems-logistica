import { GROUND_Y, MONO, ROAD_H } from "./config";

const G = GROUND_Y;
const { ink: INK, paper: W, g5: G5, g4: G4 } = MONO;

/**
 * Cruzamento com semáforo monocromático.
 * A indicação não depende de cor: lâmpada superior acesa + barra horizontal
 * + placa "PARE"; lâmpada inferior acesa + seta + placa "SIGA".
 *
 * data-j: sig-stop-on, sig-go-on (opacidade das lâmpadas acesas),
 *         sig-label-stop, sig-label-go (placas).
 */
export function TrafficLight({ stopLine, pole }: { stopLine: number; pole: number }) {
  const headY = G - 330;
  return (
    <g>
      {/* poste e braço */}
      <rect x={pole - 6} y={headY + 40} width={12} height={G - headY - 40} fill={INK} stroke={W} strokeWidth={1.5} />
      <rect x={pole - 16} y={G - 10} width={32} height={10} rx={2} fill={INK} stroke={W} strokeWidth={1.4} />

      {/* cabeça do semáforo */}
      <g transform={`translate(${pole} ${headY})`}>
        <rect x={-34} y={-62} width={68} height={128} rx={12} fill={INK} stroke={W} strokeWidth={2.2} />
        {/* viseiras */}
        <path d="M-25 -48 Q0 -62 25 -48" fill="none" stroke={W} strokeWidth={1.6} opacity={0.6} />
        <path d="M-25 6 Q0 -8 25 6" fill="none" stroke={W} strokeWidth={1.6} opacity={0.6} />
        {/* lâmpada PARE (superior) */}
        <g transform="translate(0 -26)">
          <circle r={20} fill={G5} stroke={G4} strokeWidth={1.2} />
          <rect x={-10} y={-3.5} width={20} height={7} rx={2} fill={G4} opacity={0.5} />
          <g data-j="sig-stop-on">
            <circle r={27} fill="none" stroke={W} strokeWidth={1.6} opacity={0.45} />
            <circle r={20} fill={W} />
            <rect x={-10} y={-3.5} width={20} height={7} rx={2} fill={INK} />
          </g>
        </g>
        {/* lâmpada SIGA (inferior) */}
        <g transform="translate(0 30)">
          <circle r={20} fill={G5} stroke={G4} strokeWidth={1.2} />
          <path d="M-9 0 H7 M1 -7 L8 0 L1 7" fill="none" stroke={G4} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
          <g data-j="sig-go-on" opacity={0}>
            <circle r={27} fill="none" stroke={W} strokeWidth={1.6} opacity={0.45} />
            <circle r={20} fill={W} />
            <path d="M-9 0 H7 M1 -7 L8 0 L1 7" fill="none" stroke={INK} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
        {/* placa de texto */}
        <g transform="translate(0 92)">
          <rect x={-40} y={-15} width={80} height={30} rx={5} fill={W} stroke={INK} strokeWidth={2.2} />
          <text data-j="sig-label-stop" x={1.5} y={6} textAnchor="middle" fontSize={16} fontWeight={800} letterSpacing={3} fill={INK}>
            PARE
          </text>
          <text data-j="sig-label-go" x={1.5} y={6} textAnchor="middle" fontSize={16} fontWeight={800} letterSpacing={3} fill={INK} opacity={0}>
            SIGA
          </text>
        </g>
      </g>

      {/* faixa de retenção e faixa de pedestres (vistas de perfil) */}
      <rect x={stopLine - 3} y={G + 3} width={6} height={ROAD_H - 6} fill={W} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={stopLine + 18 + i * 17} y={G + 6} width={9} height={ROAD_H - 12} fill={W} opacity={0.85} />
      ))}
      {/* rua transversal descendo em direção ao observador */}
      <rect x={stopLine + 150} y={G + ROAD_H} width={190} height={140} fill={INK} />
      <rect x={stopLine + 243} y={G + ROAD_H + 12} width={4} height={140} fill={W} opacity={0.6} />
    </g>
  );
}

/** Edifícios geométricos de fundo junto ao cruzamento. */
export function CityBlock({ x }: { x: number }) {
  const blocks = [
    { dx: -520, w: 170, h: 250 },
    { dx: -330, w: 120, h: 190 },
    { dx: 160, w: 210, h: 300 },
    { dx: 390, w: 140, h: 220 },
  ];
  return (
    <g>
      {blocks.map((b) => (
        <g key={b.dx}>
          <rect x={x + b.dx} y={G - b.h} width={b.w} height={b.h} fill={MONO.g2} />
          {Array.from({ length: Math.floor((b.h - 40) / 38) }, (_, r) =>
            Array.from({ length: Math.floor((b.w - 20) / 34) }, (_, c) => (
              <rect key={`${r}-${c}`} x={x + b.dx + 18 + c * 34} y={G - b.h + 24 + r * 38} width={16} height={20} fill={MONO.g1} />
            )),
          )}
        </g>
      ))}
    </g>
  );
}
