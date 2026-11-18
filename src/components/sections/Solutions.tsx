import Link from "next/link";
import type { ReactNode } from "react";
import { CornerSwoosh } from "@/components/scenes/CornerSwoosh";
import { TrailerScene } from "@/components/scenes/TrailerScene";
import { Arrow } from "@/components/ui/ButtonLink";
import { MediaSlot } from "@/components/ui/MediaSlot";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { Reveal } from "@/components/ui/Reveal";
import {
  BadgeIcon,
  CalendarIcon,
  CheckIcon,
  CoinsIcon,
  CubesIcon,
  HandshakeIcon,
  PackageIcon,
  PinIcon,
  SlidersIcon,
  TargetIcon,
  TruckIcon,
} from "./solutionIcons";

/**
 * Soluções: abertura com o baú que se abre ao rolar, seguida das três frentes.
 * Textos são propostas editáveis — revisar afirmações específicas com a EMS.
 * Fotografias: `image` aponta para um arquivo em /public.
 * `artInImage: true` indica que a imagem já traz a rota/os painéis aplicados
 * (as atuais são recortes dos mockups). Ao trocar por uma foto limpa, mude para
 * `false` e as camadas gráficas passam a ser desenhadas por cima, em código.
 */
const logistics = {
  image: "/media/solucoes-logistica.webp" as string | null,
  artInImage: true,
  brief: "armazém com docas e carreta ao pôr do sol",
};

const freight = {
  image: "/media/solucoes-fretes.webp" as string | null,
  artInImage: true,
  brief: "carreta em rodovia ao pôr do sol",
};

const transport = {
  n: "03",
  label: "Transporte rodoviário de cargas",
  title: "Conectando operações aos seus destinos.",
  text: "Soluções em transporte rodoviário de cargas estruturadas a partir das características de cada operação: origem e destino, tipo de carga, volume e frequência.",
  points: ["Origem e destino", "Tipo e volume de carga", "Frequência da operação"],
  image: null as string | null,
  brief: "caminhão-baú em rodovia brasileira",
};

export function Solutions() {
  return (
    <section id="solucoes" aria-labelledby="solucoes-title" className="bg-mist">
      <SolutionsOpening />
      <div className="container-ems pb-24 md:pb-32">
        <div className="divide-y divide-line">
          <LogisticsFeature />
          <FreightFeature />
          <TransportFeature />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Abertura                                                            */
/* ------------------------------------------------------------------ */

function SolutionsOpening() {
  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-b from-[#eef2f8] to-mist">
      <svg className="absolute inset-0 -z-10 h-full w-full" viewBox="0 0 1600 800" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M0 560C260 470 520 520 760 620C940 694 1120 760 1300 800H0Z" fill="#ffffff" opacity="0.6" />
        <path d="M1600 200C1460 290 1370 420 1392 560C1408 660 1496 742 1600 770Z" fill="#ffffff" opacity="0.45" />
        <path d="M0 120C320 60 700 90 1000 40C1200 8 1400 0 1600 10V0H0Z" fill="#ffffff" opacity="0.35" />
      </svg>
      <CornerSwoosh corner="tl" className="pointer-events-none absolute left-0 top-0 h-16 sm:h-24 lg:h-32" />

      <div className="container-ems grid items-center gap-10 pb-12 pt-24 sm:pt-28 lg:grid-cols-12 lg:gap-6 lg:py-14">
        <Reveal className="lg:col-span-7">
          <p className="eyebrow flex items-center gap-4 text-orange-600">
            Soluções
            <span aria-hidden="true" className="h-px w-16 bg-orange sm:w-24" />
          </p>
          <h2 id="solucoes-title" className="mt-5 text-4xl font-extrabold leading-[1.06] sm:text-5xl lg:text-[clamp(2.75rem,4vw,4.4rem)]">
            Três frentes. Uma mesma visão de operação<span className="text-orange">.</span>
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#4b5872] lg:text-[clamp(1.125rem,1.4vw,1.4rem)]">
            Logística, fretes e transporte tratados de forma conectada — do planejamento às decisões do dia a dia.
          </p>
        </Reveal>
        <div className="flex justify-center lg:col-span-5">
          <TrailerScene className="trailer-size" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Peças comuns                                                         */
/* ------------------------------------------------------------------ */

function Kicker({ n, label }: { n: string; label: string }) {
  return (
    <p className="flex items-center gap-3 font-display text-sm font-bold text-navy">
      <span className="text-orange-600">{n}</span>
      <span aria-hidden="true" className="h-px w-8 bg-navy/25" />
      <span className="uppercase tracking-[0.16em]">{label}</span>
    </p>
  );
}

function QuoteLink() {
  return (
    <Link href="/#cotacao" className="group mt-10 inline-flex items-center gap-2 font-semibold text-navy">
      <span className="border-b-2 border-orange pb-0.5">Solicitar cotação</span>
      <Arrow />
    </Link>
  );
}

const photoShadow = "shadow-[0_40px_70px_-40px_rgba(22,47,96,0.55)]";

/* ------------------------------------------------------------------ */
/* 01 — Logística                                                       */
/* ------------------------------------------------------------------ */

const rights: { label: [string, string]; Icon: (p: { className?: string }) => ReactNode }[] = [
  { label: ["Produto", "certo"], Icon: PackageIcon },
  { label: ["Lugar", "certo"], Icon: PinIcon },
  { label: ["Momento", "certo"], Icon: CalendarIcon },
  { label: ["Quantidade", "certa"], Icon: CubesIcon },
  { label: ["Melhores", "condições"], Icon: BadgeIcon },
];

function LogisticsFeature() {
  return (
    <article className="grid items-center gap-10 py-16 md:py-24 lg:grid-cols-12 lg:gap-14" aria-labelledby="sol-01">
      <Reveal className="lg:col-span-6">
        <PhotoFrame
          src={logistics.image}
          alt="Armazém logístico com docas e carreta, com a rota da carga destacada da origem ao destino"
          brief={logistics.brief}
          className={`aspect-[3/2] rounded-[1.75rem] ${photoShadow}`}
        >
          {!(logistics.image && logistics.artInImage) && <RouteOverlay />}
        </PhotoFrame>
      </Reveal>

      <Reveal delay={120} className="lg:col-span-6">
        <Kicker n="01" label="Logística" />
        <h3 id="sol-01" className="mt-5 text-3xl font-extrabold leading-[1.1] sm:text-[2.6rem]">
          Logística que conecta toda a jornada da carga<span className="text-orange">.</span>
        </h3>
        <p className="mt-5 text-lg leading-relaxed text-[#4b5872]">
          Processo de planejar, implementar e controlar com eficiência o fluxo e a armazenagem de mercadorias, serviços e informações — da origem
          ao destino final.
        </p>

        <div className="mt-7 flex items-center gap-4 rounded-2xl bg-orange-50 p-5 ring-1 ring-orange/15 sm:gap-5 sm:p-6">
          <TargetIcon className="h-11 w-11 shrink-0 text-orange sm:h-12 sm:w-12" />
          <span aria-hidden="true" className="h-12 w-px shrink-0 bg-orange/35" />
          <p className="text-[15px] leading-relaxed text-ink sm:text-base">
            Nosso objetivo é garantir que o <strong className="font-bold text-navy">produto certo</strong> chegue ao{" "}
            <strong className="font-bold text-navy">lugar certo</strong>, no <strong className="font-bold text-navy">momento certo</strong>, na{" "}
            <strong className="font-bold text-navy">quantidade certa</strong> e nas <strong className="font-bold text-navy">melhores condições</strong>,
            pelo <strong className="font-bold text-navy">menor custo</strong> operacional.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-3 gap-x-3 gap-y-10 sm:grid-cols-5">
          {rights.map(({ label, Icon }) => (
            <li key={label[0]} className="relative rounded-2xl bg-white px-2 pb-4 pt-9 text-center ring-1 ring-line">
              <span className="absolute left-1/2 top-0 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow-[0_6px_16px_-8px_rgba(22,47,96,0.4)] ring-1 ring-line">
                <Icon className="h-6 w-6 text-orange" />
              </span>
              <span className="block font-display text-[13px] font-bold leading-tight text-navy sm:text-sm">
                {label[0]}
                <br />
                {label[1]}
              </span>
            </li>
          ))}
        </ul>

        <QuoteLink />
      </Reveal>
    </article>
  );
}

/** Rota luminosa da origem (canto inferior esquerdo) ao destino, sobre a foto. */
function RouteOverlay() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 900 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <filter id="ro-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <radialGradient id="ro-halo">
          <stop offset="0" stopColor="#f47c28" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f47c28" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d="M86 470C150 480 230 482 300 452C390 414 450 340 540 270C620 206 690 168 782 160"
        fill="none"
        stroke="#ff9a3d"
        strokeWidth="16"
        opacity="0.7"
        filter="url(#ro-glow)"
      />
      <path d="M86 470C150 480 230 482 300 452C390 414 450 340 540 270C620 206 690 168 782 160" fill="none" stroke="#ffb15e" strokeWidth="5" strokeLinecap="round" />
      <path d="M86 470C150 480 230 482 300 452C390 414 450 340 540 270C620 206 690 168 782 160" fill="none" stroke="#fff3e2" strokeWidth="1.8" strokeLinecap="round" />
      {[
        [86, 470],
        [782, 160],
      ].map(([x, y]) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <circle r="62" fill="url(#ro-halo)" />
          <circle r="40" fill="none" stroke="#ffb15e" strokeOpacity="0.45" strokeWidth="1.5" />
          <circle r="34" fill="#f47c28" />
          <path d="M0 16C0 16 -12 3 -12 -4A12 12 0 0 1 12 -4C12 3 0 16 0 16Z" fill="#ffffff" />
          <circle cy="-4" r="4.5" fill="#f47c28" />
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* 02 — Gestão de fretes                                                */
/* ------------------------------------------------------------------ */

const freightPoints = [
  { label: "Análise de fretes", Icon: TruckIcon },
  { label: "Negociação", Icon: HandshakeIcon },
  { label: "Condições comerciais", Icon: CoinsIcon },
  { label: "Organização da operação", Icon: SlidersIcon },
];

const freightChecks = ["Custos e condições", "Rotas otimizadas", "Maior previsibilidade"];

function FreightFeature() {
  return (
    <article className="grid items-center gap-10 py-16 md:py-24 lg:grid-cols-12 lg:gap-14" aria-labelledby="sol-02">
      <Reveal className="lg:order-2 lg:col-span-6">
        <PhotoFrame
          src={freight.image}
          alt={`Carreta em rodovia ao pôr do sol, com painéis de rota, indicadores e checklist: ${freightChecks.join(", ")}`}
          brief={freight.brief}
          className={`aspect-[3/2] rounded-[1.75rem] ${photoShadow}`}
        >
          {!(freight.image && freight.artInImage) && <FreightOverlay />}
        </PhotoFrame>
      </Reveal>

      <Reveal delay={120} className="lg:order-1 lg:col-span-6 lg:pr-4">
        <Kicker n="02" label="Gestão de fretes" />
        <h3 id="sol-02" className="mt-5 text-3xl font-extrabold leading-[1.1] sm:text-[2.6rem]">
          Fretes planejados. Decisões mais inteligentes<span className="text-orange">.</span>
        </h3>
        <p className="mt-5 text-lg leading-relaxed text-[#4b5872]">
          Análise e negociação de fretes, avaliação de condições comerciais e organização da operação, para que cada embarque seja decidido com
          mais informação e menos imprevistos.
        </p>
        <ul className="mt-8 flex flex-wrap gap-3">
          {freightPoints.map(({ label, Icon }) => (
            <li
              key={label}
              className="inline-flex items-center gap-2.5 rounded-full bg-white px-4 py-2.5 font-display text-sm font-bold text-navy shadow-[0_8px_20px_-14px_rgba(22,47,96,0.45)] ring-1 ring-line"
            >
              <Icon className="h-5 w-5 text-orange" />
              {label}
            </li>
          ))}
        </ul>
        <QuoteLink />
      </Reveal>
    </article>
  );
}

const glass = "bg-white/[0.12] ring-1 ring-white/35 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_20px_40px_-24px_rgba(0,0,0,0.5)]";

/** Painéis de vidro sobre a foto: mapa com rota, indicador e checklist. */
function FreightOverlay() {
  return (
    <div aria-hidden="true" className="absolute inset-0 @container">
      {/* mapa com a rota */}
      <div className={`absolute left-[5.5%] top-[11%] w-[46%] overflow-hidden rounded-[3cqw] @lg:w-[50%] ${glass}`}>
        <svg viewBox="0 0 480 250" className="block h-auto w-full">
          <defs>
            <filter id="fo-glow" x="-10%" y="-20%" width="120%" height="140%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>
          <g stroke="#ffffff" strokeOpacity="0.16" strokeWidth="1.4" fill="none">
            <path d="M0 60C80 50 160 70 240 52S400 30 480 44M0 150C100 140 190 168 300 150S420 120 480 130M0 215C120 200 220 230 330 212S440 196 480 204" />
            <path d="M70 0C64 80 90 160 76 250M190 0C200 70 180 170 196 250M300 0C290 90 318 170 304 250M410 0C420 80 398 160 412 250" />
            <path d="M0 110 120 96 220 118 360 92 480 100M130 0 150 120 120 250M250 0 270 100 252 250M360 0 380 130 362 250" strokeOpacity="0.09" />
          </g>
          <path d="M84 78C118 92 140 116 176 118C214 120 226 100 252 112C282 126 292 162 330 168C356 172 378 168 400 166" fill="none" stroke="#f47c28" strokeWidth="10" opacity="0.7" filter="url(#fo-glow)" />
          <path d="M84 78C118 92 140 116 176 118C214 120 226 100 252 112C282 126 292 162 330 168C356 172 378 168 400 166" fill="none" stroke="#ffb15e" strokeWidth="3.5" strokeLinecap="round" />
          <g transform="translate(84 80)">
            <path d="M0 0C0 0 -15 -15 -15 -27A15 15 0 0 1 15 -27C15 -15 0 0 0 0Z" fill="#ffffff" />
            <circle cy="-27" r="5.5" fill="#f47c28" />
          </g>
          <g transform="translate(400 168)">
            <ellipse rx="26" ry="9" fill="#f47c28" opacity="0.35" />
            <path d="M0 0C0 0 -22 -21 -22 -40A22 22 0 0 1 22 -40C22 -21 0 0 0 0Z" fill="#f47c28" />
            <circle cy="-40" r="8.5" fill="#ffffff" />
          </g>
        </svg>
      </div>

      {/* indicador */}
      <div className={`absolute left-[5.5%] top-[56%] w-[30%] overflow-hidden rounded-[2.4cqw] @lg:top-[53%] @lg:w-[25%] ${glass}`}>
        <svg viewBox="0 0 240 150" className="block h-auto w-full">
          <defs>
            <linearGradient id="fo-bar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffb15e" />
              <stop offset="1" stopColor="#f47c28" />
            </linearGradient>
          </defs>
          <path d="M22 26C70 30 120 40 170 26S214 20 226 16" fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.5" />
          <path d="M22 128H222" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.5" />
          {[38, 56, 72, 92, 112].map((h, i) => (
            <rect key={h} x={32 + i * 38} y={126 - h} width="22" height={h} rx="3" fill="url(#fo-bar)" />
          ))}
        </svg>
      </div>

      {/* checklist */}
      <ul className={`absolute right-[4%] top-[8%] w-[42%] rounded-[2.4cqw] px-[3cqw] py-[1.2cqw] @lg:right-[8%] @lg:w-[32%] @lg:px-[2.2cqw] ${glass}`}>
        {freightChecks.map((t) => (
          <li key={t} className="flex items-center gap-[1.6cqw] border-b border-white/20 py-[1.6cqw] last:border-0">
            <span className="grid aspect-square w-[3.4cqw] min-w-[13px] shrink-0 place-items-center rounded-[0.7cqw] bg-orange text-white">
              <CheckIcon className="w-[75%]" />
            </span>
            <span className="font-display text-[clamp(9.5px,2.05cqw,15px)] font-bold leading-tight text-white">{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 03 — Transporte rodoviário                                           */
/* ------------------------------------------------------------------ */

function TransportFeature() {
  const item = transport;
  return (
    <article className="grid items-center gap-10 py-16 md:py-24 lg:grid-cols-12 lg:gap-16" aria-labelledby={`sol-${item.n}`}>
      <Reveal className="lg:col-span-6">
        <MediaSlot
          src={item.image}
          alt={`Fotografia ilustrativa — ${item.label}`}
          brief={item.brief}
          className="aspect-[4/3] rounded-[1.75rem] shadow-[0_30px_60px_-40px_rgba(22,47,96,0.6)] lg:aspect-[5/4]"
          tone="navy"
        >
          <span className="font-display text-[9rem] font-extrabold leading-none tracking-tighter text-white/[0.08] sm:text-[12rem]" aria-hidden="true">
            {item.n}
          </span>
        </MediaSlot>
      </Reveal>
      <Reveal delay={120} className="lg:col-span-6 lg:pl-6">
        <Kicker n={item.n} label={item.label} />
        <h3 id={`sol-${item.n}`} className="mt-6 text-3xl font-extrabold leading-[1.12] sm:text-[2.6rem]">
          {item.title}
        </h3>
        <p className="mt-6 text-lg leading-relaxed text-slate">{item.text}</p>
        <ul className="mt-8 flex flex-wrap gap-2.5">
          {item.points.map((p) => (
            <li key={p} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-navy ring-1 ring-line">
              {p}
            </li>
          ))}
        </ul>
        <Link href="/#cotacao" className="group mt-10 inline-flex items-center gap-2 font-semibold text-navy">
          <span className="border-b border-orange pb-0.5">Solicitar cotação</span>
          <Arrow />
        </Link>
      </Reveal>
    </article>
  );
}
