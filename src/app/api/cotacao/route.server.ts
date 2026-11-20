import { services } from "@/config/site";
import { clientIp, json, rateLimited, sameOrigin } from "@/lib/api-guard";
import { MailNotConfiguredError, renderFields, sendMail } from "@/lib/mailer";
import { formatPhone, validateQuote } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "forbidden" }, 403);
  if (rateLimited(`quote:${clientIp(req)}`)) return json({ error: "rate_limited" }, 429);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid" }, 400);
  }
  if (typeof body.website === "string" && body.website.trim() !== "") return json({ error: "invalid" }, 400);

  const result = validateQuote(body);
  if (!result.ok) return json({ error: "validation", fields: result.errors }, 422);
  const d = result.data;
  const service = services.find((s) => s.value === d.service)?.label ?? d.service;

  const { text, html } = renderFields(`Nova solicitação de cotação — ${service}`, [
    ["Nome", d.name],
    ["Empresa", d.company],
    ["E-mail", d.email],
    ["WhatsApp", formatPhone(d.whatsapp)],
    ["Serviço", service],
    ["Origem", d.origin],
    ["Destino", d.destination],
    ["Tipo de carga", d.cargoType],
    ["Peso aproximado", d.weight],
    ["Frequência", d.frequency],
    ["Observações", d.notes],
    ["Consentimento LGPD", d.consent ? "Sim" : "Não"],
  ]);

  try {
    await sendMail({ subject: `[Site] Cotação — ${d.company}`, text, html, replyTo: d.email });
    return json({ ok: true });
  } catch (err) {
    if (err instanceof MailNotConfiguredError) return json({ error: "not_configured" }, 503);
    console.error("[cotacao] falha no envio", err);
    return json({ error: "send_failed" }, 502);
  }
}
