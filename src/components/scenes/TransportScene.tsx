"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CalendarIcon, PackageIcon, PinIcon } from "@/components/sections/solutionIcons";
import { publicAsset } from "@/config/site";
import { BR_BORDERS, BR_CAPITALS, BR_OUTLINE, BR_VIEW, brPoint } from "./brazilMap";
import type { CloudSky } from "./cloudSky";

/* ------------------------------------------------------------------ */
/* Composição (coordenadas do quadro 900 × 630)                         */
/* ------------------------------------------------------------------ */

/** Ponto de convergência das rotas e origens ilustrativas. */
const HUB = brPoint(-12.0, -38.75);
const ORIGINS = [brPoint(-3.12, -60.02), brPoint(-12.7, -60.6), brPoint(-21.2, -50.4), brPoint(-29.0, -53.8)];

function routePath([ax, ay]: readonly [number, number], [bx, by]: readonly [number, number]) {
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);
  // perpendicular apontando para cima: arco levemente abaulado
  let nx = -dy / len;
  let ny = dx / len;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  const k = 0.2 * len;
  return `M${ax.toFixed(1)} ${ay.toFixed(1)}Q${(mx + nx * k).toFixed(1)} ${(my + ny * k).toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;
}
const ROUTES = ORIGINS.map((o) => routePath(o, HUB));

/** Filete de luz que corta o quadro por trás das caixas. */
const GROUND_LINE = "M-20 468C80 456 210 440 330 452C430 462 500 520 590 562C680 600 790 612 930 598";

/** Marcador: ponta em (0, 0), cabeça de raio 11 centrada em (0, -20.6). */
const PIN = "M0 0C-3.2 -6.4 -11 -12.8 -11 -20.6A11 11 0 0 1 11 -20.6C11 -12.8 3.2 -6.4 0 0Z";

/** Caixas recortadas (posição no quadro). */
const BOXES = { x: 25, y: 373, w: 396, h: 244 };

/** Instante inicial do céu (s): um arranjo de nuvens bonito para começar. */
const SKY_T0 = 0;
/** Quadros por segundo das nuvens (o movimento é lento; 24 qps sobra). */
const SKY_FPS = 24;

const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`;

/**
 * Cena do item "Transporte rodoviário de cargas": mapa do Brasil (malha do
 * IBGE) com rotas iluminadas sobre um céu de fim de tarde cujas nuvens
 * volumétricas são renderizadas ao vivo e se movem devagar. A renderização
 * só roda com a cena na tela; com movimento reduzido, fica um quadro fixo.
 */
export function TransportScene({ className = "" }: { className?: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = frame.current;
    const cv = canvas.current;
    if (!el || !cv) return;

    let sky: CloudSky | null = null;
    let raf = 0;
    let visible = false;
    let disposed = false;
    let clock = SKY_T0;
    let last = 0;
    let lastDraw = -Infinity;
    // resolução dinâmica: se o aparelho não acompanha, as nuvens ficam mais leves
    let quality = 0.75;
    let frameMs = 16;
    let lastCheck = 0;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const draw = () => {
      if (!sky) return;
      sky.render(clock);
    };

    const tick = (now: number) => {
      raf = 0;
      if (!sky || !visible || motion.matches) return;
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      if (last) frameMs = frameMs * 0.9 + (now - last) * 0.1;
      last = now;
      if (now - lastCheck > 2000) {
        if (lastCheck && frameMs > 42 && quality > 0.4) {
          quality *= 0.8;
          sky.setScale(quality);
        }
        lastCheck = now;
      }
      clock += dt;
      if (now - lastDraw >= 1000 / SKY_FPS - 2) {
        lastDraw = now;
        draw();
      }
      raf = requestAnimationFrame(tick);
    };

    const play = () => {
      if (!raf && sky && visible && !motion.matches) {
        last = 0;
        lastCheck = 0;
        frameMs = 16;
        raf = requestAnimationFrame(tick);
      }
    };

    const fit = () => {
      if (!sky) return;
      const r = el.getBoundingClientRect();
      sky.setSize(r.width, r.height);
      draw();
    };

    const start = async () => {
      const { createCloudSky } = await import("./cloudSky");
      if (disposed) return;
      sky = createCloudSky(cv, { scale: quality, maxPixels: 360_000 });
      if (!sky) return;
      fit();
      setLive(true);
      play();
    };

    // só inicializa o WebGL quando a cena se aproxima da tela
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        near.disconnect();
        const idle = typeof window.requestIdleCallback === "function";
        if (idle) window.requestIdleCallback(() => void start(), { timeout: 600 });
        else setTimeout(() => void start(), 60);
      },
      { rootMargin: "600px 0px" },
    );
    near.observe(el);

    const onScreen = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) play();
      else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    onScreen.observe(el);

    const ro = new ResizeObserver(fit);
    ro.observe(el);
    const onMotion = () => (motion.matches ? draw() : play());
    motion.addEventListener("change", onMotion);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      near.disconnect();
      onScreen.disconnect();
      ro.disconnect();
      motion.removeEventListener("change", onMotion);
      sky?.dispose();
    };
  }, []);

  return (
    <div
      ref={frame}
      role="img"
      aria-label="Ilustração: mapa do Brasil com rotas de transporte ligando diversas regiões, caixas de carga em primeiro plano e céu de fim de tarde com nuvens em movimento"
      className={`@container relative isolate aspect-[10/7] overflow-hidden bg-[#0d2149] ${className}`}
    >
      {/* céu: quadro estático enquanto o WebGL não assume (e sem WebGL2) */}
      <Image src={publicAsset("/media/transporte-ceu.webp")} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
      <canvas
        ref={canvas}
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${live ? "opacity-100" : "opacity-0"}`}
      />

      <svg
        viewBox={`0 0 ${BR_VIEW.w} ${BR_VIEW.h}`}
        aria-hidden="true"
        focusable="false"
        className="absolute inset-0 h-full w-full transform-gpu"
      >
        <defs>
          <linearGradient id="ts-fill" x1="0.15" y1="0" x2="0.85" y2="1">
            <stop offset="0" stopColor="#2a4278" />
            <stop offset="0.55" stopColor="#1d3263" />
            <stop offset="1" stopColor="#172852" />
          </linearGradient>
          <radialGradient id="ts-sheen" cx="0.38" cy="0.3" r="0.6">
            <stop offset="0" stopColor="#6d8fd6" stopOpacity="0.32" />
            <stop offset="1" stopColor="#6d8fd6" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ts-coast" x1="335" y1="0" x2="880" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#d8e6ff" />
            <stop offset="0.6" stopColor="#e9ecff" />
            <stop offset="0.82" stopColor="#ffc28a" />
            <stop offset="1" stopColor="#ff9a48" />
          </linearGradient>
          <linearGradient id="ts-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0a1228" stopOpacity="0" />
            <stop offset="0.45" stopColor="#0a1228" stopOpacity="0.82" />
            <stop offset="1" stopColor="#070c1c" stopOpacity="0.96" />
          </linearGradient>
          <radialGradient id="ts-floor-fade" cx="0.3" cy="1" r="0.75">
            <stop offset="0.55" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="ts-floor-mask">
            <rect x="0" y="500" width="900" height="130" fill="url(#ts-floor-fade)" />
          </mask>
          <radialGradient id="ts-halo">
            <stop offset="0" stopColor="#ff9a3d" stopOpacity="0.75" />
            <stop offset="1" stopColor="#ff9a3d" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ts-pin" x1="0" y1="-32" x2="0" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffa149" />
            <stop offset="1" stopColor="#e2600c" />
          </linearGradient>
          <filter id="ts-blur-s" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
          <filter id="ts-blur-m" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <filter id="ts-blur-l" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>

        {/* chão escuro onde as caixas se apoiam */}
        <rect x="0" y="500" width="900" height="130" fill="url(#ts-floor)" mask="url(#ts-floor-mask)" />

        {/* mapa: sombra, espessura, preenchimento, divisas e litoral */}
        <path d={BR_OUTLINE} fill="#050b1d" opacity="0.55" transform="translate(8 18)" filter="url(#ts-blur-l)" />
        <path d={BR_OUTLINE} fill="#0b1631" transform="translate(0 5)" />
        <path d={BR_OUTLINE} fill="url(#ts-fill)" fillOpacity="0.96" />
        <path d={BR_OUTLINE} fill="url(#ts-sheen)" />
        <path d={BR_BORDERS} fill="none" stroke="#bcd2ff" strokeOpacity="0.55" strokeWidth="2.6" filter="url(#ts-blur-s)" />
        <path d={BR_BORDERS} fill="none" stroke="#d6e4ff" strokeOpacity="0.62" strokeWidth="0.9" strokeLinejoin="round" />
        <path d={BR_OUTLINE} fill="none" stroke="url(#ts-coast)" strokeOpacity="0.85" strokeWidth="6" filter="url(#ts-blur-m)" />
        <path d={BR_OUTLINE} fill="none" stroke="url(#ts-coast)" strokeWidth="1.5" strokeLinejoin="round" />

        {/* capitais como pontos de luz */}
        {BR_CAPITALS.map(([x, y]) => (
          <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
            <circle r="5" fill="url(#ts-halo)" opacity="0.6" />
            <circle r="1.3" fill="#ffd2a2" />
          </g>
        ))}

        {/* rotas */}
        <g fill="none" strokeLinecap="round">
          {ROUTES.map((d) => (
            <g key={d}>
              <path d={d} stroke="#ff7a1a" strokeOpacity="0.75" strokeWidth="8" filter="url(#ts-blur-m)" />
              <path d={d} stroke="#ffad55" strokeWidth="2.8" />
              <path d={d} stroke="#fff3e0" strokeWidth="1" />
            </g>
          ))}
        </g>

        {/* filete de luz (passa por trás das caixas) */}
        <g fill="none" strokeLinecap="round">
          <path d={GROUND_LINE} stroke="#ff7a1a" strokeOpacity="0.8" strokeWidth="12" filter="url(#ts-blur-m)" />
          <path d={GROUND_LINE} stroke="#ffb15e" strokeWidth="3.6" />
          <path d={GROUND_LINE} stroke="#fff4e4" strokeWidth="1.3" />
        </g>

        {/* marcadores */}
        {ORIGINS.map(([x, y]) => (
          <g key={`${x}-${y}`} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(1.3)`}>
            <ellipse cy="-1" rx="12" ry="5" fill="url(#ts-halo)" />
            <path d={PIN} fill="#000" opacity="0.3" transform="translate(1.5 2)" filter="url(#ts-blur-s)" />
            <path d={PIN} fill="url(#ts-pin)" stroke="#ffc58f" strokeWidth="0.6" />
            <circle cy="-20.6" r="6.3" fill="#fff" />
            <circle cy="-20.6" r="2.9" fill="#8a3a10" />
          </g>
        ))}
        <g transform={`translate(${HUB[0].toFixed(1)} ${HUB[1].toFixed(1)})`}>
          <circle cy="-33" r="46" fill="url(#ts-halo)" opacity="0.7" />
          <circle cy="-33" r="36" fill="none" stroke="#ffb46e" strokeOpacity="0.45" strokeWidth="1.5" className="ts-ring" />
          <circle cy="-33" r="27" fill="#f47c28" fillOpacity="0.16" stroke="#ff9d4a" strokeOpacity="0.7" strokeWidth="1.5" />
          <g transform="scale(2.05)">
            <path d={PIN} fill="#000" opacity="0.3" transform="translate(1.5 2)" filter="url(#ts-blur-s)" />
            <path d={PIN} fill="url(#ts-pin)" stroke="#ffd0a3" strokeWidth="0.6" />
            <circle cy="-20.6" r="6.3" fill="#fff" />
            <circle cy="-20.6" r="2.9" fill="#8a3a10" />
          </g>
        </g>
      </svg>

      {/* caixas recortadas do quadro de referência, sobre sombra de contato */}
      <div
        aria-hidden="true"
        className="absolute"
        style={{ left: pct(BOXES.x, BR_VIEW.w), top: pct(BOXES.y, BR_VIEW.h), width: pct(BOXES.w, BR_VIEW.w), height: pct(BOXES.h, BR_VIEW.h) }}
      >
        <span className="absolute inset-x-[4%] bottom-[-3%] h-[10%] rounded-[50%] bg-black/60 blur-md" />
        <Image src={publicAsset("/media/transporte-caixas.webp")} alt="" fill sizes="(min-width: 1024px) 24vw, 45vw" className="object-contain" />
      </div>

      {/* painel de vidro (repete os pontos da lista ao lado; decorativo) */}
      <ul
        aria-hidden="true"
        className="absolute left-[5%] top-[9.5%] hidden w-[32.5%] rounded-[clamp(0.75rem,2.4cqw,1.25rem)] bg-[#1b2c58]/35 px-[2.6cqw] py-[1cqw] text-white shadow-[0_18px_40px_-20px_rgba(4,10,30,0.8)] ring-1 ring-inset ring-white/25 backdrop-blur-md @md:block"
      >
        {[
          { Icon: PinIcon, label: "Origem e destino" },
          { Icon: PackageIcon, label: "Tipo e volume de carga" },
          { Icon: CalendarIcon, label: "Frequência da operação" },
        ].map(({ Icon, label }, i) => (
          <li key={label} className={`flex items-center gap-[2cqw] py-[2.1cqw] ${i ? "border-t border-white/15" : ""}`}>
            <Icon className="h-[4.6cqw] w-[4.6cqw] shrink-0 text-orange" />
            <span className="text-[clamp(0.7rem,2.25cqw,1.1rem)] font-semibold leading-tight">{label}</span>
          </li>
        ))}
      </ul>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10" />
    </div>
  );
}
