import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";

export function CareersTeaser() {
  return (
    <section aria-labelledby="carreiras-title" className="bg-white">
      <div className="container-ems py-20 md:py-28">
        <Reveal className="relative overflow-hidden rounded-[2rem] bg-navy px-7 py-14 text-white sm:px-12 md:px-16 md:py-20">
          <svg aria-hidden="true" className="absolute -right-10 bottom-0 h-full w-2/3 opacity-60" viewBox="0 0 600 300" preserveAspectRatio="xMaxYMax meet">
            <path d="M0 290 C 160 280, 240 200, 330 190 S 520 120, 600 20" fill="none" stroke="#F47C28" strokeWidth="2" strokeDasharray="2 10" strokeLinecap="round" />
            <circle cx="600" cy="20" r="6" fill="#F47C28" />
          </svg>
          <div className="relative grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-end">
            <div>
              <p className="eyebrow text-orange">Trabalhe conosco</p>
              <h2 id="carreiras-title" className="mt-5 text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl">
                Seu próximo caminho pode começar aqui.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
                Envie seu currículo para a EMS Logística. Os perfis recebidos são avaliados conforme as necessidades da empresa.
              </p>
            </div>
            <div className="md:justify-self-end">
              <ButtonLink href="/trabalhe-conosco" arrow>
                Enviar currículo
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
