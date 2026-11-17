import { EmsMonogram, MONOGRAM_COLOR, type MonogramPalette } from "./EmsMonogram";
import { LOGO_BOX } from "./logoGeometry";

type Variant = "color" | "inverse";

const PALETTES: Record<Variant, { mono: MonogramPalette; descriptor: string }> = {
  color: { mono: MONOGRAM_COLOR, descriptor: "#64748B" },
  inverse: { mono: { letters: "#FFFFFF", bars: "#AEB4BE", arrow: "#F47C28" }, descriptor: "#CBD5E1" },
};

type Props = {
  variant?: Variant;
  /** Exibe o descritor "LOGÍSTICA" sob o monograma. */
  descriptor?: boolean;
  className?: string;
  title?: string;
  /**
   * Monta o monograma peça a peça uma única vez (ao carregar a página) e
   * congela no quadro final. Ver `.logo-build` em globals.css.
   */
  build?: boolean;
};

/**
 * Assinatura EMS Logística: monograma vetorial + descritor.
 * Observação: a assinatura oficial da EMS Logística deve ser validada com a
 * empresa. O descritor aqui é configurável.
 */
export function EmsLogo({ variant = "color", descriptor = true, className, title = "EMS Logística", build = false }: Props) {
  const p = PALETTES[variant];
  const h = descriptor ? LOGO_BOX.h + 120 : LOGO_BOX.h;
  return (
    <svg
      viewBox={`${LOGO_BOX.x} ${LOGO_BOX.y} ${LOGO_BOX.w} ${h}`}
      className={build ? `logo-build ${className ?? ""}` : className}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <EmsMonogram palette={p.mono} animPrefix={build ? "lb" : undefined} />
      {descriptor && (
        <text
          x={511 + 22 /* compensa o espaçamento após a última letra */}
          y={LOGO_BOX.y + LOGO_BOX.h + 100}
          textAnchor="middle"
          fill={p.descriptor}
          fontFamily="var(--font-manrope), system-ui, sans-serif"
          fontWeight={700}
          fontSize={92}
          letterSpacing={44}
        >
          LOGÍSTICA
        </text>
      )}
    </svg>
  );
}
