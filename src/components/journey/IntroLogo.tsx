import { EmsMonogram, MONOGRAM_MONO_LIGHT } from "@/components/brand/EmsMonogram";
import { ARROW_TIP, LOGO_CENTER } from "@/components/brand/logoGeometry";
import { MONO } from "./config";

/**
 * Abertura da jornada: o monograma EMS é construído peça a peça (E, S, m,
 * barras, seta em zigue-zague e brilho na ponta), recebe o descritor e, em
 * seguida, voa até a lateral do baú — onde se torna a logo do caminhão.
 *
 * O grupo `intro-logo` recebe a transformação de voo do renderizador.
 * Coordenadas internas = coordenadas do monograma (ver logoGeometry.ts).
 */
export function IntroLogo() {
  return (
    <g data-j="intro" pointerEvents="none" opacity={0}>
      <g data-j="intro-logo" transform="translate(800 286) scale(0.5)">
        <g transform={`translate(${-LOGO_CENTER.x} ${-LOGO_CENTER.y})`}>
          <EmsMonogram palette={MONOGRAM_MONO_LIGHT} animPrefix="il" />
          <circle
            data-j="il-flash"
            cx={ARROW_TIP.x}
            cy={ARROW_TIP.y}
            r={0}
            fill="none"
            stroke={MONO.ink}
            strokeWidth={6}
            opacity={0}
          />
          <text
            data-j="il-desc"
            x={533}
            y={520}
            textAnchor="middle"
            fontSize={74}
            fontWeight={700}
            letterSpacing={44}
            fill={MONO.ink}
            opacity={0}
          >
            LOGÍSTICA
          </text>
        </g>
      </g>
    </g>
  );
}
