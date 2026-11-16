import { Reveal } from "@/components/ui/Reveal";

/** Transição da hero para a superfície clara. */
export function Intro() {
  return (
    <section id="operacao" aria-labelledby="intro-title" className="relative bg-white">
      <div className="container-ems grid gap-10 py-24 md:py-32 lg:grid-cols-12 lg:gap-12 lg:py-40">
        <Reveal className="lg:col-span-8">
          <p className="eyebrow text-orange-600">Visão de operação</p>
          <h2 id="intro-title" className="mt-6 text-4xl font-extrabold leading-[1.06] sm:text-5xl lg:text-[4rem]">
            A estrada é apenas uma parte da operação.
          </h2>
        </Reveal>
        <Reveal delay={150} className="flex items-end lg:col-span-4">
          <div>
            <span aria-hidden="true" className="mb-6 block h-px w-16 bg-orange" />
            <p className="text-xl leading-relaxed text-slate md:text-2xl md:leading-relaxed">
              Planejamento, gestão e decisões ao longo do processo fazem a diferença.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
