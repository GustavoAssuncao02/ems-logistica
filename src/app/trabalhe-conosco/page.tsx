import type { Metadata } from "next";
import { CareersForm } from "@/components/forms/CareersForm";
import { FormUnavailable } from "@/components/forms/FormUnavailable";
import { PageIntro } from "@/components/sections/PageIntro";
import { pagesBuild } from "@/config/site";

export const metadata: Metadata = {
  title: "Trabalhe conosco",
  description: "Envie seu currículo para a EMS Logística.",
  alternates: { canonical: "/trabalhe-conosco" },
};

const notes = [
  { title: "Formato", text: "Currículo em PDF com até 5 MB." },
  { title: "Privacidade", text: "O arquivo é encaminhado de forma restrita à equipe responsável e não fica disponível em links públicos." },
  { title: "Avaliação", text: "Os perfis recebidos são avaliados conforme as necessidades da empresa. Não há vagas específicas divulgadas nesta página." },
];

export default function TrabalheConoscoPage() {
  return (
    <main id="conteudo">
      <PageIntro eyebrow="Trabalhe conosco" title="Seu próximo caminho pode começar aqui.">
        <p>Quer construir sua trajetória em logística e gestão?{!pagesBuild && " Envie seu currículo para a EMS Logística."}</p>
      </PageIntro>
      <section className="bg-white" aria-label="Envio de currículo">
        <div className="container-ems grid gap-12 py-16 md:py-24 lg:grid-cols-12 lg:gap-16">
          <aside className="lg:col-span-4">
            <ul className="space-y-8">
              {notes.map((n) => (
                <li key={n.title}>
                  <span aria-hidden="true" className="block h-0.5 w-7 bg-orange" />
                  <h2 className="mt-4 text-lg font-bold">{n.title}</h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate">{n.text}</p>
                </li>
              ))}
            </ul>
          </aside>
          <div className="lg:col-span-8">
            <div className="rounded-[1.75rem] bg-white p-6 ring-1 ring-line sm:p-10 lg:shadow-[0_30px_80px_-50px_rgba(22,47,96,0.45)]">
              {pagesBuild ? <FormUnavailable /> : <CareersForm />}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
