import { JourneyAnimation } from "@/components/journey/JourneyAnimation";
import { Reveal } from "@/components/ui/Reveal";

export function JourneySection() {
  return (
    <section id="jornada" aria-labelledby="jornada-title" className="bg-white">
      <div className="container-ems pb-10 pt-24 text-center md:pt-32">
        <Reveal>
          <p className="eyebrow text-orange-600">Jornada logística</p>
          <h2 id="jornada-title" className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-[1.08] sm:text-5xl">
            Cada caminho tem uma história.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate">
            Da origem ao destino, cada etapa representa uma parte importante da jornada logística.
          </p>
        </Reveal>
      </div>
      <div className="mx-auto w-full max-w-[1520px] px-3 pb-24 sm:px-5 md:px-8 md:pb-32">
        <JourneyAnimation />
        <p className="mt-6 text-center text-xs text-slate/80">
          Animação ilustrativa: as cenas representam etapas de uma operação logística e não descrevem serviços específicos.
        </p>
      </div>
    </section>
  );
}
