import type { Metadata } from "next";
import { QuoteSection } from "@/components/sections/QuoteSection";

export const metadata: Metadata = {
  title: "Solicitar cotação",
  description: "Solicite uma cotação de logística, gestão de fretes ou transporte rodoviário de cargas com a EMS Logística.",
  alternates: { canonical: "/cotacao" },
};

export default function CotacaoPage() {
  return (
    <main id="conteudo" className="pt-12">
      <QuoteSection headingLevel="h1" />
    </main>
  );
}
