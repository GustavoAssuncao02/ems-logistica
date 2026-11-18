"use client";

import { useEffect, useId, useRef } from "react";
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
} from "@/components/brand/logoGeometry";
import { clamp } from "./geometry";
import { bindScrollProgress } from "./scrollProgress";

/* ------------------------------------------------------------------ */
/* Geometria da seta (linha poligonal do logo)                          */
/* ------------------------------------------------------------------ */

const ARROW_PTS = (() => {
  const n = (ARROW_LINE.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  const pts: [number, number][] = [];
  for (let i = 0; i + 1 < n.length; i += 2) pts.push([n[i], n[i + 1]]);
  return pts;
})();
const ARROW_SEGS = ARROW_PTS.slice(1).map(([x, y], i) => Math.hypot(x - ARROW_PTS[i][0], y - ARROW_PTS[i][1]));
const ARROW_LEN = ARROW_SEGS.reduce((a, b) => a + b, 0);
/** Junção entre a linha e a ponta: origem da "explosão" da ponta. */
const JOINT = ARROW_PTS[ARROW_PTS.length - 1];

function arrowPointAt(d: number) {
  let left = d;
  for (let i = 0; i < ARROW_SEGS.length; i++) {
    if (left <= ARROW_SEGS[i] || i === ARROW_SEGS.length - 1) {
      const t = clamp(left / ARROW_SEGS[i]);
      const [ax, ay] = ARROW_PTS[i];
      const [bx, by] = ARROW_PTS[i + 1];
      return [ax + (bx - ax) * t, ay + (by - ay) * t] as const;
    }
    left -= ARROW_SEGS[i];
  }
  return JOINT;
}

/* ------------------------------------------------------------------ */
/* Roteiro (progresso 0..1 da rolagem)                                  */
/* ------------------------------------------------------------------ */

const T = {
  draw: [0.03, 0.46],
  head: [0.43, 0.52],
  burst: [0.46, 0.62],
  e: [0.52, 0.68],
  s: [0.57, 0.73],
  bars: [0.6, 0.76],
  m: [0.67, 0.83],
  desc: [0.8, 0.96],
} as const;

const span = (p: number, [a, b]: readonly [number, number]) => clamp((p - a) / (b - a));
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const backOut = (t: number) => {
  const c = 2.2;
  return t <= 0 ? 0 : 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2;
};

const C = {
  letters: "#FFFFFF",
  bars: "#AEB4BE",
  arrow: "#F47C28",
  hot: "#FFE3C2",
  desc: "#CBD5E1",
};

const DESC_Y = LOGO_BOX.y + LOGO_BOX.h + 100;
/** Área do SVG (com folga para o brilho da seta). */
const VB = { x: -70, y: -70, w: 1160, h: 690 };

/**
 * Painel da marca na seção "A EMS": conforme a seção entra na tela, a seta
 * laranja é desenhada (com um ponto luminoso na ponta do traço), a ponta
 * surge e só então o E, o m com as barras e o S emergem da linha de base,
 * seguidos do descritor. A rolagem conduz a animação nos dois sentidos.
 */
export function BrandReveal({ className = "" }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (s: string) => `br-${s}-${uid}`;

  const root = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLDivElement>(null);
  const glow = useRef<SVGPathElement>(null);
  const core = useRef<SVGPathElement>(null);
  const hot = useRef<SVGPathElement>(null);
  const spark = useRef<SVGGElement>(null);
  const head = useRef<SVGPathElement>(null);
  const ring = useRef<SVGCircleElement>(null);
  const horizon = useRef<SVGPathElement>(null);
  const e = useRef<SVGPathElement>(null);
  const m = useRef<SVGPathElement>(null);
  const s = useRef<SVGPathElement>(null);
  const bars = useRef<(SVGRectElement | null)[]>([]);
  const desc = useRef<SVGTextElement>(null);
  const descWipe = useRef<SVGRectElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const render = (p: number) => {
      const d = easeInOut(span(p, T.draw));
      const drawn = d * ARROW_LEN;
      const offset = String(ARROW_LEN - drawn);
      for (const path of [glow.current, core.current, hot.current]) path?.setAttribute("stroke-dashoffset", offset);

      // brilho: forte enquanto desenha, assenta depois
      glow.current?.setAttribute("opacity", String(d > 0 ? 0.9 - 0.55 * span(p, [0.5, 0.85]) : 0));
      hot.current?.setAttribute("opacity", String(d > 0 ? 1 - span(p, [0.47, 0.6]) : 0));

      // ponto luminoso que puxa o traço
      const sp = spark.current;
      if (sp) {
        const fade = d <= 0 ? 0 : Math.min(1, d * 12) * (1 - span(p, [0.45, 0.52]));
        const [x, y] = arrowPointAt(drawn);
        sp.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
        sp.setAttribute("opacity", fade.toFixed(3));
      }

      const h = backOut(span(p, T.head));
      head.current?.setAttribute("transform", `translate(${JOINT[0]} ${JOINT[1]}) scale(${h.toFixed(4)}) translate(${-JOINT[0]} ${-JOINT[1]})`);
      head.current?.setAttribute("opacity", h > 0 ? "1" : "0");

      const b = span(p, T.burst);
      ring.current?.setAttribute("r", String(30 + 190 * easeOut(b)));
      ring.current?.setAttribute("opacity", String(b > 0 && b < 1 ? (1 - b) * 0.9 : 0));

      // linha do horizonte de onde as letras emergem
      horizon.current?.setAttribute("opacity", String(0.7 * span(p, [0.02, 0.2]) * (1 - span(p, [0.76, 0.92]))));

      const ke = easeOut(span(p, T.e));
      e.current?.setAttribute("transform", `translate(0 ${(LOGO_BASELINE * (1 - ke)).toFixed(1)})`);
      const ks = easeOut(span(p, T.s));
      s.current?.setAttribute("transform", `translate(0 ${(400 * (1 - ks)).toFixed(1)})`);
      bars.current.forEach((bar, i) => {
        const kb = easeOut(span(p - i * 0.03, T.bars));
        bar?.setAttribute("transform", `translate(0 ${LOGO_BASELINE}) scale(1 ${kb.toFixed(4)}) translate(0 ${-LOGO_BASELINE})`);
      });
      const km = easeOut(span(p, T.m));
      m.current?.setAttribute("transform", `translate(0 ${(150 * (1 - km)).toFixed(1)})`);
      m.current?.setAttribute("opacity", km.toFixed(3));

      const kd = easeOut(span(p, T.desc));
      descWipe.current?.setAttribute("width", String(LOGO_BOX.w * kd));
      desc.current?.setAttribute("opacity", kd.toFixed(3));

      if (halo.current) halo.current.style.opacity = (0.15 + 0.85 * d).toFixed(3);
    };

    // guiado pelo centro do painel: a seta só começa quando o logo já está na tela
    const measure = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = r.top + r.height / 2;
      const start = vh * 0.95;
      const end = vh * 0.4;
      return (start - center) / (start - end);
    };

    return bindScrollProgress({ measure, render, reduced: 1, response: 3.5, observe: [el] });
  }, []);

  const arrowStroke = {
    d: ARROW_LINE,
    fill: "none",
    strokeLinejoin: "miter" as const,
    strokeMiterlimit: 8,
    strokeDasharray: `${ARROW_LEN} ${ARROW_LEN + 40}`,
    strokeDashoffset: 0,
  };

  return (
    <div
      ref={root}
      role="img"
      aria-label="EMS Logística"
      className={`relative isolate overflow-hidden bg-[linear-gradient(160deg,#1a3670_0%,#10244c_46%,#0a1733_100%)] ${className}`}
    >
      {/* malha de mapa que se dissolve nas bordas */}
      <svg
        aria-hidden="true"
        focusable="false"
        className="absolute inset-0 h-full w-full [mask-image:radial-gradient(closest-side,#000_35%,transparent_100%)]"
      >
        <defs>
          <pattern id={id("grid")} width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0V28" fill="none" stroke="#ffffff" strokeOpacity="0.07" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id("grid")})`} />
      </svg>
      {/* luz fria de cima e calor laranja que cresce com a seta */}
      <div aria-hidden="true" className="absolute -left-1/4 -top-1/3 h-[80%] w-[90%] rounded-full bg-[radial-gradient(closest-side,rgba(110,150,235,0.28),transparent)]" />
      <div
        ref={halo}
        aria-hidden="true"
        className="absolute left-1/2 top-[48%] h-[75%] w-[115%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(244,124,40,0.24),rgba(244,124,40,0.07)_55%,transparent)]"
      />
      <div aria-hidden="true" className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10" />

      <svg
        viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
        aria-hidden="true"
        focusable="false"
        className="absolute left-1/2 top-1/2 w-[86%] -translate-x-1/2 -translate-y-1/2 overflow-visible"
      >
        <defs>
          <mask id={id("gap")} maskUnits="userSpaceOnUse" x={-40} y={-80} width={1120} height={560}>
            <rect x={-40} y={-80} width={1120} height={560} fill="#fff" />
            <path d={ARROW_LINE} fill="none" stroke="#000" strokeWidth={ARROW_STROKE + ARROW_GAP * 2} strokeLinejoin="miter" strokeMiterlimit={8} />
            <path d={ARROW_HEAD} fill="#000" stroke="#000" strokeWidth={ARROW_GAP * 2} strokeLinejoin="miter" />
          </mask>
          <clipPath id={id("above")}>
            <path d={REGION_ABOVE} />
          </clipPath>
          <clipPath id={id("below")}>
            <path d={REGION_BELOW} />
          </clipPath>
          <clipPath id={id("base")}>
            <rect x={-200} y={-200} width={1500} height={LOGO_BASELINE + 200} />
          </clipPath>
          <clipPath id={id("s")}>
            <rect x={700} y={-80} width={380} height={LOGO_BASELINE + 86} />
          </clipPath>
          <clipPath id={id("desc")}>
            <rect ref={descWipe} x={LOGO_BOX.x} y={LOGO_BASELINE} width={LOGO_BOX.w} height={160} />
          </clipPath>
          <filter id={id("blur")} filterUnits="userSpaceOnUse" x={VB.x - 100} y={VB.y - 100} width={VB.w + 200} height={VB.h + 200}>
            <feGaussianBlur stdDeviation="16" />
          </filter>
          <radialGradient id={id("spark")}>
            <stop offset="0" stopColor="#ffd2a3" stopOpacity="0.95" />
            <stop offset="0.35" stopColor="#f47c28" stopOpacity="0.55" />
            <stop offset="1" stopColor="#f47c28" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={id("horizon")} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path ref={horizon} d={`M-60 ${LOGO_BASELINE + 0.5}H1080`} stroke={`url(#${id("horizon")})`} strokeWidth="2.5" opacity={0} />

        {/* letras (com o vão em volta da seta) */}
        <g mask={`url(#${id("gap")})`}>
          <g clipPath={`url(#${id("base")})`}>
            <path ref={e} d={PATH_E} fill={C.letters} />
          </g>
          <g clipPath={`url(#${id("above")})`}>
            <g clipPath={`url(#${id("base")})`}>
              <path ref={m} d={PATH_M} fill={C.letters} fillRule="evenodd" />
            </g>
          </g>
          <g clipPath={`url(#${id("below")})`}>
            {BAR_RECTS.map((bar, i) => (
              <rect
                key={bar.x}
                ref={(node) => {
                  bars.current[i] = node;
                }}
                x={bar.x}
                y={0}
                width={bar.w}
                height={LOGO_BASELINE}
                fill={C.bars}
              />
            ))}
          </g>
        </g>
        <g clipPath={`url(#${id("s")})`}>
          <path ref={s} d={PATH_S} fill={C.letters} />
        </g>

        {/* seta: brilho difuso, traço e núcleo incandescente */}
        <g clipPath={`url(#${id("base")})`}>
          <path ref={glow} {...arrowStroke} stroke={C.arrow} strokeWidth={ARROW_STROKE + 30} filter={`url(#${id("blur")})`} opacity={0.35} />
          <path ref={core} {...arrowStroke} stroke={C.arrow} strokeWidth={ARROW_STROKE} />
          <path ref={hot} {...arrowStroke} stroke={C.hot} strokeWidth={9} strokeLinecap="round" opacity={0} />
          <g ref={spark} opacity={0} transform={`translate(${JOINT[0]} ${JOINT[1]})`}>
            <circle r={90} fill={`url(#${id("spark")})`} />
            <circle r={16} fill="#fff6ea" />
          </g>
        </g>
        <circle ref={ring} cx={JOINT[0] + 18} cy={JOINT[1] - 18} r={30} fill="none" stroke="#ffb46e" strokeWidth={5} opacity={0} />
        <path ref={head} d={ARROW_HEAD} fill={C.arrow} />

        <g clipPath={`url(#${id("desc")})`}>
          <text
            ref={desc}
            x={511 + 22}
            y={DESC_Y}
            textAnchor="middle"
            fill={C.desc}
            fontFamily="var(--font-manrope), system-ui, sans-serif"
            fontWeight={700}
            fontSize={92}
            letterSpacing={44}
          >
            LOGÍSTICA
          </text>
        </g>
      </svg>
    </div>
  );
}
