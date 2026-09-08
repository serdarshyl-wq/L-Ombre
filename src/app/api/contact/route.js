import { validate } from "@/lib/contact-schema";

const LIMIT = 5;
const WINDOW = 10 * 60 * 1000;
const MAX_KEYS = 500;

const hits = new Map();

const allow = (key) => {
  const now = Date.now();

  if (hits.size > MAX_KEYS) {
    for (const [k, list] of hits) {
      if (!list.some((t) => now - t < WINDOW)) hits.delete(k);
    }
  }

  const list = (hits.get(key) ?? []).filter((t) => now - t < WINDOW);
  hits.set(key, list);
  if (list.length >= LIMIT) return false;
  list.push(now);
  return true;
};

const deliver = async ({ name, email, company, message }) => {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM;

  if (!key || !to || !from) {
    console.error(
      "[contact] Mail yapılandırması eksik. .env.local içine RESEND_API_KEY, CONTACT_TO ve CONTACT_FROM ekleyin."
    );
    return { status: 503, error: "The mail service isn’t configured yet." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `L’Ombre — ${name}${company ? ` · ${company}` : ""}`,
      text: [
        `Name:     ${name}`,
        `Email:    ${email}`,
        `Company:  ${company || "—"}`,
        "",
        message,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    console.error("[contact] Resend reddetti:", response.status, await response.text());
    return { status: 502, error: "The message couldn’t be sent. Try again." };
  }

  return { status: 200 };
};

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  if (String(body?.website ?? "").trim()) return Response.json({ ok: true });

  const ip =
    (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
    "local";
  if (!allow(ip)) {
    return Response.json(
      { error: "Too many messages. Try again in a little while." },
      { status: 429 }
    );
  }

  const { values, errors, ok } = validate(body);
  if (!ok) {
    return Response.json(
      { error: "Some fields need attention.", fields: errors },
      { status: 422 }
    );
  }

  const result = await deliver(values);
  if (result.error) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json({ ok: true });
}
