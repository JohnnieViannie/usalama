import type { LegalSection } from "./legalSectionTypes";

export function LegalDocument({ title, subtitle, sections }: { title: string; subtitle: string; sections: LegalSection[] }) {
  return (
    <article className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-p:leading-relaxed prose-li:leading-relaxed">
      <header className="not-prose mb-10 border-b border-border pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">{subtitle}</p>
      </header>
      {sections.map((section) => (
        <section key={section.id} id={section.id} className="mb-10">
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">{section.title}</h2>
          <div className="mt-4 space-y-4">
            {section.blocks.map((block, i) => {
              if (block.type === "p") {
                return (
                  <p key={i} className="text-muted-foreground">
                    {block.text}
                  </p>
                );
              }
              if (block.type === "h3") {
                return (
                  <h3
                    key={i}
                    className="not-prose text-lg font-semibold tracking-tight text-foreground first:mt-0 sm:text-xl"
                  >
                    {block.text}
                  </h3>
                );
              }
              if (block.type === "ul") {
                return (
                  <ul key={i} className="list-disc pl-5 text-muted-foreground marker:text-accent">
                    {block.items.map((item, j) => (
                      <li key={j} className="mt-1.5">
                        {item}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <ol key={i} className="list-decimal pl-5 text-muted-foreground">
                  {block.items.map((item, j) => (
                    <li key={j} className="mt-1.5">
                      {item}
                    </li>
                  ))}
                </ol>
              );
            })}
          </div>
        </section>
      ))}
    </article>
  );
}
