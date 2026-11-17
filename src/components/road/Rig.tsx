import { EmsMonogram, MONOGRAM_COLOR } from "@/components/brand/EmsMonogram";
import { LOGO_CENTER, LOGO_WIDTH } from "@/components/brand/logoGeometry";
import { C, RIG } from "./constants";

const PANEL = "#DDE0E4";
const LINE = "#C3C9D1";
const DARK = "#1F232A";
const UNDER = "#15181D";
const STEEL = "#9AA3AE";
/** Cavalo mecânico no azul da marca. */
const CAB_LINE = "#3A5C9E";

const BOX = { top: -158, bottom: -48, end: 494 };
const LOGO = { cx: 250, cy: -104, width: 214 };
const R = RIG.wheelR;

/**
 * Carreta EMS: semirreboque baú branco + cavalo mecânico azul, vista
 * lateral apontando para a direita. Origem: chão, sob a traseira do baú;
 * y negativo para cima.
 *
 * Para ler como um conjunto único e pesado: chassi e suspensão escuros
 * preenchem o vão entre o baú e as rodas, os pneus encostam no chassi, há
 * para-lamas sobre os eixos e a quinta roda + mangueiras ligam baú e cabine.
 *
 * Partes animadas (data-r): rig-trailer e rig-cab (balanço), wheel (giro),
 * brake (luz de freio).
 */
export function Rig() {
  const s = LOGO.width / LOGO_WIDTH;
  const [a1, , a3] = RIG.trailerAxles;
  const [d1, d2] = RIG.tractorAxles;
  const fender = (from: number, to: number) =>
    `M${from - R - 6} ${-R - 3} Q${from - R - 6} ${-2 * R - 6} ${from} ${-2 * R - 6} H${to} Q${to + R + 6} ${-2 * R - 6} ${to + R + 6} ${-R - 3}`;
  return (
    <g>
      <defs>
        <linearGradient id="hr-box" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F0F1F3" />
          <stop offset="0.7" stopColor="#E6E8EB" />
          <stop offset="1" stopColor="#D3D7DC" />
        </linearGradient>
        <linearGradient id="hr-cab" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A4C8F" />
          <stop offset="0.55" stopColor={C.navy} />
          <stop offset="1" stopColor="#0F2248" />
        </linearGradient>
        <linearGradient id="hr-beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFE9B0" stopOpacity="0.45" />
          <stop offset="1" stopColor="#FFE9B0" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* sombra e facho do farol */}
      <ellipse cx={304} cy={1} rx={322} ry={6} fill="#000" opacity={0.35} />
      <path d="M606 -54 L800 -38 L800 0 L606 -46 Z" fill="url(#hr-beam)" />

      {/* ── semirreboque ─────────────────────────────────────────── */}
      <g data-r="rig-trailer">
        {/* longarina e suspensão: base escura logo acima dos pneus */}
        <rect x={20} y={BOX.bottom} width={474} height={8} fill={DARK} />
        <rect x={a1 - 30} y={BOX.bottom + 4} width={a3 - a1 + 60} height={R + 6} rx={3} fill={UNDER} />
        {/* pés de apoio */}
        <rect x={352} y={-42} width={7} height={26} fill={STEEL} />
        <rect x={346} y={-17} width={20} height={4} rx={1} fill={DARK} />
        {/* protetor lateral */}
        <rect x={a3 + 34} y={-38} width={124} height={4} rx={2} fill={STEEL} />
        <rect x={a3 + 34} y={-29} width={124} height={4} rx={2} fill={STEEL} />
        {/* para-choque traseiro */}
        <rect x={8} y={-44} width={5} height={12} fill={DARK} />
        <rect x={-4} y={-34} width={28} height={7} rx={1.5} fill={DARK} />

        {/* baú */}
        <rect x={0} y={BOX.top} width={BOX.end} height={BOX.bottom - BOX.top} rx={3} fill="url(#hr-box)" stroke={LINE} strokeWidth={1.2} />
        <rect x={0} y={BOX.top} width={BOX.end} height={5} rx={2} fill={PANEL} />
        <rect x={0} y={BOX.bottom - 6} width={BOX.end} height={6} fill={PANEL} stroke={LINE} strokeWidth={0.8} />
        <rect x={0} y={BOX.top + 3} width={8} height={BOX.bottom - BOX.top - 6} fill={PANEL} />
        {[66, 126, 374, 434].map((x) => (
          <line key={x} x1={x} y1={BOX.top + 6} x2={x} y2={BOX.bottom - 7} stroke={LINE} strokeWidth={1} opacity={0.45} />
        ))}
        {[40, 90, 140, 190, 240, 290, 340, 390, 440].map((x) => (
          <circle key={x} cx={x} cy={BOX.bottom - 3} r={1.8} fill="#F59E0B" />
        ))}
        <g transform={`translate(${LOGO.cx} ${LOGO.cy}) scale(${s}) translate(${-LOGO_CENTER.x} ${-LOGO_CENTER.y})`}>
          <EmsMonogram palette={MONOGRAM_COLOR} gapColor="#E9EBEE" />
        </g>
        <rect data-r="brake" x={-3} y={BOX.bottom - 2} width={6} height={10} rx={1.5} fill="#7A1D1D" />

        {/* para-lama sobre o conjunto de eixos + para-barro */}
        <path d={fender(a1, a3)} fill="none" stroke={DARK} strokeWidth={5} strokeLinecap="round" />
        <rect x={a3 + R + 8} y={-2 * R - 4} width={6} height={2 * R - 2} rx={1} fill={DARK} />
      </g>

      {RIG.trailerAxles.map((x) => (
        <Wheel key={x} x={x} />
      ))}

      {/* ── cavalo mecânico ──────────────────────────────────────── */}
      <g data-r="rig-cab">
        {/* chassi escuro do pino-rei à frente (também fecha as caixas de roda) */}
        <rect x={d1 - R - 12} y={-52} width={606 - d1 + R + 12} height={32} rx={3} fill={UNDER} />
        {/* quinta roda encaixada sob o baú */}
        <rect x={d1 - 4} y={-54} width={60} height={7} rx={2} fill={DARK} />
        {/* mangueiras de ar entre baú e cabine */}
        <path d={`M${BOX.end} -74 C${BOX.end + 8} -60 ${BOX.end + 4} -98 508 -88`} fill="none" stroke="#E11D48" strokeWidth={2} />
        <path d={`M${BOX.end} -68 C${BOX.end + 10} -54 ${BOX.end + 6} -90 508 -80`} fill="none" stroke="#2F6FD1" strokeWidth={2} />
        {/* para-lamas dos eixos de tração */}
        <path d={fender(d1, d2)} fill="none" stroke={DARK} strokeWidth={5} strokeLinecap="round" />
        {/* tanque */}
        <rect x={d2 + R + 10} y={-50} width={504 - d2 - R - 8} height={22} rx={8} fill="#C9CFD7" stroke={STEEL} strokeWidth={1} />
        <circle cx={RIG.tankCap.x} cy={RIG.tankCap.y + 2} r={3} fill="#7C8590" />
        {/* cabine */}
        <path
          d="M504 -26 V-132 Q504 -140 512 -140 H578 Q592 -140 595 -126 L600 -84 V-34 Q600 -26 592 -26 H575.7 A24 24 0 0 0 528.3 -26 Z"
          fill="url(#hr-cab)"
          stroke={CAB_LINE}
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
        <path d="M508 -140 L512 -151 Q514 -155 519 -155 H566 Q579 -155 587 -140 Z" fill="#2A4C8F" stroke={CAB_LINE} strokeWidth={1} />
        <path d="M562 -129 H588 Q592 -129 593 -124 L596 -97 H562 Z" fill={C.glass} />
        <path d="M566 -125 L574 -101" stroke="#FFFFFF" strokeWidth={1.4} opacity={0.25} />
        <path d="M556 -133 V-30" stroke={CAB_LINE} strokeWidth={1.1} />
        <rect x={562} y={-82} width={10} height={3} rx={1.5} fill={STEEL} />
        {[-112, -106, -100, -94].map((y) => (
          <line key={y} x1={514} y1={y} x2={542} y2={y} stroke={CAB_LINE} strokeWidth={1.4} />
        ))}
        <path d="M596 -110 L604 -114" stroke={DARK} strokeWidth={2} />
        <rect x={602} y={-124} width={6} height={22} rx={2} fill={DARK} />
        {[-78, -74, -70, -66].map((y) => (
          <line key={y} x1={596} y1={y} x2={600} y2={y} stroke={STEEL} strokeWidth={1.4} />
        ))}
        <rect x={595} y={-56} width={9} height={7} rx={2} fill="#FFE6A6" />
        <rect x={586} y={-44} width={20} height={18} rx={3} fill="#CFD4DA" stroke={LINE} strokeWidth={1} />
        <rect x={508} y={-30} width={16} height={4} rx={1} fill={STEEL} />
      </g>

      {RIG.tractorAxles.map((x) => (
        <Wheel key={x} x={x} />
      ))}
    </g>
  );
}

function Wheel({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} ${-R})`}>
      <circle r={R} fill="#1B1E24" />
      <circle r={R - 3.5} fill="none" stroke="#2E333B" strokeWidth={2} />
      <g data-r="wheel">
        <circle r={11.5} fill="#C9CED6" />
        <circle r={8} fill="#AAB1BB" />
        {[0, 72, 144, 216, 288].map((a) => (
          <circle key={a} cx={0} cy={-5.6} r={1.4} fill="#5D6570" transform={`rotate(${a})`} />
        ))}
        <rect x={-1.1} y={-11.5} width={2.2} height={4} fill="#6B737E" />
        <circle r={2.6} fill="#6B737E" />
      </g>
    </g>
  );
}

/** Carro na contramão (aponta para a esquerda). Origem: chão, sob o para-choque dianteiro. */
export function Car({ slot }: { slot: number }) {
  return (
    <g data-r={`car-${slot}`} display="none">
      <ellipse cx={86} cy={1} rx={88} ry={4} fill="#000" opacity={0.25} />
      <path
        data-r={`car-body-${slot}`}
        d="M0 -16 Q0 -25 10 -27 L40 -31 Q58 -50 80 -52 H118 Q134 -52 146 -33 L162 -30 Q170 -29 170 -19 V-13 Q170 -8 164 -8 H4 Q0 -8 0 -12 Z"
        fill="#D64545"
      />
      <path d="M50 -33 Q64 -46 80 -47 H96 V-33 Z" fill={C.glass} />
      <path d="M101 -47 H116 Q128 -47 138 -33 H101 Z" fill={C.glass} />
      <rect x={1} y={-24} width={7} height={5} rx={2} fill="#FFE6A6" />
      <rect x={163} y={-25} width={6} height={6} rx={2} fill="#E11D48" />
      {[34, 136].map((x) => (
        <g key={x} transform={`translate(${x} -11)`}>
          <circle r={11} fill="#1B1E24" />
          <circle r={5.5} fill="#B9C0C9" />
        </g>
      ))}
    </g>
  );
}
