"use client";

import { useRef, useState, type FormEvent } from "react";
import { frequencies, services } from "@/config/site";
import { quoteToWhatsappText, serviceNeedsTransport, validateQuote, type QuoteData } from "@/lib/validation";
import { Consent, Field, FormFeedback, Honeypot, SubmitButton, a11y, maskPhone, submitTo, useFormState } from "./FormKit";

/**
 * Formulário de cotação. Os campos de rota e carga aparecem apenas para
 * serviços de logística, fretes e transporte. A validação roda aqui e de novo
 * no servidor; nenhum envio é simulado.
 */
export function QuoteForm({ compact = false }: { compact?: boolean }) {
  const { state, setState, errors, setErrors } = useFormState();
  const [service, setService] = useState("");
  const [phone, setPhone] = useState("");
  const [snapshot, setSnapshot] = useState<Partial<QuoteData>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const transport = serviceNeedsTransport(service);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(fd.entries());
    payload.consent = fd.get("consent") === "on";

    const local = validateQuote(payload);
    setSnapshot(payload as Partial<QuoteData>);
    if (!local.ok) {
      setErrors(local.errors);
      setState({ kind: "error", message: "Revise os campos destacados." });
      focusFirstError(formRef.current, local.errors);
      return;
    }
    setErrors({});
    setState({ kind: "sending" });
    const { state: next, fields } = await submitTo("/api/cotacao", JSON.stringify(payload), true);
    setState(next);
    if (fields) {
      setErrors(fields);
      focusFirstError(formRef.current, fields);
    }
    if (next.kind === "success") {
      formRef.current?.reset();
      setService("");
      setPhone("");
    }
  }

  const grid = compact ? "grid gap-5 sm:grid-cols-2" : "grid gap-5 md:grid-cols-2";

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="relative space-y-6" aria-label="Solicitação de cotação">
      <Honeypot />
      <div className={grid}>
        <Field id="name" label="Nome" required error={errors.name}>
          <input {...a11y("name", errors.name)} className="field" autoComplete="name" required />
        </Field>
        <Field id="company" label="Empresa" required error={errors.company}>
          <input {...a11y("company", errors.company)} className="field" autoComplete="organization" required />
        </Field>
        <Field id="email" label="E-mail" required error={errors.email}>
          <input {...a11y("email", errors.email)} type="email" inputMode="email" className="field" autoComplete="email" required />
        </Field>
        <Field id="whatsapp" label="WhatsApp" required error={errors.whatsapp}>
          <input
            {...a11y("whatsapp", errors.whatsapp)}
            type="tel"
            inputMode="tel"
            className="field"
            autoComplete="tel-national"
            placeholder="(00) 00000-0000"
            value={phone}
            onChange={(e) => setPhone(maskPhone(e.target.value))}
            required
          />
        </Field>
        <Field id="service" label="Serviço de interesse" required error={errors.service} className="md:col-span-2">
          <select {...a11y("service", errors.service)} className="field" value={service} onChange={(e) => setService(e.target.value)} required>
            <option value="" disabled>
              Selecione uma opção
            </option>
            {services.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {transport && (
        <fieldset className={`${grid} rounded-2xl bg-mist p-5 ring-1 ring-line sm:p-6`}>
          <legend className="sr-only">Detalhes da operação</legend>
          <p className="eyebrow text-slate md:col-span-2 sm:col-span-2">Detalhes da operação</p>
          <Field id="origin" label="Origem (cidade/UF)" required error={errors.origin}>
            <input {...a11y("origin", errors.origin)} className="field" placeholder="Ex.: Feira de Santana/BA" />
          </Field>
          <Field id="destination" label="Destino (cidade/UF)" required error={errors.destination}>
            <input {...a11y("destination", errors.destination)} className="field" placeholder="Ex.: São Paulo/SP" />
          </Field>
          <Field id="cargoType" label="Tipo de carga" required error={errors.cargoType}>
            <input {...a11y("cargoType", errors.cargoType)} className="field" placeholder="Ex.: carga seca paletizada" />
          </Field>
          <Field id="weight" label="Peso aproximado" error={errors.weight}>
            <input {...a11y("weight", errors.weight)} className="field" placeholder="Ex.: 12 toneladas" />
          </Field>
          <Field id="frequency" label="Frequência estimada" required error={errors.frequency} className="sm:col-span-2 md:col-span-2">
            <select {...a11y("frequency", errors.frequency)} className="field" defaultValue="">
              <option value="" disabled>
                Selecione uma opção
              </option>
              {frequencies.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </Field>
        </fieldset>
      )}

      <Field id="notes" label="Observações" error={errors.notes}>
        <textarea {...a11y("notes", errors.notes)} className="field min-h-28 resize-y" rows={4} placeholder="Conte um pouco sobre a operação, prazos ou necessidades específicas." />
      </Field>

      <Consent error={errors.consent} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SubmitButton sending={state.kind === "sending"}>Solicitar cotação</SubmitButton>
        <p className="text-xs text-slate">Campos com * são obrigatórios.</p>
      </div>

      <div aria-live="polite">
        <FormFeedback state={state} whatsappText={quoteToWhatsappText(snapshot)} />
      </div>
    </form>
  );
}

export function focusFirstError(form: HTMLFormElement | null, errs: Record<string, string>) {
  const first = Object.keys(errs)[0];
  if (!form || !first) return;
  const el = form.querySelector<HTMLElement>(`[name="${first}"]`);
  el?.focus();
}
