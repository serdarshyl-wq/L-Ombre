import { defineArrayMember, defineField, defineType } from "sanity";
import { alt, isUniqueSlug, link } from "./parts";


export default defineType({
  name: "journal",
  title: "Culture & Vision",
  type: "document",

  groups: [
    { name: "content", title: "Content", default: true },
    { name: "media", title: "Media" },
    { name: "meta", title: "Meta" },
  ],

  fields: [
    defineField({
      name: "title",
      title: "Başlık",
      type: "string",
      group: "content",
      description: "Sayfanın tek h1'i. Kısa tut — büyük puntoda dizilecek.",
      validation: (rule) => rule.required().max(90),
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      description: "Adres: /journal/… — yayınlandıktan sonra değiştirme.",
      options: { source: "title", maxLength: 96, isUnique: isUniqueSlug },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "kicker",
      title: "Rubrik",
      type: "string",
      group: "content",
      description: "Başlığın üstündeki küçük etiket.",
      options: {
        list: [
          { title: "Culture", value: "Culture" },
          { title: "Vision", value: "Vision" },
          { title: "Field Notes", value: "Field Notes" },
          { title: "Conversation", value: "Conversation" },
        ],
        layout: "radio",
      },
      initialValue: "Culture",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "excerpt",
      title: "Özet",
      type: "text",
      rows: 3,
      group: "content",
      description:
        "Hem kart metni hem arama sonucundaki açıklama. Tek cümle, 160 karakteri geçmesin.",
      validation: (rule) => rule.required().min(60).max(180),
    }),

    defineField({
      name: "cover",
      title: "Kapak görseli",
      type: "image",
      group: "media",
      options: { hotspot: true },
      description:
        "Kartta ve yazının tepesinde kullanılıyor. Odak noktasını işaretle — kırpma her ekranda aynı yerden yapılmıyor.",
      fields: [
        alt({ required: true, description: "Görselde ne olduğu. Başlığı tekrar etme." }),
      ],
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "body",
      title: "İçerik",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Metin", value: "normal" },
            { title: "Ara başlık", value: "h2" },
            { title: "Alt başlık", value: "h3" },
          ],
          lists: [
            { title: "Madde", value: "bullet" },
            { title: "Numara", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Kalın", value: "strong" },
              { title: "İtalik", value: "em" },
            ],
            annotations: [link],
          },
        }),

        defineArrayMember({
          name: "figure",
          title: "Görsel",
          type: "image",
          options: { hotspot: true },
          fields: [
            alt(),
            defineField({
              name: "caption",
              title: "Alt yazı",
              type: "string",
            }),
          ],
          preview: {
            select: { media: "asset", title: "caption", subtitle: "alt" },
          },
        }),

        defineArrayMember({
          name: "pullQuote",
          title: "Alıntı",
          type: "object",
          fields: [
            defineField({
              name: "text",
              title: "Alıntı",
              type: "text",
              rows: 3,
              validation: (rule) => rule.required().max(240),
            }),
            defineField({
              name: "attribution",
              title: "Kaynak",
              type: "string",
              description: "Kim söyledi. Boş bırakılabilir.",
            }),
          ],
          preview: {
            select: { title: "text", subtitle: "attribution" },
            prepare: ({ title, subtitle }) => ({
              title: `“${title}”`,
              subtitle: subtitle || "Alıntı",
            }),
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),

    defineField({
      name: "byline",
      title: "Yazan",
      type: "string",
      group: "meta",
      initialValue: "L’Ombre",
    }),

    defineField({
      name: "publishedAt",
      title: "Yayın tarihi",
      type: "datetime",
      group: "meta",
      description: "Sıralama buna göre. İleri bir tarih verilebilir.",
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
    {
      name: "publishedAsc",
      title: "Yayın tarihi — eskiden yeniye",
      by: [{ field: "publishedAt", direction: "asc" }],
    },
  ],

  preview: {
    select: {
      title: "title",
      kicker: "kicker",
      date: "publishedAt",
      media: "cover",
      featured: "featured",
    },
    prepare: ({ title, kicker, date, media, featured }) => ({
      title: featured ? `★ ${title}` : title,
      subtitle: [kicker, date && new Date(date).toLocaleDateString("tr-TR")]
        .filter(Boolean)
        .join(" · "),
      media,
    }),
  },
});
