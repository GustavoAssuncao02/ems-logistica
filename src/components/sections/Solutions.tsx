import Link from "next/link";
import { Arrow } from "@/components/ui/ButtonLink";
import { MediaSlot } from "@/components/ui/MediaSlot";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Soluções principais em composição editorial (texto/imagem alternados).
 * Textos são propostas editáveis — revisar afirmações específicas com a EMS.
 * Para usar fotografias reais, preencha `image` com um caminho em /public.
 */
const items = [
  {
    n: "01",
    label: "Logística",
    title: "Logística que acompanha as necessidades da sua operação.",
    text: "Planejamento, organização e eficiência para operações que envolvem transporte, armazenagem e movimentação de cargas — considerando estratégias como o cross-docking quando fazem sentido para o fluxo da empresa.",
    points: ["Planejamento operacional", "Armazenagem", "Cross-docking", "Movimentação de cargas"],
    image: null as string | null,
    brief: "galpão logístico com docas e paletes",
  },
  {
    n: "02",
    label: "Gestão de fretes",
    title: "Fretes planejados. Decisões mais inteligentes.",
    text: "Análise e negociação de fretes, avaliação de condições comerciais e organização da operação, para que cada embarque seja decidido com mais informação e menos improviso.",
    points: ["Análise de fretes", "Negociação", "Condições comerciais", "Organização da operação"],
    image: null as string | null,
    brief: "planejamento de rotas e custos de frete",
  },
  {
    n: "03",
    label: "Transporte rodoviário de cargas",
    title: "Conectando operações aos seus destinos.",
    text: "Soluções em transporte rodoviário de cargas estruturadas a partir das características de cada operação: origem e destino, tipo de carga, volume e frequência.",
    points: ["Origem e destino", "Tipo e volume de carga", "Frequência da operação"],
    image: null as string | null,
    brief: "caminhão-baú em rodovia brasileira",
  },
];

export function Solutions() {
  return (
    <section id="solucoes" aria-labelledby="solucoes-title" className="bg-mist">
      <div className="container-ems py-24 md:py-32">
        <Reveal className="grid gap-8 border-b border-line pb-14 md:grid-cols-2 md:items-end">
          <div>
            <p className="eyebrow text-orange-600">Soluções</p>
            <h2 id="solucoes-title" className="mt-5 text-4xl font-extrabold leading-[1.08] sm:text-5xl">
              Três frentes. Uma mesma visão de operação.
            </h2>
          </div>
          <p className="max-w-lg text-lg leading-relaxed text-slate md:justify-self-end">
            Logística, fretes e transporte tratados de forma conectada — do planejamento às decisões do dia a dia.
          </p>
        </Reveal>

        <div className="divide-y divide-line">
          {items.map((item, i) => {
            const flip = i % 2 === 1;
            return (
              <article key={item.n} className="grid items-center gap-10 py-16 md:py-24 lg:grid-cols-12 lg:gap-16" aria-labelledby={`sol-${item.n}`}>
                <Reveal className={`lg:col-span-6 ${flip ? "lg:order-2" : ""}`}>
                  <MediaSlot
                    src={item.image}
                    alt={`Fotografia ilustrativa — ${item.label}`}
                    brief={item.brief}
                    className="aspect-[4/3] rounded-[1.75rem] shadow-[0_30px_60px_-40px_rgba(22,47,96,0.6)] lg:aspect-[5/4]"
                    tone={flip ? "mist" : "navy"}
                  >
                    <span className={`font-display text-[9rem] font-extrabold leading-none tracking-tighter sm:text-[12rem] ${flip ? "text-navy/[0.07]" : "text-white/[0.08]"}`} aria-hidden="true">
                      {item.n}
                    </span>
                  </MediaSlot>
                </Reveal>
                <Reveal delay={120} className={`lg:col-span-6 ${flip ? "lg:order-1 lg:pr-6" : "lg:pl-6"}`}>
                  <p className="flex items-center gap-3 font-display text-sm font-bold text-navy">
                    <span className="text-orange-600">{item.n}</span>
                    <span aria-hidden="true" className="h-px w-8 bg-navy/25" />
                    <span className="uppercase tracking-[0.16em]">{item.label}</span>
                  </p>
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
          })}
        </div>
      </div>
    </section>
  );
}
