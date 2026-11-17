import Image from "next/image";
import { HeroRoad } from "@/components/road/HeroRoad";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { site } from "@/config/site";

/**
 * Hero cinematográfica.
 *
 * Mídia final esperada: caminhão-baú fotorealista com a marca EMS aplicada na
 * lateral, em rodovia brasileira ao pôr do sol, enquadramento lateral-traseiro.
 * Configure em src/config/site.ts → hero.video (mp4/webm + poster) ou
 * hero.image. Enquanto nada for fornecido, exibe uma composição provisória
 * identificada como placeholder — sem simular um vídeo ou foto.
 *
 * Na base, uma faixa decorativa (sem textos) com a carreta EMS rodando numa
 * estrada sem fim, com paradas sorteadas: pedágio, posto e semáforo.
 */
export function Hero() {
  const { video, image } = site.hero;
  const hasMedia = Boolean(video || image);

  return (
    <section id="inicio" aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-navy-950 text-white">
      {/* mídia */}
      <div className="absolute inset-0 -z-10">
        {video ? (
          <video
            className="h-full w-full object-cover object-[70%_center]"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={video.poster}
            aria-hidden="true"
          >
            {video.webm && <source src={video.webm} type="video/webm" />}
            <source src={video.mp4} type="video/mp4" />
          </video>
        ) : image ? (
          <Image src={image.src} alt={image.alt} fill priority sizes="100vw" className="object-cover object-[70%_center]" />
        ) : (
          <HeroPlaceholder />
        )}
        {/* garantia de contraste para o texto */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/85 via-navy-950/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-navy-950/70 to-transparent" />
      </div>

      <div className="container-ems flex flex-1 flex-col justify-center pb-6 pt-24 sm:pb-10 sm:pt-32 lg:pb-12">
        <div className="max-w-[44rem]">
          <p data-header-trigger className="eyebrow hero-in text-orange" style={{ animationDelay: "80ms" }}>
            {site.eyebrow}
          </p>
          <h1 id="hero-title" className="hero-in mt-4 sm:mt-6 text-[2.6rem] font-extrabold leading-[1.04] text-white sm:text-6xl lg:text-[4.6rem]" style={{ animationDelay: "180ms" }}>
            Do planejamento à estrada.{" "}
            <span className="text-white/75">Logística que conecta negócios.</span>
          </h1>
          <p className="hero-in mt-5 max-w-xl text-base leading-relaxed sm:mt-7 sm:text-lg text-white/80 sm:text-xl" style={{ animationDelay: "300ms" }}>
            {site.description}
          </p>
          <div className="hero-in mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row" style={{ animationDelay: "420ms" }}>
            <ButtonLink href="/#cotacao" arrow>
              Solicitar uma cotação
            </ButtonLink>
            <ButtonLink href="/#solucoes" variant="ghost-light">
              Conheça nossas soluções
            </ButtonLink>
          </div>
        </div>
      </div>

      {/* faixa animada: carreta EMS na estrada. No celular a altura acompanha a
          largura (32vw), para a carreta caber inteira com cenário em volta. */}
      <div className="relative h-[min(clamp(150px,27svh,270px),32vw)] w-full shrink-0">
        <HeroRoad className="absolute inset-0" />

        {!hasMedia && site.showPendingMediaBadges && (
          <p className="absolute bottom-full right-8 mb-4 hidden max-w-xs rounded-xl bg-black/35 px-3.5 py-2.5 text-[11px] leading-snug text-white/75 ring-1 ring-white/15 backdrop-blur-sm lg:block">
            <strong className="font-semibold text-white">Mídia fotorealista pendente.</strong> Composição provisória — aguardando vídeo/foto do
            caminhão EMS ao pôr do sol.
          </p>
        )}
      </div>
    </section>
  );
}

/** Composição provisória: céu de fim de tarde, serras e rodovia em perspectiva. */
function HeroPlaceholder() {
  return (
    <div className="absolute inset-0 bg-navy-950" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="hp-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b1a38" />
            <stop offset="0.38" stopColor="#1c2f5c" />
            <stop offset="0.6" stopColor="#6b4a5c" />
            <stop offset="0.74" stopColor="#d07a3a" />
          </linearGradient>
          <radialGradient id="hp-sun" cx="1150" cy="650" r="520" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffd9a6" stopOpacity="0.95" />
            <stop offset="0.25" stopColor="#ffaa5c" stopOpacity="0.55" />
            <stop offset="1" stopColor="#f47c28" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hp-road" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2b2633" />
            <stop offset="1" stopColor="#07080d" />
          </linearGradient>
          <linearGradient id="hp-glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffd7a3" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffd7a3" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="-200" y="-100" width="2000" height="800" fill="url(#hp-sky)" />
        <rect x="-200" y="-100" width="2000" height="800" fill="url(#hp-sun)" />
        <rect x="-200" y="650" width="2000" height="400" fill="#120f18" />
        {/* sol */}
        <circle cx="1150" cy="640" r="62" fill="#ffe7c4" opacity="0.95" />
        {/* serras */}
        <path d="M0 640 L120 610 L260 628 L400 596 L560 622 L700 600 L860 630 L1000 606 L1180 634 L1320 612 L1480 630 L1600 618 V700 H0Z" fill="#3a2f45" opacity="0.85" />
        <path d="M0 662 L180 646 L340 660 L520 640 L720 658 L900 646 L1100 662 L1300 648 L1600 660 V700 H0Z" fill="#231d2c" />
        {/* rodovia em perspectiva */}
        <path d="M1090 658 L1210 658 L1600 900 L520 900Z" fill="url(#hp-road)" />
        <path d="M1150 658 L1155 658 L1135 900 L1100 900Z" fill="url(#hp-glow)" opacity="0.6" />
        {[0, 1, 2, 3, 4].map((i) => {
          const t0 = 0.08 + i * 0.2;
          const t1 = t0 + 0.09;
          const y = (t: number) => 658 + (900 - 658) * t * t;
          const x = (t: number) => 1152 - 40 * t * t;
          const w = (t: number) => 1.5 + 10 * t * t;
          return <path key={i} d={`M${x(t0) - w(t0)} ${y(t0)} L${x(t0) + w(t0)} ${y(t0)} L${x(t1) + w(t1)} ${y(t1)} L${x(t1) - w(t1)} ${y(t1)}Z`} fill="#f5e6d0" opacity="0.7" />;
        })}
        <path d="M0 700 H1600 V900 H0Z" fill="#0b0b12" opacity="0.35" />
      </svg>
    </div>
  );
}
