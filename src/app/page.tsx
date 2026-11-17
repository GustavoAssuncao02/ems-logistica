import { About } from "@/components/sections/About";
import { CareersTeaser } from "@/components/sections/CareersTeaser";
import { Hero } from "@/components/sections/Hero";
import { Intro } from "@/components/sections/Intro";
import { Process } from "@/components/sections/Process";
import { QuoteSection } from "@/components/sections/QuoteSection";
import { Solutions } from "@/components/sections/Solutions";
import { site } from "@/config/site";

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    description: site.description,
    logo: `${site.url}/brand/ems-monogram.svg`,
    ...(site.contact.instagram ? { sameAs: [site.contact.instagram] } : {}),
    slogan: site.tagline,
  };

  return (
    <main id="conteudo">
      <Hero />
      <Intro />
      <Solutions />
      <About />
      <Process />
      <QuoteSection />
      <CareersTeaser />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </main>
  );
}
