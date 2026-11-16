/**
 * Configuração central da EMS Logística.
 *
 * Tudo o que depende de confirmação da empresa está aqui, em um único lugar.
 * Campos vazios ("") ou `null` são tratados pelo site como "não configurado":
 * o elemento correspondente é ocultado ou mostra uma alternativa honesta —
 * nunca um dado fictício.
 */

export const site = {
  name: "EMS Logística",
  shortName: "EMS",
  eyebrow: "EMS LOGÍSTICA | LOGÍSTICA & FRETES",
  tagline: "Planejamento que movimenta negócios.",
  motto: "Quem planeja melhor, cresce mais rápido.",
  description:
    "Soluções em logística, gestão de fretes e transporte rodoviário de cargas, conectando planejamento e eficiência às necessidades de cada operação.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  locale: "pt_BR",

  contact: {
    /**
     * WhatsApp comercial oficial — PENDENTE.
     * Formato: apenas dígitos com DDI e DDD, ex.: "5575999999999".
     * Enquanto vazio, o botão flutuante e os atalhos de WhatsApp ficam ocultos.
     */
    whatsapp: "",
    /** Número formatado para exibição, ex.: "(75) 99999-9999". */
    whatsappDisplay: "",
    whatsappMessage:
      "Olá! Conheci a EMS Logística pelo site e gostaria de conversar sobre os serviços oferecidos.",
    /** E-mail comercial público — PENDENTE. */
    email: "",
    /** Endereço — PENDENTE. Deixe null até a confirmação. */
    address: null as string | null,
    /**
     * Instagram de referência informado no briefing (perfil da EMS Consultoria).
     * Troque pelo perfil da EMS Logística, se houver um próprio.
     */
    instagram: "https://www.instagram.com/emsconsultoria.adm/",
    instagramHandle: "@emsconsultoria.adm",
  },

  /**
   * Mídia da hero. Coloque os arquivos em /public/media e preencha os caminhos.
   * Enquanto ambos forem null, a hero exibe uma composição provisória
   * explicitamente identificada como placeholder.
   */
  hero: {
    video: null as null | { mp4: string; webm?: string; poster: string },
    image: null as null | { src: string; alt: string },
  },

  /** Exibe selos "Mídia pendente" nos espaços que aguardam fotografia oficial. */
  showPendingMediaBadges: true,
} as const;

export const nav = [
  { href: "/#inicio", label: "Início" },
  { href: "/#sobre", label: "A EMS" },
  { href: "/#solucoes", label: "Soluções" },
  { href: "/#jornada", label: "Jornada" },
  { href: "/#complementares", label: "Soluções empresariais" },
  { href: "/trabalhe-conosco", label: "Trabalhe conosco" },
  { href: "/contato", label: "Contato" },
] as const;

export const services = [
  { value: "logistica", label: "Logística e gestão operacional", transport: true },
  { value: "fretes", label: "Gestão e negociação de fretes", transport: true },
  { value: "transporte", label: "Transporte rodoviário de cargas", transport: true },
  { value: "complementares", label: "Soluções empresariais complementares", transport: false },
  { value: "outro", label: "Outro assunto", transport: false },
] as const;

export const frequencies = [
  "Pontual (uma vez)",
  "Semanal",
  "Quinzenal",
  "Mensal",
  "Contínua / diária",
  "Ainda não sei",
] as const;

export const careerAreas = [
  "Operações logísticas",
  "Fretes e negociação",
  "Comercial",
  "Administrativo / financeiro",
  "Outra área",
] as const;

/**
 * Soluções empresariais complementares (divulgadas nos materiais da marca).
 * VALIDAR com a empresa antes de publicar: quais são prestadas diretamente
 * e quais por meio de parceiros. `delivery`: "parceiro" | "direto".
 */
export const complementary = [
  { key: "seguros", label: "Seguros", text: "Orientação na escolha de seguros adequados ao perfil do negócio.", delivery: "parceiro" },
  { key: "consorcios", label: "Consórcios", text: "Apoio na avaliação de consórcios para aquisições planejadas.", delivery: "parceiro" },
  { key: "credito", label: "Crédito", text: "Apoio na busca de linhas de crédito compatíveis com o momento da empresa.", delivery: "parceiro" },
  { key: "saude", label: "Planos de saúde", text: "Orientação na escolha de planos de saúde empresariais.", delivery: "parceiro" },
  { key: "contabilidade", label: "Contabilidade", text: "Conexão com serviços contábeis para manter a gestão organizada.", delivery: "parceiro" },
  { key: "juridico", label: "Jurídico", text: "Conexão com apoio jurídico para questões empresariais.", delivery: "parceiro" },
] as const;

export function whatsappLink(message?: string) {
  if (!site.contact.whatsapp) return null;
  const text = encodeURIComponent(message ?? site.contact.whatsappMessage);
  return `https://wa.me/${site.contact.whatsapp}?text=${text}`;
}
