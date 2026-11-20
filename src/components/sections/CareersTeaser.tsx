import Link from "next/link";
import { Arrow } from "@/components/ui/ButtonLink";
import { publicAsset } from "@/config/site";

export function CareersTeaser() {
  return (
    <section id="carreiras" aria-labelledby="carreiras-title" className="relative scroll-mt-20 bg-[#201e1c] text-white">
      <div className="relative h-[clamp(12rem,56vw,20rem)] overflow-hidden lg:h-auto lg:aspect-[2039/771]">
        <picture><source media="(max-width: 63.999rem)" srcSet={publicAsset("/media/carreiras-mobile.webp")} />
        <img
          src={publicAsset("/media/trabalhe-conosco-escritorio.webp")}
          width={2039}
          height={771}
          loading="lazy"
          alt=""
          className="h-full w-full object-cover object-center lg:object-fill"
        /></picture>
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-[#201e1c] via-transparent to-transparent lg:hidden" />
      </div>
      <div className="relative mx-auto -mt-5 max-w-2xl px-5 pb-10 sm:px-8 lg:static lg:m-0 lg:max-w-none lg:p-0">
        <div className="lg:sr-only">
          <p className="eyebrow flex items-center gap-3"><span aria-hidden="true" className="h-1 w-7 bg-orange" />Trabalhe conosco</p>
          <h2 id="carreiras-title" className="mt-3 max-w-lg text-[clamp(1.85rem,7.3vw,2.75rem)] font-extrabold leading-[1.09] text-white">
            Seu próximo caminho pode começar <span className="text-orange">aqui.</span>
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-stone-200">
            Envie seu currículo para a EMS Logística. Os perfis recebidos são avaliados conforme as necessidades da empresa.
          </p>
        </div>
        <Link
          href="/trabalhe-conosco"
          className="group mt-6 inline-flex items-center justify-center gap-3 rounded-full bg-[#ff8300] min-h-12 px-6 py-3 font-bold text-[#241c12] lg:min-h-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white lg:absolute lg:left-[6.08%] lg:top-[63.68%] lg:mt-0 lg:h-[10.25%] lg:w-[16.4%] lg:bg-transparent lg:p-0"
        >
          <span className="lg:sr-only">Enviar currículo</span>
          <Arrow className="lg:hidden" />
        </Link>
      </div>
    </section>
  );
}
