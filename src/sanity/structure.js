const NEWEST = [{ field: "publishedAt", direction: "desc" }];

const catalogue = (S, { type, title }) =>
  S.listItem()
    .title(title)
    .schemaType(type)
    .child(S.documentTypeList(type).title(title).defaultOrdering(NEWEST));

export const structure = (S) =>
  S.list()
    .title("Journal")
    .items([
      catalogue(S, { type: "caseStudy", title: "Case Study" }),
      catalogue(S, { type: "journal", title: "Culture & Vision" }),
    ]);
