import { careerAreas, frequencies, services } from "@/config/site";

/**
 * Validação compartilhada entre navegador e servidor.
 * O servidor nunca confia no cliente: as mesmas regras rodam nas rotas /api.
 */

export type FieldErrors = Record<string, string>;
export type Result<T> = { ok: true; data: T } | { ok: false; errors: FieldErrors };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const onlyDigits = (v: string) => v.replace(/\D+/g, "");
const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Telefone brasileiro: DDD + 8 ou 9 dígitos (aceita +55 opcional). */
export function normalizePhone(v: string) {
  let d = onlyDigits(v);
  if (d.length > 11 && d.startsWith("55")) d = d.slice(2);
  return d;
}
export const isPhone = (v: string) => /^\d{10,11}$/.test(normalizePhone(v));

export function formatPhone(digits: string) {
  const d = normalizePhone(digits);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return digits;
}

// ── Cotação ────────────────────────────────────────────────────────────────

export type QuoteData = {
  name: string;
  company: string;
  email: string;
  whatsapp: string;
  service: string;
  origin: string;
  destination: string;
  cargoType: string;
  weight: string;
  frequency: string;
  notes: string;
  consent: boolean;
};

export function serviceNeedsTransport(service: string) {
  return services.find((s) => s.value === service)?.transport ?? false;
}

export function validateQuote(input: Record<string, unknown>): Result<QuoteData> {
  const d: QuoteData = {
    name: str(input.name, 120),
    company: str(input.company, 120),
    email: str(input.email, 160).toLowerCase(),
    whatsapp: str(input.whatsapp, 30),
    service: str(input.service, 40),
    origin: str(input.origin, 120),
    destination: str(input.destination, 120),
    cargoType: str(input.cargoType, 120),
    weight: str(input.weight, 60),
    frequency: str(input.frequency, 60),
    notes: str(input.notes, 2000),
    consent: input.consent === true || input.consent === "on" || input.consent === "true",
  };
  const e: FieldErrors = {};
  if (d.name.length < 3) e.name = "Informe seu nome completo.";
  if (d.company.length < 2) e.company = "Informe o nome da empresa.";
  if (!EMAIL.test(d.email)) e.email = "Informe um e-mail válido.";
  if (!isPhone(d.whatsapp)) e.whatsapp = "Informe um WhatsApp com DDD.";
  if (!services.some((s) => s.value === d.service)) e.service = "Selecione o serviço de interesse.";
  if (serviceNeedsTransport(d.service)) {
    if (d.origin.length < 2) e.origin = "Informe a cidade/UF de origem.";
    if (d.destination.length < 2) e.destination = "Informe a cidade/UF de destino.";
    if (d.cargoType.length < 2) e.cargoType = "Descreva o tipo de carga.";
    if (!frequencies.includes(d.frequency as (typeof frequencies)[number])) e.frequency = "Selecione a frequência estimada.";
  } else {
    d.origin = d.destination = d.cargoType = d.weight = d.frequency = "";
  }
  if (!d.consent) e.consent = "É necessário autorizar o uso dos dados para o retorno.";
  if (Object.keys(e).length) return { ok: false, errors: e };
  d.whatsapp = normalizePhone(d.whatsapp);
  return { ok: true, data: d };
}

// ── Contato ────────────────────────────────────────────────────────────────

export type ContactData = { name: string; email: string; phone: string; message: string; consent: boolean };

export function validateContact(input: Record<string, unknown>): Result<ContactData> {
  const d: ContactData = {
    name: str(input.name, 120),
    email: str(input.email, 160).toLowerCase(),
    phone: str(input.phone, 30),
    message: str(input.message, 3000),
    consent: input.consent === true || input.consent === "on" || input.consent === "true",
  };
  const e: FieldErrors = {};
  if (d.name.length < 3) e.name = "Informe seu nome.";
  if (!EMAIL.test(d.email)) e.email = "Informe um e-mail válido.";
  if (d.phone && !isPhone(d.phone)) e.phone = "Informe um telefone com DDD (ou deixe em branco).";
  if (d.message.length < 10) e.message = "Escreva uma mensagem com pelo menos 10 caracteres.";
  if (!d.consent) e.consent = "É necessário autorizar o uso dos dados para o retorno.";
  if (Object.keys(e).length) return { ok: false, errors: e };
  d.phone = d.phone ? normalizePhone(d.phone) : "";
  return { ok: true, data: d };
}

// ── Trabalhe conosco ──────────────────────────────────────────────────────

export const RESUME_MAX_BYTES = 5 * 1024 * 1024;

export type CareerData = {
  name: string;
  email: string;
  phone: string;
  city: string;
  area: string;
  message: string;
  consent: boolean;
};

export function validateCareer(input: Record<string, unknown>): Result<CareerData> {
  const d: CareerData = {
    name: str(input.name, 120),
    email: str(input.email, 160).toLowerCase(),
    phone: str(input.phone, 30),
    city: str(input.city, 120),
    area: str(input.area, 80),
    message: str(input.message, 2000),
    consent: input.consent === true || input.consent === "on" || input.consent === "true",
  };
  const e: FieldErrors = {};
  if (d.name.length < 3) e.name = "Informe seu nome completo.";
  if (!EMAIL.test(d.email)) e.email = "Informe um e-mail válido.";
  if (!isPhone(d.phone)) e.phone = "Informe um telefone com DDD.";
  if (d.city.length < 2) e.city = "Informe sua cidade.";
  if (!careerAreas.includes(d.area as (typeof careerAreas)[number])) e.area = "Selecione a área de interesse.";
  if (!d.consent) e.consent = "É necessário autorizar o tratamento dos dados do currículo.";
  if (Object.keys(e).length) return { ok: false, errors: e };
  d.phone = normalizePhone(d.phone);
  return { ok: true, data: d };
}

/** Verificação de arquivo de currículo (tipo, tamanho e assinatura %PDF). */
export function checkResumeMeta(file: { name: string; size: number; type: string } | null): string | null {
  if (!file || file.size === 0) return "Anexe seu currículo em PDF.";
  if (file.size > RESUME_MAX_BYTES) return "O arquivo deve ter no máximo 5 MB.";
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "Envie o currículo no formato PDF.";
  return null;
}

export function isPdfSignature(bytes: Uint8Array) {
  return bytes.length > 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d;
}

// ── Mensagem de WhatsApp (alternativa ao envio pelo site) ─────────────────

export function quoteToWhatsappText(d: Partial<QuoteData>) {
  const service = services.find((s) => s.value === d.service)?.label ?? d.service ?? "";
  const lines = [
    "Olá! Gostaria de solicitar uma cotação pela EMS Logística.",
    "",
    `*Nome:* ${d.name ?? ""}`,
    `*Empresa:* ${d.company ?? ""}`,
    `*E-mail:* ${d.email ?? ""}`,
    `*Serviço:* ${service}`,
  ];
  if (d.origin) lines.push(`*Origem:* ${d.origin}`);
  if (d.destination) lines.push(`*Destino:* ${d.destination}`);
  if (d.cargoType) lines.push(`*Tipo de carga:* ${d.cargoType}`);
  if (d.weight) lines.push(`*Peso aproximado:* ${d.weight}`);
  if (d.frequency) lines.push(`*Frequência:* ${d.frequency}`);
  if (d.notes) lines.push("", `*Observações:* ${d.notes}`);
  return lines.join("\n");
}
