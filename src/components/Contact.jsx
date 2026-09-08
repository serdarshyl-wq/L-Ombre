"use client";

import { useId, useState } from "react";
import Roll from "@/components/Roll";
import { FIELDS, validate } from "@/lib/contact-schema";

const EMPTY = { name: "", email: "", company: "", message: "", website: "" };

const LABEL =
  "block text-[clamp(0.625rem,0.8vw,0.75rem)] tracking-[0.22em] uppercase opacity-45";

const CONTROL =
  "mt-2 w-full border-b border-hairline bg-transparent pb-3 font-sans text-[clamp(0.9375rem,1.15vw,1.125rem)] text-bone outline-none transition-colors duration-300 ease-[ease] placeholder:text-bone/20 focus:border-bone aria-invalid:border-bone/70";

const BUTTON_LABEL = {
  idle: "Let’s Talk",
  sending: "Sending",
  sent: "Message Sent",
  error: "Try Again",
};

const WIDE = new Set(["company", "message"]);

function Field({ id, field, value, error, onChange, className = "" }) {
  const shared = {
    id,
    name: field.name,
    value,
    onChange,
    maxLength: field.max,
    autoComplete: field.autoComplete,
    "aria-invalid": error ? "true" : undefined,
    "aria-describedby": error ? `${id}-err` : undefined,
    className: CONTROL,
  };

  return (
    <div className={`min-w-0 ${className}`}>
      <label className={LABEL} htmlFor={id}>
        {field.label}
        {field.required ? "" : " (optional)"}
      </label>

      {field.type === "textarea" ? (
        <textarea {...shared} rows={3} className={`${CONTROL} resize-none`} />
      ) : (
        <input {...shared} type={field.type} />
      )}

      <p
        className="mt-2 min-h-[1.15em] text-[clamp(0.6875rem,0.85vw,0.8125rem)] opacity-60"
        id={`${id}-err`}
      >
        {error}
      </p>
    </div>
  );
}

export default function Contact() {
  const uid = useId();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState("idle");
  const [notice, setNotice] = useState("");

  const change = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
    if (state === "sent" || state === "error") setState("idle");
  };

  const submit = async (event) => {
    event.preventDefault();
    if (state === "sending") return;

    const check = validate(values);
    if (!check.ok) {
      setErrors(check.errors);
      setNotice("Some fields need attention.");
      setState("error");
      return;
    }

    setErrors({});
    setNotice("");
    setState("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...check.values, website: values.website }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrors(data.fields ?? {});
        setNotice(data.error ?? "Something went wrong.");
        setState("error");
        return;
      }

      setValues(EMPTY);
      setNotice("Thank you — we’ll be in touch.");
      setState("sent");
    } catch {
      setNotice("Network error. Try again.");
      setState("error");
    }
  };

  return (
    <section
      aria-labelledby="ct-title"
      className="grid min-h-svh grid-cols-[60fr_40fr] items-stretch gap-[clamp(1.5rem,3vw,3rem)] border-t border-hairline px-gutter py-[clamp(4rem,10vh,7rem)] max-[900px]:grid-cols-1 max-[900px]:gap-[clamp(3rem,10vh,5rem)]"
      id="contact"
    >
      <div className="flex min-w-0 flex-col justify-between gap-[clamp(3rem,10vh,6rem)]">
        <p className="max-w-[34ch] text-[clamp(0.6875rem,0.9vw,0.8125rem)] leading-[1.9] tracking-[0.22em] uppercase opacity-45">
          Contact — tell us what you’re building.
        </p>

        <h2
          className="font-display text-[clamp(4rem,13.2vw,16.5rem)] leading-[0.82] font-[350] tracking-[-0.035em] uppercase"
          id="ct-title"
        >
          <span className="block whitespace-nowrap">Have an</span>{" "}
          <span className="block whitespace-nowrap">Idea</span>
        </h2>
      </div>


      <div className="flex flex-col justify-center">

        <form
          className="@container mr-auto w-full max-w-136 max-[900px]:max-w-none"
          noValidate
          onSubmit={submit}
        >

          <div className="grid grid-cols-2 gap-x-[clamp(1rem,2vw,1.75rem)] gap-y-[clamp(1rem,2.5vh,1.75rem)] @max-[26rem]:grid-cols-1">
            {FIELDS.map((field) => (
              <Field
                className={
                  WIDE.has(field.name) ? "col-span-2 @max-[26rem]:col-span-1" : ""
                }
                error={errors[field.name]}
                field={field}
                id={`${uid}-${field.name}`}
                key={field.name}
                onChange={change}
                value={values[field.name]}
              />
            ))}
          </div>

          <div aria-hidden="true" className="h-0 w-0 overflow-hidden">
            <input
              autoComplete="off"
              name="website"
              onChange={change}
              tabIndex={-1}
              value={values.website}
            />
          </div>

          <div className="mt-[clamp(1.5rem,4vh,2.5rem)] flex flex-wrap items-center gap-[clamp(1rem,2vw,2rem)]">
            <button
              className="group relative shrink-0 cursor-pointer overflow-clip border border-bone px-[2.2em] py-[1.05em] text-[clamp(0.75rem,0.95vw,0.9375rem)] tracking-[0.18em] whitespace-nowrap text-bone uppercase disabled:cursor-default"
              disabled={state === "sending"}
              type="submit"
            >

              <span
                aria-hidden="true"
                className="absolute inset-0 origin-bottom scale-y-0 bg-bone transition-transform duration-550 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-y-100 group-focus-visible:scale-y-100 motion-reduce:transition-none"
              />
              <Roll
                className="relative"
                label={BUTTON_LABEL[state]}
                swapClassName="text-obsidian"
              />
            </button>

            <p
              aria-live="polite"
              className="text-[clamp(0.6875rem,0.9vw,0.8125rem)] tracking-[0.18em] uppercase opacity-55"
            >
              {notice}
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
