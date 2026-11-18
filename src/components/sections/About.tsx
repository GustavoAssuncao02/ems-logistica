import { BrandReveal } from "@/components/scenes/BrandReveal";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/config/site";

const pillars = [
  { title: "Planejamento", text: "Entender a operação antes de decidir o caminho." },
  { title: "Organização", text: "Processos e informações claros em cada etapa." },
  { title: "Desenvolvimento", text: "Decisões que acompanham o crescimento do cliente." },
];

export function About() {
  return (
    <section id="sobre" aria-labelledby="sobre-title" className="bg-mist">
      <div className="container-ems grid gap-14 py-24 md:py-32 lg:grid-cols-12 lg:items-center lg:gap-20">
        <div className="lg:col-span-5">
          <BrandReveal className="aspect-[4/5] rounded-[1.75rem] shadow-[0_30px_60px_-36px_rgba(11,26,56,0.7)] sm:aspect-[5/4] lg:aspect-[4/5]" />
        </div>

        <div className="lg:col-span-7">
          <Reveal>
            <p className="eyebrow text-orange-600">A EMS</p>
            <h2 id="sobre-title" className="mt-5 text-4xl font-extrabold leading-[1.08] sm:text-5xl">
              Muito além do transporte. Uma visão completa da operação logística.
            </h2>
            <p className="mt-7 text-lg leading-relaxed text-slate">
              A EMS Logística atua em logística, gestão de fretes e transporte rodoviário de cargas, com foco em planejamento,
              organização e eficiência nas operações de seus clientes.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-line ring-1 ring-line sm:grid-cols-3">
              {pillars.map((p) => (
                <li key={p.title} className="bg-white p-6">
                  <span aria-hidden="true" className="block h-0.5 w-7 bg-orange" />
                  <h3 className="mt-5 text-lg font-bold">{p.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate">{p.text}</p>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={200}>
            <figure className="mt-12 border-l-2 border-orange pl-6">
              <blockquote className="font-display text-2xl font-bold leading-snug text-navy sm:text-3xl">“{site.motto}”</blockquote>
              <figcaption className="mt-3 text-sm text-slate">Princípio que orienta a comunicação da EMS</figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
