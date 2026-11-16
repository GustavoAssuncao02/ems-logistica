import Link from "next/link";
import type { ReactNode } from "react";
import { Arrow } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";
import { complementary } from "@/config/site";

const icons: Record<string, ReactNode> = {
  seguros: <path d="M12 3 5 6v5c0 4.4 3 8.3 7 9.5 4-1.2 7-5.1 7-9.5V6l-7-3Zm-3 9 2 2 4-4" />,
  consorcios: <path d="M4 20h16M6 16V10m4 6V10m4 6V10m4 6V10M3 8l9-5 9 5" />,
  credito: <path d="M3 7h18v10H3zM3 11h18M7 15h3" />,
  saude: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Zm-3-9h6m-3-3v6" />,
  contabilidade: <path d="M6 3h12v18H6zM9 7h6M9 11h1m2 0h1m2 0h0M9 14h1m2 0h1m2 0h0M9 17h1m2 0h3" />,
  juridico: <path d="M12 4v16M8 20h8M5 8h14M5 8l-2.5 6a3 3 0 0 0 5 0L5 8Zm14 0-2.5 6a3 3 0 0 0 5 0L19 8Z" />,
};

/** Soluções empresariais complementares — apresentação secundária e compacta. */
export function Complementary() {
  return (
    <section id="complementares" aria-labelledby="complementares-title" className="bg-white">
      <div className="container-ems py-24 md:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow text-orange-600">Soluções empresariais</p>
            <h2 id="complementares-title" className="mt-5 text-4xl font-extrabold leading-[1.08] sm:text-[2.75rem]">
              Soluções que acompanham o crescimento da sua empresa.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-slate">
              Além da logística, a EMS apoia empresas em outras frentes da gestão. Essas soluções são viabilizadas em conjunto com parceiros
              especializados.
            </p>
            <Link href="/contato" className="group mt-8 inline-flex items-center gap-2 font-semibold text-navy">
              <span className="border-b border-orange pb-0.5">Conversar sobre essas soluções</span>
              <Arrow />
            </Link>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-7">
            <ul className="grid gap-px overflow-hidden rounded-2xl bg-line ring-1 ring-line sm:grid-cols-2">
              {complementary.map((c) => (
                <li key={c.key} className="flex gap-4 bg-white p-6 transition hover:bg-mist">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy/[0.05] text-navy" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      {icons[c.key]}
                    </svg>
                  </span>
                  <div>
                    <h3 className="flex flex-wrap items-center gap-2 text-base font-bold">
                      {c.label}
                      {c.delivery === "parceiro" && (
                        <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-600">via parceiros</span>
                      )}
                    </h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-slate">{c.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs leading-relaxed text-slate">
              Condições, coberturas e disponibilidade dependem de análise de cada caso e das regras dos parceiros envolvidos. Nenhuma contratação é
              realizada pelo site.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
