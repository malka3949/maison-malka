import type { LegalDocument } from "@/content/legal/privacy";

export function LegalDocumentView({ doc }: { doc: LegalDocument }) {
  return (
    <article className="mm-legal-article space-y-8">
      <header>
        <h1 className="mm-page-title font-heading">{doc.title}</h1>
        {doc.draftNotice ? (
          <p className="mm-page-lead">{doc.draftNotice}</p>
        ) : null}
      </header>
      {doc.sections.map((section) => (
        <section key={section.heading} className="space-y-3">
          <h2>{section.heading}</h2>
          {section.paragraphs.map((p) => (
            <p key={p.slice(0, 48)} className="text-sm leading-relaxed text-mm-secondary">
              {p}
            </p>
          ))}
        </section>
      ))}
    </article>
  );
}
