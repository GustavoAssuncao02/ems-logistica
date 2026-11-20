import { clientIp, json, rateLimited, sameOrigin } from "@/lib/api-guard";
import { MailNotConfiguredError, renderFields, sendMail } from "@/lib/mailer";
import { formatPhone, validateContact } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "forbidden" }, 403);
  if (rateLimited(`contact:${clientIp(req)}`)) return json({ error: "rate_limited" }, 429);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid" }, 400);
  }
  if (typeof body.website === "string" && body.website.trim() !== "") return json({ error: "invalid" }, 400);

  const result = validateContact(body);
  if (!result.ok) return json({ error: "validation", fields: result.errors }, 422);
  const d = result.data;

  const { text, html } = renderFields("Nova mensagem de contato", [
    ["Nome", d.name],
    ["E-mail", d.email],
    ["Telefone", d.phone ? formatPhone(d.phone) : ""],
    ["Mensagem", d.message],
    ["Consentimento LGPD", d.consent ? "Sim" : "Não"],
  ]);

  try {
    await sendMail({ subject: `[Site] Contato — ${d.name}`, text, html, replyTo: d.email });
    return json({ ok: true });
  } catch (err) {
    if (err instanceof MailNotConfiguredError) return json({ error: "not_configured" }, 503);
    console.error("[contato] falha no envio", err);
    return json({ error: "send_failed" }, 502);
  }
}
