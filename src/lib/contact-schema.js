/**
 * İletişim formunun tek doğruluk kaynağı.
 *
 * Aynı kural hem tarayıcıda hem sunucuda çalışıyor: client anında geri
 * bildirim veriyor, sunucu ise client'a hiç güvenmiyor. İki yerde iki ayrı
 * kural listesi tutmak, er ya da geç birbirinden ayrılan iki kural demek.
 */

export const FIELDS = [
  {
    name: "name",
    label: "Name",
    type: "text",
    autoComplete: "name",
    min: 2,
    max: 80,
    required: true,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    autoComplete: "email",
    min: 5,
    max: 160,
    required: true,
  },
  {
    name: "company",
    label: "Company",
    type: "text",
    autoComplete: "organization",
    min: 0,
    max: 120,
    required: false,
  },
  {
    name: "message",
    label: "Description",
    type: "textarea",
    min: 12,
    max: 2000,
    required: true,
  },
];

// Kasten gevşek: e-postanın geçerliliğini gerçekten kanıtlayan tek şey ona
// ulaşan bir posta. Buradaki iş, yazım hatasını yakalayıp gerçek adresi
// reddetmemek.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validate(input) {
  const values = {};
  const errors = {};

  for (const field of FIELDS) {
    const value = String(input?.[field.name] ?? "")
      .trim()
      .slice(0, field.max);
    values[field.name] = value;

    if (!value) {
      if (field.required) errors[field.name] = `${field.label} is required.`;
      continue;
    }
    if (value.length < field.min) {
      errors[field.name] = `${field.label} is too short.`;
      continue;
    }
    if (field.name === "email" && !EMAIL.test(value)) {
      errors[field.name] = "That address doesn’t look right.";
    }
  }

  return { values, errors, ok: Object.keys(errors).length === 0 };
}
