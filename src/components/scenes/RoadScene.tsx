"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { CornerSwoosh } from "./CornerSwoosh";
import { clamp } from "./geometry";
import {
  ART_H,
  ART_W,
  MAP,
  MAX_TRUCK_SCALE,
  PIN_A,
  PIN_B,
  ROAD,
  ROUTE_PATH,
  TRUCK_LEN_UNITS,
  trackerTransform,
  truckPose,
  truckTransform,
} from "./roadArt";
import { bindScrollProgress } from "./scrollProgress";
import { TopTruck } from "./TopTruck";
import { createTruckView, lengthFactor, RIG_LENGTH_M, TRUCK_VIEW_M, type TruckView } from "./truck3d";

/** Unidades da arte por metro do modelo 3D. */
const UNITS_PER_M = TRUCK_LEN_UNITS / RIG_LENGTH_M;

/**
 * Cena "Visão de operação": mapa com a rota planejada e a estrada logo abaixo.
 * O palco fica fixo (sticky) enquanto a página rola, e a rolagem conduz a
 * carreta 3D (WebGL) ao longo da estrada; os faróis iluminam o asfalto à
 * frente e as lanternas, o trecho de trás. O marcador da rota acompanha.
 *
 * Em telas estreitas a arte fica maior que o quadro e a "câmera" segue a
 * carreta na horizontal. Com movimento reduzido, não fixa o palco e mostra a
 * carreta parada no meio do caminho. Sem WebGL, usa uma carreta vetorial.
 *
 * `children` é o bloco de texto (renderizado no servidor).
 */
export function RoadScene({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lightsRef = useRef<SVGSVGElement>(null);
  const frontRef = useRef<SVGGElement>(null);
  const backRef = useRef<SVGGElement>(null);
  const fallbackRef = useRef<SVGGElement>(null);
  const dotRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const box = boxRef.current;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const lights = lightsRef.current;
    const front = frontRef.current;
    const back = backRef.current;
    const fallback = fallbackRef.current;
    const dot = dotRef.current;
    if (!track || !stage || !box || !wrap || !canvas || !lights || !front || !back || !fallback || !dot) return;

    let L = { k: 1, boxW: 0, boxH: 0, artW: ART_W, artH: ART_H, stickTop: 0 };
    let view: TruckView | null = null;
    let disposed = false;
    let lastP = 0;
    /** Lado do canvas da carreta (px de CSS), dimensionado para a maior escala. */
    let side = 256;
    const buffer = () => Math.round(clamp(side * Math.min(2, window.devicePixelRatio || 1), 128, 2048));

    const layout = () => {
      const r = box.getBoundingClientRect();
      const k = Math.max(r.width / ART_W, r.height / ART_H) || 1;
      L = { k, boxW: r.width, boxH: r.height, artW: ART_W * k, artH: ART_H * k, stickTop: parseFloat(getComputedStyle(stage).top) || 0 };
      wrap.style.width = `${L.artW}px`;
      wrap.style.height = `${L.artH}px`;
      side = Math.max(64, TRUCK_VIEW_M * UNITS_PER_M * MAX_TRUCK_SCALE * k);
      canvas.style.width = canvas.style.height = `${side}px`;
      view?.resize(buffer());
    };

    // 0 quando o palco está quase todo à vista; 1 quando ele se solta no fim do trilho
    const measure = () => {
      const r = track.getBoundingClientRect();
      const stageH = stage.offsetHeight;
      const start = L.stickTop + stageH * 0.12;
      const end = L.stickTop - (r.height - stageH);
      return (start - r.top) / Math.max(1, start - end);
    };

    const render = (p: number) => {
      lastP = p;
      const pose = truckPose(p);
      const a = (pose.angle * Math.PI) / 180;
      // meio comprimento visto na tela (a câmera inclinada encurta o que aponta "para cima")
      const half = (TRUCK_LEN_UNITS / 2) * pose.scale * lengthFactor(a);
      const dx = Math.cos(a) * half;
      const dy = Math.sin(a) * half;
      const rot = `rotate(${pose.angle.toFixed(2)}) scale(${pose.scale.toFixed(3)})`;
      front.setAttribute("transform", `translate(${(pose.x + dx).toFixed(1)} ${(pose.y + dy).toFixed(1)}) ${rot}`);
      back.setAttribute("transform", `translate(${(pose.x - dx).toFixed(1)} ${(pose.y - dy).toFixed(1)}) ${rot}`);
      fallback.setAttribute("transform", truckTransform(p));
      dot.setAttribute("transform", trackerTransform(p));

      canvas.style.transform = `translate3d(${(pose.x * L.k - side / 2).toFixed(1)}px, ${(pose.y * L.k - side / 2).toFixed(1)}px, 0) scale(${(pose.scale / MAX_TRUCK_SCALE).toFixed(4)})`;
      view?.render(pose.angle);

      const camX = clamp(pose.x * L.k - L.boxW * 0.42, 0, Math.max(0, L.artW - L.boxW));
      const camY = Math.max(0, L.artH - L.boxH) * 0.5;
      wrap.style.transform = `translate3d(${(-camX).toFixed(1)}px, ${(-camY).toFixed(1)}px, 0)`;
    };

    const unbind = bindScrollProgress({ measure, render, layout, reduced: 0.5, observe: [box] });

    // three.js entra depois da primeira pintura, fora do caminho crítico
    const start = () => {
      createTruckView(canvas, buffer())
        .then((v) => {
          if (disposed) return v.dispose();
          view = v;
          render(lastP);
          canvas.style.opacity = "1";
          lights.style.opacity = "1";
        })
        .catch(() => {
          if (disposed) return;
          fallback.setAttribute("display", "inline");
          lights.style.opacity = "1";
        });
    };
    // (Safari antigo não tem requestIdleCallback)
    const hasIdle = typeof window.requestIdleCallback === "function";
    const idle = hasIdle ? window.requestIdleCallback(start, { timeout: 1200 }) : window.setTimeout(start, 200);

    return () => {
      disposed = true;
      if (hasIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      unbind();
      view?.dispose();
      view = null;
    };
  }, []);

  return (
    <div ref={trackRef} className="op-track relative">
      <div ref={stageRef} className="op-stage flex flex-col overflow-hidden bg-[#eef2f8]">
        <CornerSwoosh corner="tl" className="pointer-events-none absolute left-0 top-0 z-10 hidden h-[15%] lg:block" />

        <div className="relative z-20 pb-4 pt-8 sm:pt-12 lg:absolute lg:inset-x-0 lg:top-[19%] lg:p-0">{children}</div>

        <div ref={boxRef} className="relative min-h-[240px] flex-1 [container-type:size] lg:absolute lg:inset-0">
          <div ref={wrapRef} className="absolute left-0 top-0 h-[max(100cqh,48.56cqw)] w-[max(100cqw,205.95cqh)] will-change-transform">
            <RoadArt />

            {/* luz dos faróis e das lanternas: soma-se ao asfalto (modo "screen") */}
            <svg
              ref={lightsRef}
              viewBox={`0 0 ${ART_W} ${ART_H}`}
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700"
              style={{ mixBlendMode: "screen" }}
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <clipPath id="rs-road-clip">
                  <path d={ROAD.shoulder} />
                </clipPath>
                <radialGradient id="rs-beam" cx="0.5" cy="0.5" r="0.5" fx="0.02" fy="0.5">
                  <stop offset="0" stopColor="#fff6e2" stopOpacity="0.95" />
                  <stop offset="0.3" stopColor="#ffe2b4" stopOpacity="0.55" />
                  <stop offset="0.7" stopColor="#ffc985" stopOpacity="0.16" />
                  <stop offset="1" stopColor="#ffc985" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="rs-beam-core" cx="0.5" cy="0.5" r="0.5" fx="0.02" fy="0.5">
                  <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
                  <stop offset="0.5" stopColor="#fff1d6" stopOpacity="0.3" />
                  <stop offset="1" stopColor="#fff1d6" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="rs-spot">
                  <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="1" stopColor="#fff1d6" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="rs-tail">
                  <stop offset="0" stopColor="#ff3b2f" stopOpacity="0.85" />
                  <stop offset="0.5" stopColor="#ff3b2f" stopOpacity="0.28" />
                  <stop offset="1" stopColor="#ff3b2f" stopOpacity="0" />
                </radialGradient>
              </defs>
              <g clipPath="url(#rs-road-clip)">
                <g ref={frontRef} transform={truckTransform(0)}>
                  <ellipse cx="170" cy="0" rx="190" ry="78" fill="url(#rs-beam)" />
                  <ellipse cx="96" cy="-14" rx="104" ry="34" fill="url(#rs-beam-core)" />
                  <ellipse cx="96" cy="16" rx="104" ry="34" fill="url(#rs-beam-core)" />
                  <circle cx="4" cy="-17" r="12" fill="url(#rs-spot)" />
                  <circle cx="4" cy="17" r="12" fill="url(#rs-spot)" />
                </g>
                <g ref={backRef} transform={truckTransform(0)}>
                  <ellipse cx="-22" cy="0" rx="40" ry="38" fill="url(#rs-tail)" opacity="0.7" />
                </g>
              </g>
            </svg>

            <svg viewBox={`0 0 ${ART_W} ${ART_H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
              <g ref={dotRef} transform={trackerTransform(0)}>
                <circle r={17} fill="#f47c28" opacity={0.22} />
                <circle r={7.5} fill="#ffffff" stroke="#f47c28" strokeWidth={3.5} />
              </g>
              {/* reserva sem WebGL */}
              <g ref={fallbackRef} transform={truckTransform(0)} display="none">
                <TopTruck />
              </g>
            </svg>

            <canvas ref={canvasRef} className="pointer-events-none absolute left-0 top-0 h-64 w-64 origin-center opacity-0 transition-opacity duration-700" aria-hidden="true" />
          </div>
        </div>

        <CornerSwoosh corner="br" className="pointer-events-none absolute bottom-0 right-0 z-10 h-[9%] lg:h-[15%]" />
      </div>
    </div>
  );
}

/** Camada estática: fundo, mapa, rota, pinos e estrada (desenhada uma vez). */
function RoadArt() {
  return (
    <svg viewBox={`0 0 ${ART_W} ${ART_H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="rs-bg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f6f8fc" />
          <stop offset="1" stopColor="#ebf0f7" />
        </linearGradient>
        <radialGradient id="rs-light" cx="380" cy="360" r="720" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="rs-map-fade"
          cx="1390"
          cy="170"
          r="840"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(1390 170) scale(1 0.62) translate(-1390 -170)"
        >
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="rs-map-mask" maskUnits="userSpaceOnUse" x="0" y="-60" width={ART_W} height="820">
          <rect x="0" y="-60" width={ART_W} height="820" fill="url(#rs-map-fade)" />
        </mask>
        <linearGradient id="rs-hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3e9f2" />
          <stop offset="1" stopColor="#f4f6fa" />
        </linearGradient>
        <linearGradient id="rs-asphalt" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#18223b" />
          <stop offset="0.6" stopColor="#222e4b" />
          <stop offset="1" stopColor="#2c3a5c" />
        </linearGradient>
        <radialGradient id="rs-halo">
          <stop offset="0" stopColor="#f47c28" stopOpacity="0.42" />
          <stop offset="0.6" stopColor="#f47c28" stopOpacity="0.12" />
          <stop offset="1" stopColor="#f47c28" stopOpacity="0" />
        </radialGradient>
        <filter id="rs-blur-s" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id="rs-blur-l" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="20" />
        </filter>
        <filter id="rs-blur-pin" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      <rect width={ART_W} height={ART_H} fill="url(#rs-bg)" />
      <rect width={ART_W} height={ART_H} fill="url(#rs-light)" />

      {/* mapa da cidade */}
      <g mask="url(#rs-map-mask)">
        <rect x="620" y="-60" width="1220" height="760" fill="#e1e7f0" />
        <path d={MAP.minor} fill="none" stroke="#f8fafd" strokeWidth="4.5" strokeLinecap="round" />
        <path d={MAP.major} fill="none" stroke="#fbfcfe" strokeWidth="8" strokeLinecap="round" />
        {MAP.avenues.map((d) => (
          <g key={d}>
            <path d={d} fill="none" stroke="#d3dbe7" strokeWidth="19" strokeLinecap="round" />
            <path d={d} fill="none" stroke="#ffffff" strokeWidth="13" strokeLinecap="round" />
          </g>
        ))}
        <path d={MAP.river} fill="none" stroke="#c4d9f1" strokeWidth="36" strokeLinecap="round" />
        <path d={MAP.river} fill="none" stroke="#d5e5f7" strokeWidth="20" strokeLinecap="round" />
      </g>

      {/* relevo suave atrás da estrada */}
      <path d="M-20 600C150 548 340 566 480 632C570 674 650 760 700 874H-20Z" fill="url(#rs-hill)" />
      <path d="M-20 600C150 548 340 566 480 632" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.9" />
      <path d="M760 874C930 790 1110 768 1290 790C1450 808 1590 846 1680 874Z" fill="url(#rs-hill)" opacity="0.8" />

      {/* rota planejada e pinos de origem/destino */}
      <path d={ROUTE_PATH} fill="none" stroke="#f47c28" strokeWidth="18" strokeLinecap="round" opacity="0.35" filter="url(#rs-blur-s)" />
      <path d={ROUTE_PATH} fill="none" stroke="#f47c28" strokeWidth="6.5" strokeLinecap="round" />
      <path d={ROUTE_PATH} fill="none" stroke="#ffd2ab" strokeWidth="2" strokeLinecap="round" />
      <Pin x={PIN_A.x} y={PIN_A.y} color="#162f60" />
      <Pin x={PIN_B.x} y={PIN_B.y} color="#f47c28" />

      {/* estrada: sombra, acostamento claro, brilho laranja, asfalto, bordas e faixas */}
      <path d={ROAD.body} fill="#0b1a38" opacity="0.3" transform="translate(12 24)" filter="url(#rs-blur-l)" />
      <path d={ROAD.shoulder} fill="#ffffff" opacity="0.95" filter="url(#rs-blur-s)" />
      <path d={ROAD.glowL} fill="#f47c28" opacity="0.6" filter="url(#rs-blur-s)" />
      <path d={ROAD.glowR} fill="#f47c28" opacity="0.6" filter="url(#rs-blur-s)" />
      <path d={ROAD.body} fill="url(#rs-asphalt)" />
      <path d={ROAD.sheen} fill="#ffffff" opacity="0.045" />
      <path d={ROAD.edgeL} fill="#ff8a3d" />
      <path d={ROAD.edgeR} fill="#ff8a3d" />
      <path d={ROAD.dashes} fill="#e8edf5" opacity="0.85" />
    </svg>
  );
}

function Pin({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="-2" rx="64" ry="40" fill="url(#rs-halo)" />
      <ellipse cx="0" cy="-2" rx="30" ry="18" fill="#f47c28" opacity="0.18" />
      <ellipse cx="2" cy="1" rx="10" ry="4" fill="#0b1a38" opacity="0.35" filter="url(#rs-blur-pin)" />
      <path d="M0 0C-5 -9 -21 -21 -21 -37A21 21 0 1 1 21 -37C21 -21 5 -9 0 0Z" fill={color} />
      <circle cx="0" cy="-37" r="7.5" fill="#ffffff" />
    </g>
  );
}
