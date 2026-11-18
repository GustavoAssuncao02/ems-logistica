"use client";

import { useEffect, useRef } from "react";
import { clamp, lerp, n1, pathOf, smoothstep, type Pt } from "./geometry";
import { bindScrollProgress } from "./scrollProgress";

/**
 * Traseira de um baú com a porta-rampa fechada. Conforme a página rola, a
 * porta tomba em direção a quem olha (perspectiva real, calculada em 3D),
 * as luzes internas acendem e os três cartões das soluções se iluminam.
 * Com movimento reduzido, aparece já aberta.
 */

const VB_W = 720;
const VB_H = 900;

/* abertura do baú (plano da traseira) */
const OX0 = 122;
const OX1 = 598;
const OY0 = 78;
const OY1 = 640;

/* porta: dobradiça embaixo, espessura para dentro */
const DOOR_X0 = 119;
const DOOR_X1 = 601;
const HINGE_Y = OY1 + 16;
const DOOR_H = HINGE_Y - OY0;
const DOOR_T = 16;

/* câmera da porta (olho acima do piso: ao abrir, vê-se o lado de cima da rampa) */
const EYE = { x: 360, y: 150, f: 2350 };
/* ponto de fuga do interior */
const VP = { x: 360, y: 330 };
const BACK = 0.56;

const proj = (X: number, Y: number, Z: number): Pt => {
  const k = EYE.f / (EYE.f - Z);
  return { x: EYE.x + (X - EYE.x) * k, y: EYE.y + (Y - EYE.y) * k };
};

/** Ponto da porta: u (0..1, esquerda→direita), v (0..1, dobradiça→ponta), o (0 = face externa … −T = face interna). */
function doorPt(th: number, u: number, v: number, o: number) {
  const c = Math.cos(th);
  const s = Math.sin(th);
  return proj(lerp(DOOR_X0, DOOR_X1, u), HINGE_Y - v * DOOR_H * c + o * s, v * DOOR_H * s + o * c);
}

const area = (pts: Pt[]) => pts.reduce((a, p, i) => a + p.x * pts[(i + 1) % pts.length].y - pts[(i + 1) % pts.length].x * p.y, 0);
const quad = (th: number, o: number, u0: number, u1: number, v0: number, v1: number) =>
  pathOf([doorPt(th, u0, v0, o), doorPt(th, u1, v0, o), doorPt(th, u1, v1, o), doorPt(th, u0, v1, o)], true);
const line = (a: Pt, b: Pt) => `M${n1(a.x)} ${n1(a.y)}L${n1(b.x)} ${n1(b.y)}`;
const cu = (u: number) => clamp(u);

/** Ângulo da porta: acos(1 − p) faz a borda de cima descer em ritmo quase constante. */
const angleOf = (p: number) => Math.acos(1 - clamp(p));

function doorGeometry(p: number) {
  const th = angleOf(p);
  const T = -DOOR_T;
  const outerPts = [doorPt(th, 0, 0, 0), doorPt(th, 1, 0, 0), doorPt(th, 1, 1, 0), doorPt(th, 0, 1, 0)];
  const innerPts = [doorPt(th, 0, 0, T), doorPt(th, 1, 0, T), doorPt(th, 1, 1, T), doorPt(th, 0, 1, T)];
  const endPts = [doorPt(th, 0, 1, 0), doorPt(th, 1, 1, 0), doorPt(th, 1, 1, T), doorPt(th, 0, 1, T)];

  // face externa: nervuras horizontais, puxador e faixa refletiva no topo
  let ribs = "";
  let ribsHi = "";
  for (let v = 0.08; v < 0.9; v += 0.08) {
    ribs += line(doorPt(th, 0.03, v, 0), doorPt(th, 0.97, v, 0));
    ribsHi += line(doorPt(th, 0.03, v - 0.006, 0), doorPt(th, 0.97, v - 0.006, 0));
  }
  let outerStripes = "";
  for (let i = -1; i < 22; i++) {
    const u = i * 0.05;
    outerStripes += pathOf(
      [doorPt(th, cu(u), 0.955, 0), doorPt(th, cu(u + 0.025), 0.955, 0), doorPt(th, cu(u + 0.037), 0.995, 0), doorPt(th, cu(u + 0.012), 0.995, 0)],
      true,
    );
  }

  // face interna (piso da rampa): chapas, trilhos laterais e reflexo das luzes
  let seams = "";
  for (const v of [0.25, 0.5, 0.75]) seams += line(doorPt(th, 0.03, v, T), doorPt(th, 0.97, v, T));
  for (const u of [1 / 3, 2 / 3]) seams += line(doorPt(th, u, 0, T), doorPt(th, u, 0.97, T));

  // ponta da rampa: faixa zebrada vermelha e branca
  let endStripes = "";
  for (let i = -1; i < 26; i++) {
    const u = i * 0.042;
    endStripes += pathOf([doorPt(th, cu(u), 1, 0), doorPt(th, cu(u + 0.021), 1, 0), doorPt(th, cu(u + 0.031), 1, T), doorPt(th, cu(u + 0.01), 1, T)], true);
  }

  return {
    showOuter: area(outerPts) < 0,
    showInner: area(innerPts) > 0,
    showEnd: area(endPts) < 0,
    shade: 0.5 * (1 - Math.cos(th)),
    outer: pathOf(outerPts, true),
    ribs,
    ribsHi,
    handle: quad(th, 0, 0.42, 0.58, 0.47, 0.505),
    outerBand: quad(th, 0, 0, 1, 0.955, 0.995),
    outerStripes,
    inner: pathOf(innerPts, true),
    seams,
    rails: quad(th, T, 0, 0.03, 0, 1) + quad(th, T, 0.97, 1, 0, 1),
    streaks: quad(th, T, 0.27, 0.33, 0, 1) + quad(th, T, 0.67, 0.73, 0, 1),
    end: pathOf(endPts, true),
    endStripes,
  };
}

type DoorGeo = ReturnType<typeof doorGeometry>;

/* ------------------------------------------------------------------ */
/* Interior (estático)                                                  */
/* ------------------------------------------------------------------ */

const toBack = (x: number, y: number, s = BACK): Pt => ({ x: VP.x + (x - VP.x) * s, y: VP.y + (y - VP.y) * s });
const B = { tl: toBack(OX0, OY0), tr: toBack(OX1, OY0), br: toBack(OX1, OY1), bl: toBack(OX0, OY1) };
const DEPTHS = Array.from({ length: 9 }, (_, i) => 1 / (1 + 0.0786 * (i + 1)));

const INTERIOR = {
  ceiling: pathOf([{ x: OX0, y: OY0 }, { x: OX1, y: OY0 }, B.tr, B.tl], true),
  left: pathOf([{ x: OX0, y: OY0 }, B.tl, B.bl, { x: OX0, y: OY1 }], true),
  right: pathOf([{ x: OX1, y: OY0 }, B.tr, B.br, { x: OX1, y: OY1 }], true),
  floor: pathOf([{ x: OX0, y: OY1 }, { x: OX1, y: OY1 }, B.br, B.bl], true),
  back: pathOf([B.tl, B.tr, B.br, B.bl], true),
  wallRibs: DEPTHS.map((s) => line(toBack(OX0, OY0, s), toBack(OX0, OY1, s)) + line(toBack(OX1, OY0, s), toBack(OX1, OY1, s))).join(""),
  ceilRibs: DEPTHS.map((s) => line(toBack(OX0, OY0, s), toBack(OX1, OY0, s))).join(""),
  floorLines: [1, 2, 3, 4, 5].map((i) => line({ x: OX0 + (i * (OX1 - OX0)) / 6, y: OY1 }, toBack(OX0 + (i * (OX1 - OX0)) / 6, OY1))).join(""),
  leds: [200, 520].map((x) => line(toBack(x, OY0, 0.965), toBack(x, OY0, 0.63))),
  floorGlow: [
    [206, 236],
    [484, 514],
  ]
    .map(([a, b]) => pathOf([{ x: a, y: OY1 }, { x: b, y: OY1 }, toBack(b, OY1), toBack(a, OY1)], true))
    .join(""),
};

const CARDS = [
  { y: 196, label: ["Logística"], icon: "boxes" },
  { y: 314, label: ["Fretes"], icon: "truck" },
  { y: 432, label: ["Transporte", "rodoviário"], icon: "pin" },
] as const;
const CARD_X = 168;
const CARD_W = 384;
const CARD_H = 104;

export function TrailerScene({ className = "" }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const lightsRef = useRef<SVGGElement>(null);
  const cardRefs = useRef<(SVGGElement | null)[]>([]);
  const glowRefs = useRef<(SVGRectElement | null)[]>([]);
  const doorRefs = useRef<Record<string, SVGElement | null>>({});

  useEffect(() => {
    const svg = svgRef.current;
    const lights = lightsRef.current;
    if (!svg || !lights) return;
    const d = doorRefs.current;

    const setPath = (k: keyof DoorGeo, geo: DoorGeo) => d[k]?.setAttribute("d", String(geo[k]));
    const show = (k: string, on: boolean) => d[k]?.setAttribute("display", on ? "inline" : "none");

    // começa quando o topo do baú entra na tela; termina com o baú inteiro à vista
    // (centro dele a 58% da altura da janela)
    const measure = () => {
      const r = svg.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.92;
      const end = Math.min(start - 200, vh * 0.58 - r.height / 2);
      return (start - r.top) / (start - end);
    };

    const render = (p: number) => {
      const g = doorGeometry(p);
      show("outerG", g.showOuter);
      show("innerG", g.showInner);
      show("endG", g.showEnd);
      if (g.showOuter) {
        (["outer", "ribs", "ribsHi", "handle", "outerBand", "outerStripes"] as const).forEach((k) => setPath(k, g));
        d.shade?.setAttribute("d", g.outer);
        d.shade?.setAttribute("opacity", g.shade.toFixed(3));
      }
      if (g.showInner) (["inner", "seams", "rails", "streaks"] as const).forEach((k) => setPath(k, g));
      if (g.showEnd) (["end", "endStripes"] as const).forEach((k) => setPath(k, g));

      const light = smoothstep(0.08, 0.5, p);
      lights.setAttribute("opacity", light.toFixed(3));
      d.streaks?.setAttribute("opacity", (0.85 * light).toFixed(3));
      CARDS.forEach((_, i) => {
        const c = smoothstep(0.3 + i * 0.12, 0.62 + i * 0.12, p);
        cardRefs.current[i]?.setAttribute("opacity", (0.38 + 0.62 * c).toFixed(3));
        glowRefs.current[i]?.setAttribute("opacity", c.toFixed(3));
      });
    };

    return bindScrollProgress({ measure, render, reduced: 1, response: 10 });
  }, []);

  const g0 = doorGeometry(0);
  const ref = (k: string) => (el: SVGElement | null) => {
    doorRefs.current[k] = el;
  };

  return (
    <svg ref={svgRef} viewBox={`0 0 ${VB_W} ${VB_H}`} className={`aspect-[4/5] h-auto ${className}`} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="tr-frame" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#aeb7c4" />
          <stop offset="0.1" stopColor="#eef1f5" />
          <stop offset="0.5" stopColor="#dde2e9" />
          <stop offset="0.9" stopColor="#eef1f5" />
          <stop offset="1" stopColor="#a9b2bf" />
        </linearGradient>
        <linearGradient id="tr-wall-l" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1f2941" />
          <stop offset="1" stopColor="#0e1525" />
        </linearGradient>
        <linearGradient id="tr-wall-r" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#1f2941" />
          <stop offset="1" stopColor="#0e1525" />
        </linearGradient>
        <linearGradient id="tr-floor" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#3a4355" />
          <stop offset="1" stopColor="#161c2a" />
        </linearGradient>
        <linearGradient id="tr-door" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c3cad5" />
          <stop offset="0.5" stopColor="#f4f6f9" />
          <stop offset="1" stopColor="#bec6d1" />
        </linearGradient>
        <linearGradient id="tr-ramp" x1="0" y1={OY1} x2="0" y2="830" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8f9aab" />
          <stop offset="1" stopColor="#e2e7ee" />
        </linearGradient>
        <linearGradient id="tr-streak" x1="0" y1={OY1} x2="0" y2="830" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffb066" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffb066" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="tr-card" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e2840" />
          <stop offset="1" stopColor="#111827" />
        </linearGradient>
        <radialGradient id="tr-glow-in" cx="360" cy="300" r="320" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f47c28" stopOpacity="0.32" />
          <stop offset="1" stopColor="#f47c28" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="tr-red">
          <stop offset="0" stopColor="#ff3b30" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ff3b30" stopOpacity="0" />
        </radialGradient>
        <filter id="tr-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id="tr-blur-l" x="-30%" y="-100%" width="160%" height="300%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>

      {/* sombra no chão */}
      <ellipse cx="360" cy="842" rx="340" ry="26" fill="#0b1a38" opacity="0.22" filter="url(#tr-blur-l)" />

      {/* chassi, pneus e para-choque */}
      <rect x="96" y="672" width="78" height="118" rx="14" fill="#10141c" />
      <rect x="546" y="672" width="78" height="118" rx="14" fill="#10141c" />
      <path d="M104 700H166M104 724H166M104 748H166M554 700H616M554 724H616M554 748H616" stroke="#232a37" strokeWidth="5" />
      <rect x="90" y="656" width="540" height="56" fill="#1a202c" />
      <rect x="150" y="716" width="420" height="18" rx="4" fill="#2b3242" />

      {/* moldura traseira do baú */}
      <rect x="80" y="24" width="560" height="640" rx="6" fill="url(#tr-frame)" />
      <rect x="80" y="24" width="560" height="10" rx="4" fill="#f5f7fa" />
      <rect x="80" y="70" width="560" height="8" fill="#8d97a6" />
      <path d={`M${OX0 - 1} ${OY0}V${OY1}M${OX1 + 1} ${OY0}V${OY1}`} stroke="#8f99a8" strokeWidth="2" />

      {/* interior */}
      <path d={INTERIOR.ceiling} fill="#151d30" />
      <path d={INTERIOR.left} fill="url(#tr-wall-l)" />
      <path d={INTERIOR.right} fill="url(#tr-wall-r)" />
      <path d={INTERIOR.floor} fill="url(#tr-floor)" />
      <path d={INTERIOR.back} fill="#0b111e" />
      <path d={INTERIOR.wallRibs + INTERIOR.ceilRibs} stroke="#2a3651" strokeWidth="2.5" />
      <path d={INTERIOR.floorLines} stroke="#4b5568" strokeWidth="1.5" opacity="0.7" />
      {INTERIOR.leds.map((d) => (
        <path key={d} d={d} stroke="#4a5163" strokeWidth="7" strokeLinecap="round" />
      ))}

      {/* luzes internas (acendem com a abertura) */}
      <g ref={lightsRef} opacity="0">
        <rect x={OX0} y={OY0} width={OX1 - OX0} height={OY1 - OY0} fill="url(#tr-glow-in)" />
        {INTERIOR.leds.map((d) => (
          <g key={d}>
            <path d={d} stroke="#f47c28" strokeWidth="22" strokeLinecap="round" opacity="0.55" filter="url(#tr-blur)" />
            <path d={d} stroke="#fff3df" strokeWidth="7" strokeLinecap="round" />
          </g>
        ))}
        <path d={INTERIOR.floorGlow} fill="#ffad5c" opacity="0.4" filter="url(#tr-blur)" />
      </g>

      {/* cartões das soluções */}
      {CARDS.map((c, i) => (
        <g
          key={c.y}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          opacity="0.38"
        >
          <rect
            ref={(el) => {
              glowRefs.current[i] = el;
            }}
            x={CARD_X}
            y={c.y}
            width={CARD_W}
            height={CARD_H}
            rx="22"
            fill="none"
            stroke="#f47c28"
            strokeWidth="10"
            opacity="0"
            filter="url(#tr-blur)"
          />
          <rect x={CARD_X} y={c.y} width={CARD_W} height={CARD_H} rx="22" fill="url(#tr-card)" stroke="#f47c28" strokeWidth="2" />
          <rect x={CARD_X + 16} y={c.y + 16} width="78" height="72" rx="16" fill="#0c1220" opacity="0.85" />
          <g transform={`translate(${CARD_X + 31} ${c.y + 28})`} fill="none" stroke="#f47c28" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <CardIcon kind={c.icon} />
          </g>
          <line x1={CARD_X + 114} y1={c.y + 26} x2={CARD_X + 114} y2={c.y + 78} stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
          <text className="font-display" fill="#ffffff" fontWeight="700" fontSize={c.label.length > 1 ? 26 : 30} x={CARD_X + 136}>
            {c.label.map((t, j) => (
              <tspan key={t} x={CARD_X + 136} y={c.label.length > 1 ? c.y + 46 + j * 30 : c.y + 62}>
                {t}
              </tspan>
            ))}
          </text>
        </g>
      ))}

      {/* topo: lanternas delimitadoras */}
      <g>
        {[
          [98, 40, 50, 10],
          [572, 40, 50, 10],
          [324, 38, 16, 14],
          [352, 38, 16, 14],
          [380, 38, 16, 14],
        ].map(([x, y, w, h]) => (
          <g key={x}>
            <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2 + 14} ry={h / 2 + 12} fill="url(#tr-red)" />
            <rect x={x} y={y} width={w} height={h} rx="3" fill="#ff3b30" stroke="#7a1a16" strokeWidth="1.5" />
          </g>
        ))}
      </g>

      {/* refletivos e dobradiças nas colunas */}
      {[OX0 - 34, OX1 + 28].map((x) => (
        <g key={x}>
          <rect x={x} y="96" width="6" height="40" rx="2" fill="#e5322b" />
          <rect x={x} y="560" width="6" height="40" rx="2" fill="#e5322b" />
        </g>
      ))}
      {[110, 330, 540].map((y) => (
        <g key={y}>
          <rect x="64" y={y} width="20" height="42" rx="4" fill="#a3acb9" stroke="#7d8796" strokeWidth="1.5" />
          <rect x="636" y={y} width="20" height="42" rx="4" fill="#a3acb9" stroke="#7d8796" strokeWidth="1.5" />
          <path d={`M74 ${y + 6}V${y + 36}M646 ${y + 6}V${y + 36}`} stroke="#6c7684" strokeWidth="2" />
        </g>
      ))}

      {/* lanternas traseiras */}
      {[54, 622].map((x) => (
        <g key={x}>
          <ellipse cx={x + 22} cy="600" rx="40" ry="46" fill="url(#tr-red)" />
          <rect x={x} y="566" width="44" height="110" rx="10" fill="#151a24" />
          <rect x={x + 7} y="574" width="30" height="36" rx="5" fill="#ff2d2d" />
          <rect x={x + 7} y="616" width="30" height="22" rx="5" fill="#ff8a1f" />
          <rect x={x + 7} y="644" width="30" height="24" rx="5" fill="#c81e1e" />
        </g>
      ))}

      {/* porta-rampa */}
      <g ref={ref("innerG")} display={g0.showInner ? "inline" : "none"}>
        <path ref={ref("inner")} d={g0.inner} fill="url(#tr-ramp)" />
        <path ref={ref("rails")} d={g0.rails} fill="#6c7688" />
        <path ref={ref("seams")} d={g0.seams} stroke="#76818f" strokeWidth="1.6" opacity="0.8" />
        <path ref={ref("streaks")} d={g0.streaks} fill="url(#tr-streak)" opacity="0" />
      </g>
      <g ref={ref("endG")} display={g0.showEnd ? "inline" : "none"}>
        <path ref={ref("end")} d={g0.end} fill="#f4f5f7" />
        <path ref={ref("endStripes")} d={g0.endStripes} fill="#e3262d" />
      </g>
      <g ref={ref("outerG")} display={g0.showOuter ? "inline" : "none"}>
        <path ref={ref("outer")} d={g0.outer} fill="url(#tr-door)" stroke="#9aa4b2" strokeWidth="1.5" />
        <path ref={ref("ribsHi")} d={g0.ribsHi} stroke="#ffffff" strokeWidth="1.6" opacity="0.8" />
        <path ref={ref("ribs")} d={g0.ribs} stroke="#a6afbc" strokeWidth="2" />
        <path ref={ref("handle")} d={g0.handle} fill="#3a4356" />
        <path ref={ref("outerBand")} d={g0.outerBand} fill="#f4f5f7" />
        <path ref={ref("outerStripes")} d={g0.outerStripes} fill="#e3262d" />
        <path ref={ref("shade")} d={g0.outer} fill="#0b1a38" opacity="0" />
      </g>
    </svg>
  );
}

function CardIcon({ kind }: { kind: "boxes" | "truck" | "pin" }) {
  if (kind === "boxes") {
    return (
      <g fill="#0c1220">
        <path d={cube(14.5, 22, 11)} />
        <path d={cube(33.5, 22, 11)} />
        <path d={cube(24, 5.5, 11)} />
      </g>
    );
  }
  if (kind === "truck") {
    return (
      <g>
        <path d="M2 16H10M0 23H8M3 30H11" />
        <rect x="14" y="11" width="21" height="21" rx="2" />
        <path d="M35 17H41L47 25V32H35Z" />
        <circle cx="21" cy="34" r="4.5" fill="#0c1220" />
        <circle cx="40" cy="34" r="4.5" fill="#0c1220" />
      </g>
    );
  }
  return (
    <g>
      <path d="M24 46C24 46 10 31 10 20A14 14 0 0 1 38 20C38 31 24 46 24 46Z" />
      <circle cx="24" cy="20" r="5" />
    </g>
  );
}

/** Cubo isométrico (contorno + arestas internas) a partir do vértice de cima. */
function cube(cx: number, cy: number, a: number) {
  const w = a * 0.866;
  const L = { x: cx - w, y: cy + a / 2 };
  const C = { x: cx, y: cy + a };
  const R = { x: cx + w, y: cy + a / 2 };
  return (
    `M${cx} ${cy}L${R.x} ${R.y}L${R.x} ${R.y + a}L${C.x} ${C.y + a}L${L.x} ${L.y + a}L${L.x} ${L.y}Z` +
    `M${L.x} ${L.y}L${C.x} ${C.y}L${R.x} ${R.y}M${C.x} ${C.y}L${C.x} ${C.y + a}`
  );
}
