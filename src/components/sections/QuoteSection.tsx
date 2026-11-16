import { InstagramIcon } from "@/components/layout/Footer";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { Reveal } from "@/components/ui/Reveal";
import { site, whatsappLink } from "@/config/site";

/** Seção de cotação (#cotacao) — usada na home e em /cotacao. */
export function QuoteSection({ headingLevel = "h2" }: { headingLevel?: "h1" | "h2" }) {
  const Heading = headingLevel;
  const wa = whatsappLink();
  return (
    <section id="cotacao" aria-labelledby="cotacao-title" className="bg-mist">
      <div className="container-ems grid gap-12 py-24 md:py-32 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow text-orange-600">Solicitar cotação</p>
            <Heading id="cotacao-title" className="mt-5 text-4xl font-extrabold leading-[1.08] sm:text-5xl">
              Sua próxima operação começa com uma conversa.
            </Heading>
            <p className="mt-6 text-lg leading-relaxed text-slate">
              Conte como funciona a sua operação. A equipe da EMS Logística analisa as informações e retorna com uma proposta de caminho.
            </p>
            <ul className="mt-10 space-y-4 text-[15px] text-navy">
              {[
                "Os campos de rota e carga aparecem conforme o serviço escolhido.",
                "Não calculamos preços automaticamente: cada operação é analisada.",
                "Seus dados são usados apenas para o retorno desta solicitação.",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy underline-offset-4 hover:underline">
                  Prefere o WhatsApp? {site.contact.whatsappDisplay}
                </a>
              )}
              <a
                href={site.contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-medium text-slate transition hover:text-navy"
              >
                <InstagramIcon />
                {site.contact.instagramHandle}
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120} className="lg:col-span-7">
          <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_30px_80px_-50px_rgba(22,47,96,0.55)] ring-1 ring-line sm:p-10">
            <QuoteForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
