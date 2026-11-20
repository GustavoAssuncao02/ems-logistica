import Link from "next/link";
import { Arrow } from "@/components/ui/ButtonLink";
import { publicAsset } from "@/config/site";

export function CareersTeaser() {
  return (
    <section id="carreiras" aria-labelledby="carreiras-title" className="relative scroll-mt-20 bg-[#282521] text-white">
      <div className="relative aspect-[1150/771] overflow-hidden lg:aspect-[2039/771]">
        <img
          src={publicAsset("/media/trabalhe-conosco-escritorio.webp")}
          width={2039}
          height={771}
          loading="lazy"
          alt=""
          className="absolute right-0 top-0 h-full w-auto max-w-none"
        />
      </div>
      <div className="px-6 py-8 sm:px-10 lg:p-0">
        <div className="lg:sr-only">
          <p className="eyebrow flex items-center gap-3"><span aria-hidden="true" className="h-1 w-7 bg-orange" />Trabalhe conosco</p>
          <h2 id="carreiras-title" className="mt-4 max-w-xl text-4xl font-extrabold leading-tight">
            Seu próximo caminho pode começar <span className="text-orange">aqui.</span>
          </h2>
          <p className="mt-4 max-w-xl leading-relaxed">
            Envie seu currículo para a EMS Logística. Os perfis recebidos são avaliados conforme as necessidades da empresa.
          </p>
        </div>
        <Link
          href="/trabalhe-conosco"
          className="group mt-6 inline-flex items-center justify-center gap-3 rounded-full bg-[#ff8300] px-6 py-3 font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white lg:absolute lg:left-[6.08%] lg:top-[63.68%] lg:mt-0 lg:h-[10.25%] lg:w-[16.4%] lg:bg-transparent lg:p-0"
        >
          <span className="lg:sr-only">Enviar currículo</span>
          <Arrow className="lg:hidden" />
        </Link>
      </div>
    </section>
  );
}
