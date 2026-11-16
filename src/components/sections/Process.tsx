import { Reveal } from "@/components/ui/Reveal";

const steps = [
  { title: "Conte-nos sobre sua operação.", text: "Envie a solicitação com as informações principais pelo formulário." },
  { title: "Compartilhe suas necessidades.", text: "Detalhe rotas, cargas, frequência e os objetivos da operação." },
  { title: "Receba um retorno comercial.", text: "A equipe da EMS analisa as informações e entra em contato." },
  { title: "Alinhe a solução adequada.", text: "Juntos, definimos o caminho mais adequado para a sua operação." },
];

/** Linha editorial do processo de atendimento (fluxo de contato). */
export function Process() {
  return (
    <section aria-labelledby="processo-title" className="bg-navy text-white">
      <div className="container-ems py-24 md:py-32">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-orange">Como funciona</p>
          <h2 id="processo-title" className="mt-5 text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl">
            Um processo claro, da primeira conversa à solução.
          </h2>
        </Reveal>

        <div className="relative mt-16 lg:mt-20">
        <span aria-hidden="true" className="absolute left-0 right-0 top-[1.15rem] hidden h-px bg-white/15 lg:block" />
        <ol className="relative grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 110} className="relative">
              <span className="relative z-10 grid h-9 w-9 place-items-center rounded-full bg-orange font-display text-sm font-extrabold text-navy ring-8 ring-navy">
                {i + 1}
              </span>
              <h3 className="mt-6 text-xl font-bold leading-snug text-white">{s.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-white/65">{s.text}</p>
            </Reveal>
          ))}
        </ol>
        </div>

        <p className="mt-16 max-w-2xl text-sm leading-relaxed text-white/50">
          O atendimento é conduzido em contato direto com a equipe. Não há contratação automática nem preço instantâneo pelo site.
        </p>
      </div>
    </section>
  );
}
