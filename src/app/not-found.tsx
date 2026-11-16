import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/ButtonLink";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main id="conteudo" className="flex min-h-[80svh] items-center bg-mist">
      <div className="container-ems grid gap-12 pb-20 pt-36 md:grid-cols-2 md:items-center">
        <div>
          <p className="eyebrow text-orange-600">Erro 404</p>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.06] sm:text-6xl">Esta rota saiu do mapa.</h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-slate">
            A página que você procura não existe ou mudou de endereço. Que tal voltar para o início da jornada?
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/" arrow>
              Voltar ao início
            </ButtonLink>
            <ButtonLink href="/contato" variant="outline">
              Falar com a EMS
            </ButtonLink>
          </div>
        </div>
        <svg viewBox="0 0 480 260" className="w-full max-w-lg justify-self-center" aria-hidden="true">
          <path d="M0 200 H140" stroke="#162F60" strokeWidth="3" strokeLinecap="round" />
          <path d="M140 200 C 200 200, 220 120, 290 120" fill="none" stroke="#162F60" strokeWidth="3" strokeDasharray="2 12" strokeLinecap="round" />
          <circle cx="140" cy="200" r="8" fill="#162F60" />
          <circle cx="330" cy="120" r="34" fill="none" stroke="#F47C28" strokeWidth="3" />
          <path d="M318 108 342 132M342 108 318 132" stroke="#F47C28" strokeWidth="3" strokeLinecap="round" />
          <text x="0" y="245" fill="#64748B" fontSize="14" fontFamily="var(--font-inter)">
            origem
          </text>
          <text x="300" y="185" fill="#64748B" fontSize="14" fontFamily="var(--font-inter)">
            destino ?
          </text>
        </svg>
      </div>
    </main>
  );
}
