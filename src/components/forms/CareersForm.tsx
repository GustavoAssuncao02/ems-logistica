"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { careerAreas } from "@/config/site";
import { checkResumeMeta, validateCareer } from "@/lib/validation";
import { Consent, Field, FormFeedback, Honeypot, SubmitButton, a11y, maskPhone, submitTo, useFormState } from "./FormKit";
import { focusFirstError } from "./QuoteForm";

/** Envio de currículo em PDF (até 5 MB), anexado ao e-mail interno. */
export function CareersForm() {
  const { state, setState, errors, setErrors } = useFormState();
  const [phone, setPhone] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setFileName(file ? file.name : null);
    const err = file ? checkResumeMeta(file) : null;
    setErrors((prev) => {
      const next = { ...prev };
      if (err) next.resume = err;
      else delete next.resume;
      return next;
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const fields: Record<string, unknown> = {};
    for (const key of ["name", "email", "phone", "city", "area", "message"]) fields[key] = fd.get(key) ?? "";
    fields.consent = fd.get("consent") === "on";
    const local = validateCareer(fields);
    const file = fd.get("resume");
    const fileError = checkResumeMeta(file instanceof File ? file : null);
    const errs = { ...(local.ok ? {} : local.errors), ...(fileError ? { resume: fileError } : {}) };
    if (Object.keys(errs).length) {
      setErrors(errs);
      setState({ kind: "error", message: "Revise os campos destacados." });
      focusFirstError(formRef.current, errs);
      return;
    }
    setErrors({});
    setState({ kind: "sending" });
    const { state: next, fields: serverErrs } = await submitTo("/api/trabalhe-conosco", fd, false);
    setState(next);
    if (serverErrs) {
      setErrors(serverErrs);
      focusFirstError(formRef.current, serverErrs);
    }
    if (next.kind === "success") {
      formRef.current?.reset();
      setPhone("");
      setFileName(null);
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate encType="multipart/form-data" className="relative space-y-6" aria-label="Envio de currículo">
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Nome completo" required error={errors.name} className="sm:col-span-2">
          <input {...a11y("name", errors.name)} className="field" autoComplete="name" required />
        </Field>
        <Field id="email" label="E-mail" required error={errors.email}>
          <input {...a11y("email", errors.email)} type="email" inputMode="email" className="field" autoComplete="email" required />
        </Field>
        <Field id="phone" label="Telefone / WhatsApp" required error={errors.phone}>
          <input
            {...a11y("phone", errors.phone)}
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
        <Field id="city" label="Cidade/UF" required error={errors.city}>
          <input {...a11y("city", errors.city)} className="field" autoComplete="address-level2" required />
        </Field>
        <Field id="area" label="Área de interesse" required error={errors.area}>
          <select {...a11y("area", errors.area)} className="field" defaultValue="" required>
            <option value="" disabled>
              Selecione uma opção
            </option>
            {careerAreas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field id="resume" label="Currículo (PDF, até 5 MB)" required error={errors.resume}>
        <label
          htmlFor="resume"
          className={`flex cursor-pointer flex-col items-start gap-3 rounded-2xl border border-dashed p-5 transition hover:bg-mist sm:flex-row sm:items-center ${
            errors.resume ? "border-[#b42318]" : "border-navy/25"
          }`}
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy/[0.06] text-navy" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M10 13V3M6 7l4-4 4 4M3 13v2.5A1.5 1.5 0 0 0 4.5 17h11a1.5 1.5 0 0 0 1.5-1.5V13" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="min-w-0 text-sm">
            <span className="block truncate font-semibold text-navy">{fileName ?? "Selecionar arquivo PDF"}</span>
            <span className="text-slate">{fileName ? "Clique para trocar o arquivo." : "Clique para escolher o currículo no seu dispositivo."}</span>
          </span>
          <input
            {...a11y("resume", errors.resume)}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            onChange={onFile}
            required
          />
        </label>
      </Field>

      <Field id="message" label="Mensagem" error={errors.message}>
        <textarea {...a11y("message", errors.message)} className="field min-h-28 resize-y" rows={4} maxLength={2000} placeholder="Conte brevemente sua experiência e o que procura." />
      </Field>

      <Consent error={errors.consent}>
        Autorizo a EMS Logística a armazenar e tratar os dados e o currículo enviados exclusivamente para fins de recrutamento e seleção, conforme a{" "}
        <a href="/politica-de-privacidade" className="font-medium text-navy underline underline-offset-2">
          Política de Privacidade
        </a>
        .
      </Consent>

      <SubmitButton sending={state.kind === "sending"}>Enviar currículo</SubmitButton>
      <div aria-live="polite">
        <FormFeedback state={state} />
      </div>
    </form>
  );
}
