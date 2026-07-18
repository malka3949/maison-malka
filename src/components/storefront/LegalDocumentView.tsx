import type { LegalDocument } from "@/content/legal/privacy";

export function LegalDocumentView({ doc }: { doc: LegalDocument }) {
  return (
    <article className="mx-auto max-w-2xl space-y-8">
      <header className="border-b border-mm-line pb-6">
        <h1 className="font-heading text-4xl text-mm-primary md:text-5xl">
          {doc.title}
        </h1>
        <p className="mt-3 text-sm text-mm-secondary">{doc.draftNotice}</p>
      </header>
      {doc.sections.map((section) => (
        <section key={section.heading} className="space-y-3">
          <h2 className="text-lg font-semibold text-mm-primary">
            {section.heading}
          </h2>
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
