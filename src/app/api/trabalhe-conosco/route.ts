import { clientIp, json, rateLimited, sameOrigin } from "@/lib/api-guard";
import { MailNotConfiguredError, renderFields, sendMail } from "@/lib/mailer";
import { RESUME_MAX_BYTES, checkResumeMeta, formatPhone, isPdfSignature, validateCareer } from "@/lib/validation";

export const runtime = "nodejs";

/**
 * Currículos: o PDF é validado (tamanho, tipo e assinatura %PDF) e enviado
 * apenas como anexo do e-mail para o endereço interno configurado.
 * Nada é gravado em disco nem exposto em URL pública.
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "forbidden" }, 403);
  if (rateLimited(`career:${clientIp(req)}`)) return json({ error: "rate_limited" }, 429);

  const length = Number(req.headers.get("content-length") || 0);
  if (length > RESUME_MAX_BYTES + 256 * 1024) return json({ error: "validation", fields: { resume: "O arquivo deve ter no máximo 5 MB." } }, 413);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: "invalid" }, 400);
  }
  const website = form.get("website");
  if (typeof website === "string" && website.trim() !== "") return json({ error: "invalid" }, 400);

  const fields: Record<string, unknown> = {};
  for (const key of ["name", "email", "phone", "city", "area", "message", "consent"]) fields[key] = form.get(key) ?? "";
  const result = validateCareer(fields);
  const file = form.get("resume");
  const resume = file instanceof File ? file : null;
  const fileError = checkResumeMeta(resume);
  if (!result.ok || fileError) {
    return json({ error: "validation", fields: { ...(result.ok ? {} : result.errors), ...(fileError ? { resume: fileError } : {}) } }, 422);
  }

  const bytes = new Uint8Array(await resume!.arrayBuffer());
  if (!isPdfSignature(bytes)) return json({ error: "validation", fields: { resume: "O arquivo enviado não é um PDF válido." } }, 422);

  const d = result.data;
  const safeName = d.name.normalize("NFD").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 60) || "candidato";
  const { text, html } = renderFields("Novo currículo recebido", [
    ["Nome", d.name],
    ["E-mail", d.email],
    ["Telefone", formatPhone(d.phone)],
    ["Cidade", d.city],
    ["Área de interesse", d.area],
    ["Mensagem", d.message],
    ["Consentimento LGPD", d.consent ? "Sim" : "Não"],
  ]);

  try {
    await sendMail({
      subject: `[Site] Currículo — ${d.name} (${d.area})`,
      text,
      html,
      replyTo: d.email,
      attachments: [{ filename: `curriculo-${safeName}.pdf`, content: Buffer.from(bytes), contentType: "application/pdf" }],
    });
    return json({ ok: true });
  } catch (err) {
    if (err instanceof MailNotConfiguredError) return json({ error: "not_configured" }, 503);
    console.error("[trabalhe-conosco] falha no envio", err);
    return json({ error: "send_failed" }, 502);
  }
}
