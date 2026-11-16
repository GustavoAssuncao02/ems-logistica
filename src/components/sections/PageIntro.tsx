import type { ReactNode } from "react";

/** Abertura das páginas internas (abaixo do cabeçalho fixo). */
export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-mist">
      <svg aria-hidden="true" className="absolute -right-20 top-10 hidden h-[120%] w-1/2 md:block" viewBox="0 0 600 400" preserveAspectRatio="xMaxYMid meet">
        <path d="M0 380 C 180 360, 260 240, 360 220 S 540 140, 600 30" fill="none" stroke="#F47C28" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="2 9" strokeLinecap="round" />
      </svg>
      <div className="container-ems relative pb-16 pt-36 md:pb-20 md:pt-44">
        <p className="eyebrow text-orange-600">{eyebrow}</p>
        <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.06] sm:text-5xl lg:text-6xl">{title}</h1>
        {children && <div className="mt-6 max-w-2xl text-lg leading-relaxed text-slate">{children}</div>}
      </div>
    </section>
  );
}
