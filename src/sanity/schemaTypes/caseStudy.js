import { defineArrayMember, defineField, defineType } from "sanity";
import { alt, isUniqueSlug, link } from "./parts";
import projects from "../../data/projects.json";

const PROJECTS = projects.map((project) => ({
  title: `${project.id} · ${project.brand} — ${project.campaign}`,
  value: project.slug,
}));

const DISCIPLINES = [
  "Creative Direction",
  "Art Direction",
  "Concept & Script",
  "Casting",
  "Film Production",
  "Cinematography",
  "Location & Set",
  "Still Photography",
  "CGI & VFX",
  "Colour Grading",
  "Editorial",
  "Sound Design & Score",
];

export default defineType({
  name: "caseStudy",
  title: "Case Study",
  type: "document",

  groups: [
    { name: "story", title: "Story", default: true },
    { name: "craft", title: "Craft" },
    { name: "meta", title: "Meta" },
  ],

  fields: [
    defineField({
      name: "project",
      title: "Proje",
      type: "string",
      group: "story",
      description:
        "Hangi işin arka planı. Marka, yıl, müşteri, jenerik ve video bu bağlantıdan geliyor — burada tekrar girilmiyor.",
      options: { list: PROJECTS },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "title",
      title: "Başlık",
      type: "string",
      group: "story",
      description:
        "Sayfanın tek h1'i. Projenin adı değil, işin hikâyesi — “One Pour, No Cuts” gibi.",
      validation: (rule) => rule.required().max(80),
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "story",
      description: "Adres: /journal/… — yayınlandıktan sonra değiştirme.",
      options: { source: "title", maxLength: 96, isUnique: isUniqueSlug },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "standfirst",
      title: "Giriş",
      type: "text",
      rows: 8,
      group: "story",
      description:
        "Ortada duran zorluk ne idi. İstediğin kadar uzat — arama sonucundaki açıklama bunun ilk cümlelerinden kırpılıyor.",
      validation: (rule) => rule.required().min(80).max(1000),
    }),

    defineField({
      name: "cover",
      title: "Açılış karesi",
      type: "image",
      group: "story",
      options: { hotspot: true },
      description:
        "Boş bırakılırsa projenin kendi geniş posteri kullanılıyor. Bir set karesi koymak istersen buraya.",
      fields: [alt({ required: true })],
    }),

    defineField({
      name: "stats",
      title: "Rakamlar",
      type: "array",
      group: "story",
      description:
        "İşin ölçüsü: “1 take”, “0 cut”, “9 gün”. En fazla dört tane — dördü sayfada tek sırada duruyor.",
      of: [
        defineArrayMember({
          name: "stat",
          type: "object",
          fields: [
            defineField({
              name: "value",
              title: "Değer",
              type: "string",
              validation: (rule) => rule.required().max(12),
            }),
            defineField({
              name: "label",
              title: "Etiket",
              type: "string",
              validation: (rule) => rule.required().max(40),
            }),
          ],
          preview: {
            select: { title: "value", subtitle: "label" },
          },
        }),
      ],
      validation: (rule) => rule.max(4),
    }),

    defineField({
      name: "chapters",
      title: "Bölümler",
      type: "array",
      group: "story",
      description:
        "Case study'nin gövdesi burası: işin sırası. “Add item” ile bölüm ekle — her biri sayfada kendi ekranını alıyor. Sıra numaralarını (01, 02…) sayfa kendi veriyor, etiketin içine yazmana gerek yok.",
      of: [
        defineArrayMember({
          name: "chapter",
          title: "Bölüm",
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Etiket",
              type: "string",
              description: "Kısa: “The Problem”, “The Build”, “On Set”.",
              validation: (rule) => rule.required().max(28),
            }),
            defineField({
              name: "heading",
              title: "Başlık",
              type: "string",
              validation: (rule) => rule.required().max(90),
            }),
            defineField({
              name: "body",
              title: "Metin",
              type: "array",
              description: "İki üç kısa paragraf. Uzarsa bölümü ikiye ayır.",
              of: [
                defineArrayMember({
                  type: "block",
                  // Ara başlık yok: bölümün başlığı zaten yukarıdaki alan.
                  styles: [{ title: "Metin", value: "normal" }],
                  lists: [],
                  marks: {
                    decorators: [
                      { title: "Kalın", value: "strong" },
                      { title: "İtalik", value: "em" },
                    ],
                    annotations: [link],
                  },
                }),
              ],
              validation: (rule) => rule.required().min(1),
            }),
            defineField({
              name: "media",
              title: "Görsel",
              type: "image",
              options: { hotspot: true },
              description: "Süreçten bir kare. Boş bırakılabilir.",
              fields: [alt(), defineField({ name: "caption", title: "Alt yazı", type: "string" })],
            }),
            defineField({
              name: "layout",
              title: "Yerleşim",
              type: "string",
              options: {
                list: [
                  { title: "Görsel tam genişlik", value: "full" },
                  { title: "Görsel metnin yanında", value: "beside" },
                ],
                layout: "radio",
              },
              initialValue: "full",
            }),
          ],
          preview: {
            select: { label: "label", title: "heading", media: "media" },
            prepare: ({ label, title, media }) => ({
              title,
              subtitle: label,
              media,
            }),
          },
        }),
      ],
      validation: (rule) =>
        rule
          .required()
          .min(2)
          .error("En az iki bölüm ekle — işin sırası bunlarla anlatılıyor."),
    }),

    defineField({
      name: "craft",
      title: "Zanaat notları",
      type: "array",
      group: "craft",
      description:
        "Disiplin başına tek cümle: o iş burada tam olarak ne yaptı. Sayfanın “nasıl” kolonu bu.",
      of: [
        defineArrayMember({
          name: "note",
          type: "object",
          fields: [
            defineField({
              name: "discipline",
              title: "Disiplin",
              type: "string",
              options: { list: DISCIPLINES },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "note",
              title: "Not",
              type: "text",
              rows: 2,
              validation: (rule) => rule.required().max(220),
            }),
          ],
          preview: {
            select: { title: "discipline", subtitle: "note" },
          },
        }),
      ],
    }),

    defineField({
      name: "tools",
      title: "Ekipman & yazılım",
      type: "array",
      group: "craft",
      description: "Kamera, lens, yazılım. Enter ile ekleniyor.",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),

    defineField({
      name: "quote",
      title: "Alıntı",
      type: "object",
      group: "craft",
      description: "Sayfada tek bir tane duruyor. Boş bırakılabilir.",
      fields: [
        defineField({
          name: "text",
          title: "Alıntı",
          type: "text",
          rows: 3,
          validation: (rule) => rule.max(240),
        }),
        defineField({
          name: "attribution",
          title: "Kim söyledi",
          type: "string",
        }),
      ],
    }),

    defineField({
      name: "publishedAt",
      title: "Yayın tarihi",
      type: "datetime",
      group: "meta",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "featured",
      title: "Öne çıkar",
      type: "boolean",
      group: "meta",
      description: "Journal sayfasının tepesindeki büyük kart.",
      initialValue: false,
    }),
  ],

  orderings: [
    {
      name: "publishedDesc",
      title: "Yayın tarihi — yeniden eskiye",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],

  preview: {
    select: {
      title: "title",
      project: "project",
      media: "cover",
      featured: "featured",
      chapters: "chapters",
    },
    prepare: ({ title, project, media, featured, chapters }) => {
      const name = PROJECTS.find((p) => p.value === project)?.title ?? project;
      const count = chapters?.length ?? 0;

      return {
        title: featured ? `★ ${title}` : title,
        subtitle: [name, count && `${count} bölüm`].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
