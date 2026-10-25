import Link from 'next/link';
import { LifeBuoy, ShieldCheck } from 'lucide-react';

export default function PolicyDocument({ updated, sections = [], children }) {
  return (
    <div className="mt-5 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <article className="overflow-hidden rounded-[1.35rem] border border-line/80 bg-[#fffdfa]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/[0.06] px-5 py-4 sm:px-7">
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-muted">
            Last updated {updated}
          </p>
          <span className="inline-flex items-center gap-1 rounded-full bg-leaf-soft px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-[0.08em] text-leaf">
            <ShieldCheck className="h-3 w-3" />
            Demo policy
          </span>
        </div>
        <div className="space-y-7 px-5 py-6 sm:px-7 sm:py-8">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-28">
              <h2 className="font-display text-[16px] font-bold tracking-[-0.03em] text-ink">
                {section.title}
              </h2>
              {section.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-2.5 text-[11.5px] leading-[1.8] text-ink-soft"
                >
                  {paragraph}
                </p>
              ))}
              {section.bullets?.length ? (
                <ul className="mt-3 space-y-1.5">
                  {section.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex gap-2 text-[11px] leading-relaxed text-ink-soft"
                    >
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-brand" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
          {children}
        </div>
      </article>

      <aside className="space-y-3 lg:sticky lg:top-[92px]">
        <nav
          aria-label="On this page"
          className="rounded-[1.3rem] border border-line/80 bg-white/60 p-4"
        >
          <p className="eyebrow">On this page</p>
          <ol className="mt-2.5 space-y-0.5">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="flex gap-2 rounded-lg px-2 py-1.5 text-[10px] leading-snug text-ink-soft transition hover:bg-sand/60 hover:text-ink"
                >
                  <span className="num text-[9px] text-muted">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="rounded-[1.3rem] border border-brand/20 bg-brand-soft/55 p-4">
          <LifeBuoy className="h-4 w-4 text-brand-dark" />
          <p className="mt-2 text-[10.5px] font-bold text-ink">Questions?</p>
          <p className="mt-1 text-[9.5px] leading-relaxed text-ink-soft">
            If anything here is unclear, ask before you buy or sell.
          </p>
          <Link href="/contact" className="mt-2.5 inline-flex text-[9.5px] font-semibold text-brand-dark">
            Contact Martify
          </Link>
          {' · '}
          <Link href="/help" className="mt-2.5 inline-flex text-[9.5px] font-semibold text-brand-dark">
            Help centre
          </Link>
        </div>
      </aside>
    </div>
  );
}
