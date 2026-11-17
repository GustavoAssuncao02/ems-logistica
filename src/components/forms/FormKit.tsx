"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { site, whatsappLink } from "@/config/site";
import type { FieldErrors } from "@/lib/validation";

export type SubmitState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "success" }
  | { kind: "not_configured" }
  | { kind: "error"; message: string };

/** Envia para a rota da API e traduz cada resposta em um estado honesto. */
export async function submitTo(url: string, body: BodyInit, isJson: boolean): Promise<{ state: SubmitState; fields?: FieldErrors }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      body,
      headers: isJson ? { "Content-Type": "application/json" } : undefined,
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: FieldErrors };
    if (res.ok && data.ok) return { state: { kind: "success" } };
    if (res.status === 503 || data.error === "not_configured") return { state: { kind: "not_configured" } };
    if (data.error === "validation") return { state: { kind: "error", message: "Revise os campos destacados." }, fields: data.fields };
    if (res.status === 429) return { state: { kind: "error", message: "Muitas tentativas em sequência. Aguarde alguns minutos e tente novamente." } };
    return { state: { kind: "error", message: "Não foi possível enviar agora. Tente novamente em instantes." } };
  } catch {
    return { state: { kind: "error", message: "Sem conexão com o servidor. Verifique sua internet e tente novamente." } };
  }
}

export function useFormState() {
  const [state, setState] = useState<SubmitState>({ kind: "idle" });
  const [errors, setErrors] = useState<FieldErrors>({});
  return { state, setState, errors, setErrors };
}

export function Field({
  id,
  label,
  error,
  hint,
  required,
  children,
  className = "",
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-navy">
        {label}
        {required ? (
          <span className="text-orange-600" aria-hidden="true">
            {" "}
            *
          </span>
        ) : (
          <span className="font-normal text-slate"> (opcional)</span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-[#b42318]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Atributos de acessibilidade para um campo com possível erro. */
export const a11y = (id: string, error?: string, hint?: boolean) => ({
  id,
  name: id,
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
});

/** Campo invisível para robôs (honeypot). */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Não preencha este campo
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function Consent({ id = "consent", error, children }: { id?: string; error?: string; children?: ReactNode }) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-slate">
        <input
          type="checkbox"
          id={id}
          name={id}
          className="mt-1 h-4 w-4 shrink-0 accent-navy"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <span>
          {children ?? (
            <>
              Autorizo a EMS Logística a utilizar os dados informados para retornar este contato, conforme a{" "}
              <Link href="/politica-de-privacidade" className="font-medium text-navy underline underline-offset-2">
                Política de Privacidade
              </Link>
              .
            </>
          )}
        </span>
      </label>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-[#b42318]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function SubmitButton({ sending, children }: { sending: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={sending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange px-7 py-4 text-[15px] font-bold text-navy transition hover:bg-[#ff8d3f] disabled:cursor-wait disabled:opacity-70 sm:w-auto"
    >
      {sending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-navy/30 border-t-navy" aria-hidden="true" />}
      {sending ? "Enviando…" : children}
    </button>
  );
}

/**
 * Retorno após o envio. Sem integração configurada, informa claramente e
 * oferece alternativas reais (WhatsApp, quando configurado, e Instagram).
 */
export function FormFeedback({ state, whatsappText }: { state: SubmitState; whatsappText?: string }) {
  if (state.kind === "idle" || state.kind === "sending") return null;
  if (state.kind === "success")
    return (
      <div role="status" className="rounded-2xl bg-[#ecfdf3] p-5 text-sm text-[#05603a] ring-1 ring-[#abefc6]">
        <p className="font-semibold">Mensagem enviada.</p>
        <p className="mt-1">Recebemos suas informações. A equipe da EMS Logística retornará pelos contatos informados.</p>
      </div>
    );
  if (state.kind === "not_configured") {
    const wa = whatsappLink(whatsappText);
    return (
      <div role="alert" className="rounded-2xl bg-orange-50 p-5 text-sm text-navy ring-1 ring-orange/30">
        <p className="font-semibold">O envio pelo site ainda não está ativo.</p>
        <p className="mt-1 text-slate">
          Sua mensagem <strong>não foi enviada</strong>. Enquanto a integração é concluída, fale com a EMS pelos canais abaixo.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-full bg-navy px-4 py-2 font-semibold text-white">
              Enviar pelo WhatsApp
            </a>
          )}
          {site.contact.instagram && (
            <a href={site.contact.instagram} target="_blank" rel="noopener noreferrer" className="rounded-full px-4 py-2 font-semibold text-navy ring-1 ring-navy/25">
              Falar pelo Instagram
            </a>
          )}
          <Link href="/contato" className="rounded-full px-4 py-2 font-semibold text-navy ring-1 ring-navy/25">
            Outros canais de contato
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div role="alert" className="rounded-2xl bg-[#fef3f2] p-5 text-sm text-[#b42318] ring-1 ring-[#fecdca]">
      {state.message}
    </div>
  );
}

/** Máscara de telefone brasileiro enquanto a pessoa digita. */
export function maskPhone(value: string) {
  const d = value.replace(/\D+/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
