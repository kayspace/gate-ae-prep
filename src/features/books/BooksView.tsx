import { books as booksData } from "@/lib/books";
import { syllabus } from "@/lib/syllabus";
import { fmtSize } from "@/lib/format";

export function BooksView() {
  return (
    <div className="px-6 md:px-12 py-10 fade-in">
      <div className="section-num">books · pdfs</div>
      <h1 className="serif text-5xl mt-2 mb-6 lowercase">your shelf</h1>
      <p className="text-sm text-[var(--muted)] max-w-xl mb-10 leading-relaxed">
        drop pdfs inside <span className="mono">public/books/&lt;section&gt;/</span> and they show
        up here on next dev/build. click to open in a new tab.
      </p>

      <div className="space-y-10">
        {syllabus.map((s) => {
          const list = booksData[s.id] || [];
          return (
            <div key={s.id} className="fade-in">
              <div className="flex items-baseline justify-between mb-3 border-b border-[var(--line)] pb-2">
                <div className="flex items-baseline gap-3">
                  <span className="mono text-[10px] text-[var(--faint)]">0{s.num}</span>
                  <span className="serif text-2xl lowercase">{s.title}</span>
                </div>
                <span className="mono text-[10px] text-[var(--muted)]">
                  {list.length} {list.length === 1 ? "book" : "books"}
                </span>
              </div>
              {list.length === 0 ? (
                <div className="serif italic text-sm text-[var(--muted)]">
                  empty. drop a pdf into{" "}
                  <span className="mono not-italic">/public/books/{s.id}/</span>
                </div>
              ) : (
                <ul className="grid md:grid-cols-2 gap-x-8">
                  {list.map((b) => (
                    <li
                      key={b.file}
                      className="py-3 border-b border-[var(--line)] flex items-start justify-between gap-3"
                    >
                      <a
                        href={`/books/${s.id}/${encodeURIComponent(b.file)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="serif text-base lowercase link-u min-w-0 truncate"
                        title={b.name}
                      >
                        {b.name.toLowerCase()}
                      </a>
                      <span className="mono text-[10px] text-[var(--faint)] shrink-0 uppercase tracking-widest">
                        {fmtSize(b.size)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
