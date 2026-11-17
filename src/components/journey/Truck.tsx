import { EmsMonogram, MONOGRAM_MONO_DARK } from "@/components/brand/EmsMonogram";
import { LOGO_CENTER, LOGO_WIDTH } from "@/components/brand/logoGeometry";
import { MONO, TRUCK } from "./config";

const { ink: INK, paper: W, g4: G4, g5: G5 } = MONO;

/**
 * Caminhão mestre da jornada — único em todas as cenas.
 *
 * Vista lateral de 90°, sempre apontando para a direita. Caminhão "truck"
 * (eixo dianteiro + tandem traseiro) com baú. Coordenadas locais: origem no
 * chão, sob a traseira; x cresce para a frente; y negativo para cima.
 *
 * Partes animáveis (data-j):
 *  truck-body   → arfagem/vibração da carroceria (rodas ficam no chão)
 *  wheel-rot    → rotação das rodas (proporcional à distância percorrida)
 *  tail-light   → luz de freio
 *  headlight    → farol
 *  truck-logo   → assinatura no baú (troca com a logo da abertura)
 */
export function Truck() {
  const s = TRUCK.logo.width / LOGO_WIDTH;
  return (
    <g data-j="truck">
      <g data-j="truck-body">
        {/* escapamento vertical */}
        <rect x={355} y={-246} width={8} height={180} rx={2.5} fill={INK} stroke={W} strokeWidth={1.6} />
        <rect x={353} y={-252} width={12} height={8} rx={2} fill={INK} stroke={W} strokeWidth={1.4} />

        {/* chassi */}
        <rect x={4} y={-72} width={516} height={16} rx={2} fill={INK} stroke={W} strokeWidth={1.8} />

        {/* ── baú ─────────────────────────────────────────────── */}
        <rect x={0} y={-236} width={352} height={164} rx={4} fill={INK} stroke={W} strokeWidth={2.6} />
        <line x1={7} y1={-226} x2={345} y2={-226} stroke={W} strokeWidth={1.2} opacity={0.65} />
        <line x1={7} y1={-86} x2={345} y2={-86} stroke={W} strokeWidth={1.2} opacity={0.65} />
        <line x1={14} y1={-226} x2={14} y2={-86} stroke={W} strokeWidth={1.2} opacity={0.4} />
        <line x1={338} y1={-226} x2={338} y2={-86} stroke={W} strokeWidth={1.2} opacity={0.4} />
        {/* dobradiças da porta traseira */}
        {[-212, -160, -108].map((y) => (
          <rect key={y} x={-3} y={y} width={9} height={11} rx={1.5} fill={INK} stroke={W} strokeWidth={1.3} />
        ))}
        {/* luzes de posição laterais */}
        {[60, 176, 292].map((x) => (
          <rect key={x} x={x - 5} y={-81} width={10} height={4} rx={2} fill={W} opacity={0.75} />
        ))}
        {/* assinatura EMS monocromática */}
        <g data-j="truck-logo">
          <g transform={`translate(${TRUCK.logo.cx} ${TRUCK.logo.cy}) scale(${s}) translate(${-LOGO_CENTER.x} ${-LOGO_CENTER.y})`}>
            <EmsMonogram palette={MONOGRAM_MONO_DARK} gapColor={INK} />
          </g>
        </g>
        <text
          data-j="truck-desc"
          x={TRUCK.logo.cx + 2.5}
          y={-104}
          textAnchor="middle"
          fontSize={11.5}
          fontWeight={700}
          letterSpacing={5}
          fill={MONO.label}
        >
          LOGÍSTICA
        </text>

        {/* lanterna traseira / luz de freio */}
        <rect data-j="tail-light" x={-4} y={-98} width={8} height={14} rx={2} fill={G4} stroke={W} strokeWidth={1.2} />
        {/* para-choque traseiro */}
        <rect x={-8} y={-50} width={24} height={9} rx={1.5} fill={INK} stroke={W} strokeWidth={1.6} />
        <line x1={6} y1={-56} x2={6} y2={-50} stroke={W} strokeWidth={1.6} />

        {/* para-barro atrás do tandem */}
        <rect x={210} y={-62} width={6} height={46} rx={1} fill={INK} stroke={W} strokeWidth={1.4} />

        {/* tanque de combustível */}
        <rect x={250} y={-80} width={98} height={40} rx={19} fill={INK} stroke={W} strokeWidth={2} />
        <line x1={266} y1={-60} x2={332} y2={-60} stroke={W} strokeWidth={1} opacity={0.35} />
        <rect x={TRUCK.tankCap.x - 6} y={TRUCK.tankCap.y - 5} width={12} height={6} rx={1.5} fill={W} />

        {/* ── cabine ──────────────────────────────────────────── */}
        <path
          d="M366 -56 V-214 Q366 -224 376 -224 H488 Q506 -224 511 -206 L519 -152 L522 -64 Q522 -56 514 -56 H490.1 A44 44 0 0 0 413.9 -56 Z"
          fill={INK}
          stroke={W}
          strokeWidth={2.6}
          strokeLinejoin="round"
        />
        {/* defletor de teto */}
        <path
          d="M374 -224 L384 -239 Q386 -242 391 -242 L452 -242 Q467 -242 482 -224 Z"
          fill={INK}
          stroke={W}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {/* janela do leito */}
        <rect x={378} y={-204} width={40} height={22} rx={4} fill={G5} stroke={W} strokeWidth={1.5} />
        {/* porta */}
        <path d="M432 -214 V-64" stroke={W} strokeWidth={1.4} opacity={0.75} />
        <path d="M432 -110 H514" stroke={W} strokeWidth={1.1} opacity={0.35} />
        {/* janela da porta */}
        <path d="M440 -208 H496 Q503 -208 504.6 -201 L511 -160 H440 Z" fill={G5} stroke={W} strokeWidth={2} strokeLinejoin="round" />
        <path d="M462 -203 L449 -166 M480 -203 L469 -172" stroke={W} strokeWidth={1.2} opacity={0.3} />
        {/* maçaneta */}
        <rect x={440} y={-148} width={14} height={3.5} rx={1.75} fill={W} />
        {/* grade frontal (vista de perfil) */}
        <path d="M512 -150 V-102" stroke={W} strokeWidth={1.2} opacity={0.6} />
        {[-146, -138, -130, -122, -114, -106].map((y) => (
          <line key={y} x1={514} y1={y} x2={521} y2={y} stroke={W} strokeWidth={1.8} strokeLinecap="round" />
        ))}
        {/* seta lateral */}
        <rect x={496} y={-128} width={10} height={4} rx={2} fill={W} opacity={0.8} />
        {/* farol */}
        <path data-j="headlight" d="M507 -94 H521 V-80 H507 Q503 -87 507 -94 Z" fill={G4} stroke={W} strokeWidth={1.2} />
        {/* para-choque dianteiro */}
        <rect x={496} y={-70} width={30} height={20} rx={3} fill={INK} stroke={W} strokeWidth={2} />
        <line x1={501} y1={-60} x2={521} y2={-60} stroke={W} strokeWidth={1} opacity={0.5} />
        {/* degraus */}
        <rect x={380} y={-48} width={26} height={5} rx={1.5} fill={INK} stroke={W} strokeWidth={1.4} />
        <rect x={380} y={-30} width={26} height={5} rx={1.5} fill={INK} stroke={W} strokeWidth={1.4} />
        <line x1={384} y1={-56} x2={384} y2={-25} stroke={W} strokeWidth={1.4} />
        {/* retrovisor */}
        <path d="M509 -180 L530 -188" stroke={W} strokeWidth={2.4} strokeLinecap="round" />
        <rect x={528} y={-208} width={11} height={44} rx={4} fill={INK} stroke={W} strokeWidth={2} />
      </g>

      {TRUCK.wheelsX.map((wx) => (
        <Wheel key={wx} x={wx} />
      ))}
    </g>
  );
}

function Wheel({ x }: { x: number }) {
  const r = TRUCK.wheelR;
  return (
    <g transform={`translate(${x} ${-r})`}>
      <circle r={r} fill={INK} stroke={W} strokeWidth={2.6} />
      <circle r={r - 7} fill="none" stroke={W} strokeWidth={1} opacity={0.22} />
      <g data-j="wheel-rot">
        <circle r={18.5} fill={G5} stroke={W} strokeWidth={2} />
        {[0, 72, 144, 216, 288].map((a) => (
          <rect key={a} x={-3.2} y={-16} width={6.4} height={7} rx={1.6} fill={W} transform={`rotate(${a})`} />
        ))}
        <circle r={5.5} fill={W} />
        <circle r={2} fill={INK} />
      </g>
    </g>
  );
}
