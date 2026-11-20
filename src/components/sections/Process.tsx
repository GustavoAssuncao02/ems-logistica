import { publicAsset } from "@/config/site";

const steps = [
  { title: "Conte-nos sobre sua operação.", text: "Envie a solicitação com as informações principais pelo formulário." },
  { title: "Compartilhe suas necessidades.", text: "Detalhe rotas, cargas, frequência e os objetivos da operação." },
  { title: "Receba um retorno comercial.", text: "A equipe da EMS analisa as informações e entra em contato." },
  { title: "Alinhe a solução adequada.", text: "Juntos, definimos o caminho mais adequado para a sua operação." },
];

export function Process() {
  const scene = publicAsset("/media/processo-logistico-lua.webp");

  return (
    <section aria-labelledby="processo-title" className="bg-[#0d1c2e] text-white">
      <img src={scene} alt="" width={2011} height={782} loading="lazy" className="hidden h-auto w-full xl:block" />
      <div className="xl:sr-only">
        <div className="relative h-[clamp(9rem,43vw,16rem)] overflow-hidden xl:hidden">
          <img src={publicAsset("/media/processo-mobile.webp")} alt="" loading="lazy" width={951} height={429} className="h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-linear-to-t from-[#0d1c2e] via-transparent to-transparent" />
        </div>
        <div className="relative mx-auto -mt-4 max-w-2xl px-5 pb-10 sm:px-8">
          <p className="eyebrow flex items-center gap-3 text-orange"><span aria-hidden="true" className="h-px w-7 bg-orange" />Como funciona</p>
          <h2 id="processo-title" className="mt-3 max-w-lg text-[clamp(1.65rem,6.6vw,2.5rem)] font-extrabold leading-[1.12] text-white">Um processo claro, da primeira conversa à solução.</h2>
          <ol className="mt-7">
            {steps.map((step, index) => (
              <li key={step.title} className="group relative grid grid-cols-[1.875rem_1fr] gap-x-4 pb-5 last:pb-0">
                <span aria-hidden="true" className="absolute bottom-0 left-[14px] top-7 w-px bg-white/20 group-last:hidden" />
                <span aria-hidden="true" className="grid size-[1.875rem] place-items-center rounded-full bg-orange text-sm font-bold text-navy">{index + 1}</span>
                <div className="pt-0.5">
                  <h3 className="text-lg font-bold leading-tight text-white">{step.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-slate-300">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 border-t border-white/15 pt-4 text-sm leading-relaxed text-slate-300">O atendimento é conduzido em contato direto com a equipe. Não há contratação automática nem preço instantâneo pelo site.</p>
        </div>
      </div>
    </section>
  );
}
