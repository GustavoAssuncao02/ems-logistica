import {
  ARROW_GAP,
  ARROW_HEAD,
  ARROW_LINE,
  ARROW_STROKE,
  BAR_RECTS,
  LOGO_BASELINE,
  LOGO_BOX,
  PATH_E,
  PATH_M,
  PATH_S,
  REGION_ABOVE,
  REGION_BELOW,
} from "./logoGeometry";

type Palette = { letters: string; bars: string; arrow: string };

/**
 * Monograma EMS como string SVG autônoma — usado em ícones e na imagem de
 * compartilhamento (Open Graph), onde componentes React não estão disponíveis.
 * `pad` adiciona respiro ao redor; `bg` pinta o fundo (opcional).
 */
export function monogramSvg({
  letters = "#162F60",
  bars = "#989DA6",
  arrow = "#F47C28",
  pad = 0,
  bg,
  square = false,
  radius = 0,
}: Partial<Palette> & { pad?: number; bg?: string; square?: boolean; radius?: number } = {}) {
  let { x, y, w, h }: { x: number; y: number; w: number; h: number } = LOGO_BOX;
  // a ponta da seta passa um pouco acima da caixa
  y -= 4;
  h += 4;
  if (square) {
    const side = Math.max(w, h);
    x -= (side - w) / 2;
    y -= (side - h) / 2;
    w = h = side;
  }
  const vb = [x - pad, y - pad, w + pad * 2, h + pad * 2].join(" ");
  const bars_ = BAR_RECTS.map((b) => `<rect x="${b.x}" y="0" width="${b.w}" height="${LOGO_BASELINE}" fill="${bars}"/>`).join("");
  const bgRect = bg
    ? `<rect x="${x - pad}" y="${y - pad}" width="${w + pad * 2}" height="${h + pad * 2}" rx="${radius}" fill="${bg}"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${bgRect}<defs><mask id="g" maskUnits="userSpaceOnUse" x="-40" y="-80" width="1120" height="560"><rect x="-40" y="-80" width="1120" height="560" fill="#fff"/><path d="${ARROW_LINE}" fill="none" stroke="#000" stroke-width="${ARROW_STROKE + ARROW_GAP * 2}" stroke-linejoin="miter" stroke-miterlimit="8"/><path d="${ARROW_HEAD}" fill="#000" stroke="#000" stroke-width="${ARROW_GAP * 2}"/></mask><clipPath id="a"><path d="${REGION_ABOVE}"/></clipPath><clipPath id="b"><path d="${REGION_BELOW}"/></clipPath><clipPath id="c"><rect x="-40" y="-80" width="1120" height="${LOGO_BASELINE + 80}"/></clipPath><clipPath id="s"><rect x="700" y="-80" width="380" height="${LOGO_BASELINE + 86}"/></clipPath></defs><g mask="url(#g)"><g clip-path="url(#c)"><path d="${PATH_E}" fill="${letters}"/></g><g clip-path="url(#a)"><path d="${PATH_M}" fill="${letters}" fill-rule="evenodd"/></g><g clip-path="url(#b)">${bars_}</g></g><g clip-path="url(#c)"><path d="${ARROW_LINE}" fill="none" stroke="${arrow}" stroke-width="${ARROW_STROKE}" stroke-linejoin="miter" stroke-miterlimit="8"/></g><path d="${ARROW_HEAD}" fill="${arrow}"/><g clip-path="url(#s)"><path d="${PATH_S}" fill="${letters}"/></g></svg>`;
}

export const svgDataUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
