import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { site } from "@/config/site";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Logística, gestão de fretes e transporte rodoviário`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "logística",
    "gestão de fretes",
    "negociação de fretes",
    "transporte rodoviário de cargas",
    "armazenagem",
    "cross-docking",
    "EMS Logística",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: "/",
    siteName: site.name,
    title: `${site.name} — Do planejamento à estrada`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Do planejamento à estrada`,
    description: site.description,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#162F60",
  width: "device-width",
  initialScale: 1,
};

/**
 * Executado antes da renderização: num recarregamento (F5), remove a âncora
 * da URL e desliga a restauração de rolagem só para esse carregamento, para a
 * página abrir no topo. Navegação normal e voltar/avançar não são afetados.
 */
const RELOAD_TO_TOP = `(function(){try{
var n=performance.getEntriesByType("navigation")[0];
if(!n||n.type!=="reload")return;
var h=window.history;
if(location.hash)h.replaceState(h.state,"",location.pathname+location.search);
if("scrollRestoration" in h)h.scrollRestoration="manual";
window.scrollTo(0,0);
window.addEventListener("load",function(){window.scrollTo(0,0);setTimeout(function(){window.scrollTo(0,0);if("scrollRestoration" in h)h.scrollRestoration="auto";},50);});
}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} ${inter.variable}`}>
      <body>
        {/* recarregar a página sempre volta ao topo, sem a âncora na URL (ex.: /#solucoes → /) */}
        <script dangerouslySetInnerHTML={{ __html: RELOAD_TO_TOP }} />
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-navy focus:shadow-lg"
        >
          Pular para o conteúdo
        </a>
        <Header />
        {children}
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
