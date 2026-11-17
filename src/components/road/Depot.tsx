import { C, CARGO, GROUND } from "./constants";

/** Topo da plataforma da doca = piso do baú. */
const DOCK = GROUND + CARGO.floor;
const CARTON = "#C8955A";
const CARTON_EDGE = "#A8743E";

/**
 * Centro de distribuição da abertura. Coordenadas locais: x = 0 é a
 * borda da doca, onde encosta a traseira do baú; o galpão se estende para a
 * esquerda. As caixas que vão para o baú ficam na própria carreta (Rig) e
 * são desenhadas por cima do galpão.
 */
export function Depot() {
  return (
    <g data-r="depot">
      <defs>
        <linearGradient id="hr-dock-in" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3A3326" />
          <stop offset="1" stopColor="#6B5533" />
        </linearGradient>
        <radialGradient id="hr-dock-glow">
          <stop offset="0" stopColor={C.warm} stopOpacity="0.7" />
          <stop offset="1" stopColor={C.warm} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* galpão */}
      <rect x={-1200} y={92} width={1194} height={DOCK - 92} fill="#DCE0E5" />
      {Array.from({ length: 15 }, (_, i) => (
        <line key={i} x1={-1160 + i * 80} y1={104} x2={-1160 + i * 80} y2={DOCK} stroke="#C3C9D1" strokeWidth={1.2} />
      ))}
      <rect x={-1212} y={74} width={1214} height={20} rx={2} fill="#B9C0C9" />
      <rect x={-1200} y={94} width={1194} height={8} fill={C.navy} />
      {/* outras docas (fechadas) */}
      {[-1000, -820, -400].map((x) => (
        <g key={x}>
          <rect x={x} y={DOCK - 96} width={130} height={96} fill="#A9B0BA" />
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1={x} y1={DOCK - 86 + i * 11} x2={x + 130} y2={DOCK - 86 + i * 11} stroke="#939BA6" strokeWidth={1.4} />
          ))}
          <rect x={x - 4} y={DOCK - 102} width={138} height={6} fill="#8A929C" />
        </g>
      ))}

      {/* doca aberta, iluminada, com carga nas prateleiras */}
      <rect x={-178} y={DOCK - 106} width={172} height={106} fill="url(#hr-dock-in)" />
      <circle cx={-92} cy={DOCK - 60} r={90} fill="url(#hr-dock-glow)" />
      {[DOCK - 70, DOCK - 38].map((y) => (
        <rect key={y} x={-170} y={y} width={60} height={3} fill="#8A929C" />
      ))}
      {[
        [-166, DOCK - 92],
        [-142, DOCK - 92],
        [-166, DOCK - 60],
        [-140, DOCK - 60],
      ].map(([x, y]) => (
        <rect key={`${x}${y}`} x={x} y={y} width={22} height={22} rx={1.5} fill={CARTON} stroke={CARTON_EDGE} strokeWidth={1} />
      ))}
      <rect x={-184} y={DOCK - 112} width={184} height={7} fill="#8A929C" />
      <rect x={-98} y={DOCK - 124} width={14} height={6} rx={2} fill="#3A4150" />
      <rect x={-96} y={DOCK - 119} width={10} height={2.5} rx={1} fill={C.warm} />

      {/* plataforma da doca */}
      <rect x={-1200} y={DOCK} width={1200} height={GROUND + 12 - DOCK} fill="#A3ABB5" />
      <rect x={-1200} y={DOCK} width={1200} height={4} fill="#C4C9D0" />
      <rect x={-12} y={DOCK + 4} width={12} height={GROUND + 8 - DOCK} fill="#F2C94C" />
      {[DOCK + 10, DOCK + 26, DOCK + 42].map((y) => (
        <rect key={y} x={-12} y={y} width={12} height={7} fill="#1F232A" />
      ))}
      <rect x={-6} y={DOCK + 6} width={8} height={16} rx={2} fill="#1F232A" />
      {/* roletes da esteira */}
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={i} cx={-170 + i * 20} cy={DOCK - 1} r={2.4} fill="#6B737E" />
      ))}
    </g>
  );
}
