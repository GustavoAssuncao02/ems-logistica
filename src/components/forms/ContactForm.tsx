"use client";

import { useRef, useState, type FormEvent } from "react";
import { validateContact } from "@/lib/validation";
import { Consent, Field, FormFeedback, Honeypot, SubmitButton, a11y, maskPhone, submitTo, useFormState } from "./FormKit";
import { focusFirstError } from "./QuoteForm";

export function ContactForm() {
  const { state, setState, errors, setErrors } = useFormState();
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(fd.entries());
    payload.consent = fd.get("consent") === "on";
    const local = validateContact(payload);
    if (!local.ok) {
      setErrors(local.errors);
      setState({ kind: "error", message: "Revise os campos destacados." });
      focusFirstError(formRef.current, local.errors);
      return;
    }
    setErrors({});
    setState({ kind: "sending" });
    const { state: next, fields } = await submitTo("/api/contato", JSON.stringify(payload), true);
    setState(next);
    if (fields) {
      setErrors(fields);
      focusFirstError(formRef.current, fields);
    }
    if (next.kind === "success") {
      formRef.current?.reset();
      setPhone("");
      setMessage("");
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="relative space-y-6" aria-label="Formulário de contato">
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Nome" required error={errors.name} className="sm:col-span-2">
          <input {...a11y("name", errors.name)} className="field" autoComplete="name" required />
        </Field>
        <Field id="email" label="E-mail" required error={errors.email}>
          <input {...a11y("email", errors.email)} type="email" inputMode="email" className="field" autoComplete="email" required />
        </Field>
        <Field id="phone" label="Telefone / WhatsApp" error={errors.phone}>
          <input
            {...a11y("phone", errors.phone)}
            type="tel"
            inputMode="tel"
            className="field"
            autoComplete="tel-national"
            placeholder="(00) 00000-0000"
            value={phone}
            onChange={(e) => setPhone(maskPhone(e.target.value))}
          />
        </Field>
      </div>
      <Field id="message" label="Mensagem" required error={errors.message} hint={`${message.length}/3000`}>
        <textarea
          {...a11y("message", errors.message, true)}
          className="field min-h-36 resize-y"
          rows={5}
          maxLength={3000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </Field>
      <Consent error={errors.consent} />
      <SubmitButton sending={state.kind === "sending"}>Enviar mensagem</SubmitButton>
      <div aria-live="polite">
        <FormFeedback state={state} whatsappText={message || undefined} />
      </div>
    </form>
  );
}
