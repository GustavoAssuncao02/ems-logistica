import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageIntro } from "@/components/sections/PageIntro";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como a EMS Logística trata os dados pessoais recebidos pelo site, conforme a LGPD.",
  alternates: { canonical: "/politica-de-privacidade" },
};

/**
 * MODELO de política de privacidade (LGPD — Lei nº 13.709/2018).
 * Os trechos marcados com [a confirmar] dependem de dados oficiais da empresa
 * e devem ser revisados por profissional jurídico antes da publicação.
 */
function Pending({ children }: { children: ReactNode }) {
  return <mark className="rounded bg-orange-50 px-1 text-orange-600">{children}</mark>;
}

export default function PrivacyPage() {
  const updated = "[a confirmar]";
  return (
    <main id="conteudo">
      <PageIntro eyebrow="LGPD" title="Política de Privacidade">
        <p>
          Este documento explica como a {site.name} trata os dados pessoais enviados pelos formulários deste site, em conformidade com a Lei Geral de
          Proteção de Dados (Lei nº 13.709/2018).
        </p>
      </PageIntro>

      <article className="bg-white">
        <div className="container-ems py-16 md:py-24">
          <div className="mx-auto max-w-3xl space-y-12 text-[16px] leading-relaxed text-slate [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-navy [&_li]:mt-2 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5">
            <p className="rounded-2xl bg-mist p-5 text-sm ring-1 ring-line">
              Última atualização: <Pending>{updated}</Pending>. Trechos destacados aguardam confirmação de dados oficiais da empresa.
            </p>

            <section>
              <h2>1. Quem é o controlador dos dados</h2>
              <p>
                {site.name} — razão social <Pending>[a confirmar]</Pending>, CNPJ <Pending>[a confirmar]</Pending>, endereço{" "}
                <Pending>[a confirmar]</Pending>.
              </p>
            </section>

            <section>
              <h2>2. Quais dados coletamos</h2>
              <ul>
                <li>
                  <strong className="text-navy">Cotação:</strong> nome, empresa, e-mail, WhatsApp, serviço de interesse e, quando aplicável, origem,
                  destino, tipo de carga, peso aproximado, frequência e observações.
                </li>
                <li>
                  <strong className="text-navy">Contato:</strong> nome, e-mail, telefone (opcional) e mensagem.
                </li>
                <li>
                  <strong className="text-navy">Trabalhe conosco:</strong> nome, e-mail, telefone, cidade, área de interesse, currículo em PDF e mensagem
                  opcional.
                </li>
                <li>
                  <strong className="text-navy">Dados técnicos:</strong> endereço IP, usado de forma temporária para limitar envios automatizados
                  (proteção contra spam).
                </li>
              </ul>
            </section>

            <section>
              <h2>3. Para que usamos os dados</h2>
              <ul>
                <li>Responder solicitações de cotação e contato.</li>
                <li>Avaliar candidaturas enviadas pela página Trabalhe conosco.</li>
                <li>Proteger o site contra abusos e envios automatizados.</li>
              </ul>
              <p>Não vendemos dados pessoais nem os utilizamos para finalidades diferentes das informadas.</p>
            </section>

            <section>
              <h2>4. Bases legais</h2>
              <p>
                O tratamento se apoia no consentimento do titular (art. 7º, I), em procedimentos preliminares relacionados a contrato a pedido do titular
                (art. 7º, V) e no legítimo interesse para a segurança do site (art. 7º, IX), conforme cada caso.
              </p>
            </section>

            <section>
              <h2>5. Compartilhamento</h2>
              <p>
                Os dados enviados pelos formulários são transmitidos por e-mail à equipe responsável, por meio do provedor de envio de e-mails{" "}
                <Pending>[a confirmar]</Pending>. Quando a solicitação envolver soluções viabilizadas por parceiros, os dados só serão compartilhados com o
                parceiro necessário ao atendimento e com a ciência do titular.
              </p>
            </section>

            <section>
              <h2>6. Currículos</h2>
              <p>
                Currículos são recebidos apenas em PDF, enviados de forma restrita à equipe responsável e não ficam disponíveis em endereços públicos. O
                prazo de guarda é de <Pending>[a confirmar]</Pending>, após o qual os arquivos são excluídos.
              </p>
            </section>

            <section>
              <h2>7. Por quanto tempo guardamos</h2>
              <p>
                Os dados são mantidos pelo tempo necessário para atender à solicitação e cumprir obrigações legais, pelo prazo de{" "}
                <Pending>[a confirmar]</Pending>.
              </p>
            </section>

            <section>
              <h2>8. Seus direitos</h2>
              <p>
                Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, portabilidade, eliminação dos dados e revogação do
                consentimento, nos termos do art. 18 da LGPD.
              </p>
            </section>

            <section>
              <h2>9. Encarregado e canal de atendimento</h2>
              <p>
                Encarregado (DPO): <Pending>[a confirmar]</Pending>. Solicitações sobre dados pessoais: <Pending>[e-mail a confirmar]</Pending> ou pela
                página de{" "}
                <Link href="/contato" className="font-medium text-navy underline underline-offset-2">
                  contato
                </Link>
                .
              </p>
            </section>

            <section>
              <h2>10. Cookies</h2>
              <p>
                Este site não utiliza cookies de publicidade nem ferramentas de rastreamento de terceiros. Caso ferramentas de análise sejam adicionadas,
                esta política será atualizada.
              </p>
            </section>
          </div>
        </div>
      </article>
    </main>
  );
}
