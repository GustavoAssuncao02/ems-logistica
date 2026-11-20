import Image from "next/image";
import type { ReactNode } from "react";
import { publicAsset, site } from "@/config/site";

type Props = {
  /** Caminho em /public. Sem foto, mostra um céu de fim de tarde provisório. */
  src?: string | null;
  alt: string;
  /** Descrição da fotografia esperada (aparece no selo de pendência). */
  brief: string;
  className?: string;
  sizes?: string;
  /** Camadas gráficas sobre a foto (decorativas). */
  children?: ReactNode;
};

/**
 * Quadro de fotografia com camadas gráficas por cima. Enquanto a foto não for
 * fornecida, exibe um fundo vetorial de pôr do sol (sem simular uma foto) e o
 * selo "Fotografia pendente".
 */
export function PhotoFrame({ src, alt, brief, className = "", sizes = "(min-width: 1024px) 50vw, 100vw", children }: Props) {
  return (
    <div
      className={`relative isolate overflow-hidden bg-navy-900 ${className}`}
      {...(src ? {} : { role: "img", "aria-label": `${alt} (fotografia ainda não fornecida)` })}
    >
      {src ? <Image src={publicAsset(src)} alt={alt} fill sizes={sizes} className="-z-10 object-cover" /> : <SunsetPlaceholder />}
      {children}
      {!src && site.showPendingMediaBadges && (
        <span className="absolute bottom-3 left-3 max-w-[85%] rounded-full bg-black/35 px-3 py-1 text-[11px] font-medium text-white/85 ring-1 ring-white/20 backdrop-blur-sm">
          Fotografia pendente · {brief}
        </span>
      )}
    </div>
  );
}

function SunsetPlaceholder() {
  return (
    <svg className="absolute inset-0 -z-10 h-full w-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="pf-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d2f5c" />
          <stop offset="0.38" stopColor="#4a5a86" />
          <stop offset="0.6" stopColor="#b46c55" />
          <stop offset="0.74" stopColor="#f0a35c" />
        </linearGradient>
        <radialGradient id="pf-sun" cx="640" cy="430" r="420" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffe2b0" stopOpacity="0.95" />
          <stop offset="0.25" stopColor="#ffab5e" stopOpacity="0.5" />
          <stop offset="1" stopColor="#f47c28" stopOpacity="0" />
        </radialGradient>
        <filter id="pf-soft" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <rect width="800" height="600" fill="url(#pf-sky)" />
      <rect width="800" height="600" fill="url(#pf-sun)" />
      <g filter="url(#pf-soft)" opacity="0.55">
        <ellipse cx="300" cy="150" rx="170" ry="40" fill="#f2b98a" />
        <ellipse cx="560" cy="230" rx="200" ry="34" fill="#f7c08c" />
        <ellipse cx="140" cy="280" rx="150" ry="26" fill="#d98f6c" />
      </g>
      <circle cx="640" cy="430" r="26" fill="#fff1d6" />
      <path d="M0 440 130 412 260 430 400 402 540 426 680 410 800 424V600H0Z" fill="#3b2c3c" opacity="0.85" />
      <path d="M0 470 180 452 360 466 560 448 800 462V600H0Z" fill="#221a26" />
      <path d="M0 520H800V600H0Z" fill="#141019" />
    </svg>
  );
}
