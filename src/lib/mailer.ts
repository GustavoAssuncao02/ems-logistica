import "server-only";

/**
 * Envio de e-mails dos formulários.
 *
 * Provedores suportados (configure via variáveis de ambiente — ver .env.example):
 *   A) Resend   → RESEND_API_KEY
 *   B) SMTP     → SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE
 * Em ambos: FORMS_TO_EMAIL (destino) e FORMS_FROM_EMAIL (remetente).
 *
 * Sem configuração, `sendMail` lança `MailNotConfiguredError` e as rotas
 * respondem 503 — o site informa a pessoa e NUNCA simula um envio.
 */

export class MailNotConfiguredError extends Error {
  constructor() {
    super("Envio de e-mail não configurado.");
  }
}

export type MailAttachment = { filename: string; content: Buffer; contentType: string };

export type MailInput = {
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  attachments?: MailAttachment[];
};

export function mailerConfigured() {
  const base = Boolean(process.env.FORMS_TO_EMAIL && process.env.FORMS_FROM_EMAIL);
  return base && Boolean(process.env.RESEND_API_KEY || process.env.SMTP_HOST);
}

export async function sendMail(input: MailInput) {
  const to = process.env.FORMS_TO_EMAIL;
  const from = process.env.FORMS_FROM_EMAIL;
  if (!to || !from) throw new MailNotConfiguredError();

  if (process.env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: to.split(",").map((s) => s.trim()),
        subject: input.subject,
        text: input.text,
        html: input.html,
        reply_to: input.replyTo,
        attachments: input.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content.toString("base64"),
        })),
      }),
    });
    if (!res.ok) throw new Error(`Resend respondeu ${res.status}`);
    return;
  }

  if (process.env.SMTP_HOST) {
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
    await transport.sendMail({
      from,
      to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      replyTo: input.replyTo,
      attachments: input.attachments,
    });
    return;
  }

  throw new MailNotConfiguredError();
}

const esc = (v: string) =>
  v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Monta texto e HTML simples a partir de pares rótulo/valor. */
export function renderFields(title: string, rows: [string, string][]) {
  const text = [title, "", ...rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`)].join("\n");
  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#13213f">
<h2 style="color:#162F60;margin:0 0 16px">${esc(title)}</h2>
<table cellpadding="6" style="border-collapse:collapse">${rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="color:#64748B;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="white-space:pre-wrap">${esc(v)}</td></tr>`,
    )
    .join("")}</table>
<p style="color:#94a3b8;font-size:12px;margin-top:24px">Enviado pelo formulário do site EMS Logística.</p>
</body></html>`;
  return { text, html };
}
