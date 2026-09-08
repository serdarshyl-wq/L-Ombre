import { defineArrayMember, defineField } from "sanity";
import { apiVersion } from "../env";

export const link = defineArrayMember({
  name: "link",
  title: "Bağlantı",
  type: "object",
  fields: [
    defineField({
      name: "href",
      title: "Adres",
      type: "url",
      validation: (rule) =>
        rule.required().uri({
          scheme: ["http", "https", "mailto", "tel"],
          allowRelative: true,
        }),
    }),
    defineField({
      name: "blank",
      title: "Yeni sekmede açılsın",
      type: "boolean",
      initialValue: false,
    }),
  ],
});

export const alt = ({ required = false, description } = {}) =>
  defineField({
    name: "alt",
    title: "Alternatif metin",
    type: "string",
    description:
      description ?? (required ? "Görselde ne olduğu." : "Dekoratifse boş bırak."),
    validation: (rule) => (required ? rule.required() : rule),
  });

const TYPES = ["caseStudy", "journal"];

export const isUniqueSlug = async (slug, context) => {
  const { document, getClient } = context;
  const client = getClient({ apiVersion });

  const id = document._id.replace(/^drafts\./, "");
  const params = { draft: `drafts.${id}`, published: id, slug };
  const query = `!defined(*[
    _type in $types && !(_id in [$draft, $published]) && slug.current == $slug
  ][0]._id)`;

  return client.fetch(query, { ...params, types: TYPES });
};
