import Link from "next/link";
import { EmsLogo } from "@/components/brand/EmsLogo";
import { nav, site, whatsappLink } from "@/config/site";

const solutions = [
  { href: "/#solucoes", label: "Logística" },
  { href: "/#solucoes", label: "Gestão de fretes" },
  { href: "/#solucoes", label: "Transporte rodoviário de cargas" },
  { href: "/#complementares", label: "Soluções empresariais" },
];

export function Footer() {
  const wa = whatsappLink();
  const year = new Date().getFullYear();
  const { contact } = site;

  return (
    <footer className="relative overflow-hidden bg-navy-950 text-white">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange/60 to-transparent" />
      <div className="container-ems grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:py-20">
        <div className="max-w-sm">
          <EmsLogo variant="inverse" className="h-16 w-auto" />
          <p className="mt-6 text-[15px] leading-relaxed text-white/70">{site.description}</p>
          <p className="mt-6 font-display text-lg font-semibold text-white">“{site.motto}”</p>
        </div>

        <nav aria-label="Rodapé — navegação">
          <h2 className="eyebrow text-white/50">Navegação</h2>
          <ul className="mt-5 space-y-3 text-[15px]">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-white/80 transition hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Rodapé — soluções">
          <h2 className="eyebrow text-white/50">Soluções</h2>
          <ul className="mt-5 space-y-3 text-[15px]">
            {solutions.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="text-white/80 transition hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/#cotacao" className="font-semibold text-orange transition hover:text-[#ff9b55]">
                Solicitar cotação
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="eyebrow text-white/50">Contato</h2>
          <ul className="mt-5 space-y-3 text-[15px]">
            {wa && (
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="text-white/80 transition hover:text-white">
                  WhatsApp {contact.whatsappDisplay}
                </a>
              </li>
            )}
            {contact.email && (
              <li>
                <a href={`mailto:${contact.email}`} className="text-white/80 transition hover:text-white">
                  {contact.email}
                </a>
              </li>
            )}
            <li>
              <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white/80 transition hover:text-white">
                <InstagramIcon />
                {contact.instagramHandle}
              </a>
            </li>
            <li>
              <Link href="/contato" className="text-white/80 transition hover:text-white">
                Formulário de contato
              </Link>
            </li>
            <li>
              <Link href="/trabalhe-conosco" className="text-white/80 transition hover:text-white">
                Trabalhe conosco
              </Link>
            </li>
            {contact.address && <li className="text-white/60">{contact.address}</li>}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-ems flex flex-col gap-3 py-6 text-[13px] text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. Todos os direitos reservados.
          </p>
          <Link href="/politica-de-privacidade" className="transition hover:text-white">
            Política de Privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
