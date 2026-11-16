import { useId } from "react";
import {
  ARROW_GAP,
  ARROW_HEAD,
  ARROW_LINE,
  ARROW_STROKE,
  LOGO_BASELINE,
  PATH_E,
  PATH_M,
  PATH_S,
  REGION_ABOVE,
  REGION_BELOW,
  BAR_RECTS,
} from "./logoGeometry";

export type MonogramPalette = {
  letters: string;
  bars: string;
  arrow: string;
};

export const MONOGRAM_COLOR: MonogramPalette = {
  letters: "#162F60",
  bars: "#989DA6",
  arrow: "#F47C28",
};

export const MONOGRAM_MONO_LIGHT: MonogramPalette = {
  letters: "#0E0E0E",
  bars: "#9A9A9A",
  arrow: "#0E0E0E",
};

export const MONOGRAM_MONO_DARK: MonogramPalette = {
  letters: "#FFFFFF",
  bars: "#8C8C8C",
  arrow: "#FFFFFF",
};

type Props = {
  palette?: MonogramPalette;
  /**
   * Quando definido, cada parte recebe `data-j="<prefixo>-<parte>"` para que
   * a timeline da jornada possa animá-las (revelação da marca).
   */
  animPrefix?: string;
  /**
   * Cor sólida do fundo. Quando informada, o vão da seta é desenhado com
   * traço dessa cor em vez de máscara (mais leve para elementos em movimento).
   */
  gapColor?: string;
};

function safeId(raw: string) {
  return raw.replace(/[^a-zA-Z0-9_-]/g, "");
}

/**
 * Monograma EMS em coordenadas próprias (ver logoGeometry.ts).
 * Deve ser usado dentro de um <svg>. O vão branco entre a seta e as letras é
 * uma máscara — funciona sobre qualquer fundo (claro, escuro ou o baú preto).
 */
export function EmsMonogram({ palette = MONOGRAM_COLOR, animPrefix, gapColor }: Props) {
  const uid = safeId(useId());
  const gapMask = `ems-gap-${uid}`;
  const clipAbove = `ems-above-${uid}`;
  const clipBelow = `ems-below-${uid}`;
  const clipBase = `ems-base-${uid}`;
  const clipS = `ems-s-${uid}`;
  const part = (name: string) => (animPrefix ? { "data-j": `${animPrefix}-${name}` } : {});

  return (
    <g>
      <defs>
        {!gapColor && (
        <mask id={gapMask} maskUnits="userSpaceOnUse" x={-40} y={-80} width={1120} height={560}>
          <rect x={-40} y={-80} width={1120} height={560} fill="#fff" />
          <path
            d={ARROW_LINE}
            fill="none"
            stroke="#000"
            strokeWidth={ARROW_STROKE + ARROW_GAP * 2}
            strokeLinejoin="miter"
            strokeMiterlimit={8}
          />
          <path d={ARROW_HEAD} fill="#000" stroke="#000" strokeWidth={ARROW_GAP * 2} strokeLinejoin="miter" />
        </mask>
        )}
        <clipPath id={clipAbove}>
          <path d={REGION_ABOVE} />
        </clipPath>
        <clipPath id={clipBelow}>
          <path d={REGION_BELOW} />
        </clipPath>
        <clipPath id={clipBase}>
          <rect x={-40} y={-80} width={1120} height={LOGO_BASELINE + 80} />
        </clipPath>
        <clipPath id={clipS}>
          <rect x={700} y={-80} width={380} height={LOGO_BASELINE + 86} />
        </clipPath>
      </defs>

      <g mask={gapColor ? undefined : `url(#${gapMask})`}>
        <g clipPath={`url(#${clipBase})`}>
          <path {...part("e")} d={PATH_E} fill={palette.letters} />
        </g>
        <g clipPath={`url(#${clipAbove})`}>
          <path {...part("m")} d={PATH_M} fill={palette.letters} fillRule="evenodd" />
        </g>
        <g clipPath={`url(#${clipBelow})`}>
          {BAR_RECTS.map((b, i) => (
            <rect
              key={b.x}
              {...part(`bar${i + 1}`)}
              x={b.x}
              y={0}
              width={b.w}
              height={LOGO_BASELINE}
              fill={palette.bars}
            />
          ))}
        </g>
      </g>

      {gapColor && (
        <g clipPath={`url(#${clipBase})`}>
          <path
            d={ARROW_LINE}
            fill="none"
            stroke={gapColor}
            strokeWidth={ARROW_STROKE + ARROW_GAP * 2}
            strokeLinejoin="miter"
            strokeMiterlimit={8}
          />
          <path d={ARROW_HEAD} fill={gapColor} stroke={gapColor} strokeWidth={ARROW_GAP * 2} />
        </g>
      )}

      <g clipPath={`url(#${clipBase})`}>
        <path
          {...part("arrow")}
          d={ARROW_LINE}
          fill="none"
          stroke={palette.arrow}
          strokeWidth={ARROW_STROKE}
          strokeLinejoin="miter"
          strokeMiterlimit={8}
        />
      </g>
      <path {...part("head")} d={ARROW_HEAD} fill={palette.arrow} />
      <g clipPath={`url(#${clipS})`}>
        <path {...part("s")} d={PATH_S} fill={palette.letters} />
      </g>
    </g>
  );
}
