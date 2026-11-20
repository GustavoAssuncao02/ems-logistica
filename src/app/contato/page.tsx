import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/forms/ContactForm";
import { FormUnavailable } from "@/components/forms/FormUnavailable";
import { InstagramIcon } from "@/components/layout/Footer";
import { PageIntro } from "@/components/sections/PageIntro";
import { pagesBuild, site, whatsappLink } from "@/config/site";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a EMS Logística sobre logística, gestão de fretes e transporte rodoviário de cargas.",
  alternates: { canonical: "/contato" },
};

export default function ContatoPage() {
  const wa = whatsappLink();
  const { contact } = site;
  return (
    <main id="conteudo">
      <PageIntro eyebrow="Contato" title="Vamos conversar sobre a sua operação.">
        <p>{pagesBuild ? "Conheça os canais de contato da EMS Logística." : "Envie sua mensagem pelo formulário ou fale com a EMS pelos canais oficiais."}</p>
      </PageIntro>
      <section className="bg-white" aria-label="Canais de contato">
        <div className="container-ems grid gap-12 py-16 md:py-24 lg:grid-cols-12 lg:gap-16">
          <aside className="space-y-8 lg:col-span-4">
            <div>
              <h2 className="eyebrow text-slate">Canais</h2>
              <ul className="mt-5 space-y-4 text-[15px]">
                {wa && (
                  <li>
                    <a href={wa} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy hover:underline">
                      WhatsApp {contact.whatsappDisplay}
                    </a>
                  </li>
                )}
                {contact.email && (
                  <li>
                    <a href={`mailto:${contact.email}`} className="font-semibold text-navy hover:underline">
                      {contact.email}
                    </a>
                  </li>
                )}
                {contact.instagram && (
                <li>
                  <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-navy hover:underline">
                    <InstagramIcon />
                    {contact.instagramHandle}
                  </a>
                </li>
                )}
                {contact.address && <li className="text-slate">{contact.address}</li>}
              </ul>
            </div>
            <div className="rounded-2xl bg-mist p-6 ring-1 ring-line">
              <h2 className="text-lg font-bold">Precisa de uma cotação?</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-slate">O formulário de cotação reúne as informações de rota, carga e frequência.</p>
              <Link href="/#cotacao" className="mt-4 inline-flex rounded-full bg-orange px-5 py-2.5 text-sm font-bold text-navy transition hover:bg-[#ff8d3f]">
                Solicitar cotação
              </Link>
            </div>
          </aside>
          <div className="lg:col-span-8">
            <div className="rounded-[1.75rem] bg-white p-6 ring-1 ring-line sm:p-10 lg:shadow-[0_30px_80px_-50px_rgba(22,47,96,0.45)]">
              {pagesBuild ? <FormUnavailable /> : <ContactForm />}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
