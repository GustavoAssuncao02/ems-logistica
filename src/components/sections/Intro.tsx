import { RoadScene } from "@/components/scenes/RoadScene";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Transição da hero para a superfície clara: mapa com a rota planejada e a
 * estrada por onde a carreta avança conforme a página rola.
 */
export function Intro() {
  return (
    <section id="operacao" aria-labelledby="intro-title" className="relative bg-[#eef2f8]">
      <RoadScene>
        <div className="container-ems">
          <Reveal className="max-w-xl lg:max-w-[min(54%,46rem)]">
            <p className="eyebrow flex items-center gap-4 text-orange-600">
              Visão de operação
              <span aria-hidden="true" className="h-px w-16 bg-orange sm:w-24" />
            </p>
            <h2 id="intro-title" className="mt-4 text-[2.15rem] font-extrabold leading-[1.04] sm:text-5xl lg:mt-6 lg:text-[clamp(2.75rem,4.3vw,4.75rem)]">
              A estrada é apenas uma parte da operação<span className="text-orange">.</span>
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-[#4b5872] sm:text-lg lg:mt-6 lg:max-w-[32rem] lg:text-[clamp(1.125rem,1.45vw,1.5rem)]">
              Planejamento, gestão e decisões ao longo do processo fazem a diferença.
            </p>
          </Reveal>
        </div>
      </RoadScene>
    </section>
  );
}
