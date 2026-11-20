import Image from "next/image";
import type { ReactNode } from "react";
import { publicAsset, site } from "@/config/site";

type Props = {
  /** Caminho em /public. Quando ausente, mostra a composição provisória. */
  src?: string | null;
  alt: string;
  /** Descrição da fotografia recomendada (aparece no selo de pendência). */
  brief: string;
  className?: string;
  sizes?: string;
  children?: ReactNode;
  tone?: "navy" | "mist";
};

/**
 * Espaço para fotografia. Enquanto a imagem oficial não existir, exibe uma
 * composição gráfica da marca com um selo "Fotografia pendente" — nunca uma
 * foto de banco apresentada como se fosse da empresa.
 */
export function MediaSlot({ src, alt, brief, className = "", sizes = "(min-width: 1024px) 50vw, 100vw", children, tone = "navy" }: Props) {
  if (src) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image src={publicAsset(src)} alt={alt} fill sizes={sizes} className="object-cover" />
      </div>
    );
  }
  const dark = tone === "navy";
  return (
    <div
      className={`relative overflow-hidden ${dark ? "bg-navy text-white" : "bg-mist text-navy"} ${className}`}
      role="img"
      aria-label={`${alt} (imagem ainda não fornecida)`}
    >
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 400 300" aria-hidden="true">
        <defs>
          <pattern id={`grid-${tone}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke="currentColor" strokeOpacity={dark ? 0.07 : 0.06} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="300" fill={`url(#grid-${tone})`} />
        <path d="M-10 250 C 90 210, 160 260, 250 200 S 380 150, 420 120" fill="none" stroke="#F47C28" strokeOpacity="0.55" strokeWidth="2" />
      </svg>
      <div className="relative flex h-full w-full items-center justify-center p-8">{children}</div>
      {site.showPendingMediaBadges && (
        <span
          className={`absolute bottom-3 left-3 max-w-[85%] rounded-full px-3 py-1 text-[11px] font-medium ${
            dark ? "bg-white/10 text-white/80 ring-1 ring-white/15" : "bg-white text-slate ring-1 ring-line"
          }`}
        >
          Fotografia pendente · {brief}
        </span>
      )}
    </div>
  );
}
