import { publicAsset } from "@/config/site";

const steps = [
  { title: "Conte-nos sobre sua operação.", text: "Envie a solicitação com as informações principais pelo formulário.", icon: "M4 4h16v13H9l-5 4z M8 10h1m3 0h1m3 0h1" },
  { title: "Compartilhe suas necessidades.", text: "Detalhe rotas, cargas, frequência e os objetivos da operação.", icon: "M5 3h14v18H5z M8 8l1 1 2-2m2 1h3m-8 6 1 1 2-2m2 1h3" },
  { title: "Receba um retorno comercial.", text: "A equipe da EMS analisa as informações e entra em contato.", icon: "M4 14v-3a8 8 0 0 1 16 0v5a4 4 0 0 1-4 4h-3 M4 12h3v6H4z M17 12h3v6h-3z" },
  { title: "Alinhe a solução adequada.", text: "Juntos, definimos o caminho mais adequado para a sua operação.", icon: "M20 11a8 8 0 1 1-5-7 M8 11l4 4 9-11" },
];

export function Process() {
  const scene = publicAsset("/media/processo-logistico-lua.webp");

  return (
    <section aria-labelledby="processo-title" className="bg-[#0d1c2e] text-white">
      <img src={scene} alt="" width={2011} height={782} loading="lazy" className="hidden h-auto w-full xl:block" />
      <div className="xl:sr-only">
        <div aria-hidden="true" className="relative aspect-[951/430] overflow-hidden xl:hidden">
          <img src={scene} alt="" loading="lazy" width={2011} height={782} className="absolute right-0 top-0 h-auto w-[211.46%] max-w-none" />
        </div>
        <div className="mx-auto max-w-4xl px-6 py-10 sm:px-10">
          <p className="eyebrow flex items-center gap-3 text-orange"><span aria-hidden="true" className="h-px w-8 bg-orange" />Como funciona</p>
          <h2 id="processo-title" className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl">Um processo claro, da primeira conversa à solução.</h2>
          <ol className="mt-8 grid gap-7 sm:grid-cols-2">
            {steps.map((step, index) => (
              <li key={step.title} className="border-t border-white/25 pt-4">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-orange font-bold text-navy">{index + 1}</span>
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="size-7 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={step.icon} /></svg>
                  <h3 className="text-lg font-bold leading-tight">{step.title}</h3>
                </div>
                <p className="mt-3 leading-relaxed text-white/80">{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 border-t border-white/20 pt-5 text-sm leading-relaxed text-white/75">O atendimento é conduzido em contato direto com a equipe. Não há contratação automática nem preço instantâneo pelo site.</p>
        </div>
      </div>
    </section>
  );
}
