"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { Term } from "@/lib/types";

type Props = {
  term: Term;
  index: number;
  total: number;
  termsById: Map<string, Term>;
  onSelect: (id: string) => void;
};

function termIdFromHref(href: string | undefined): string | null {
  if (!href?.startsWith("./") || !href.endsWith(".md")) return null;
  return decodeURIComponent(href.slice(2, -3))
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/(^-|-$)/g, "");
}

export default function DetailPanel({
  term,
  index,
  total,
  termsById,
  onSelect,
}: Props) {
  const detailPanelRef = useRef<HTMLElement>(null);
  const related = [
    ...new Set([
      ...term.relationships,
      ...[...termsById.values()]
        .filter((candidate) => candidate.relationships.includes(term.id))
        .map((candidate) => candidate.id),
    ]),
  ]
    .map((id) => termsById.get(id))
    .filter((candidate): candidate is Term => Boolean(candidate));

  useEffect(() => {
    detailPanelRef.current?.scrollTo({ top: 0 });
  }, [term.id]);

  return (
    <article ref={detailPanelRef} className="detail-panel">
      <div className="detail-kicker">
        <span>TERM</span>
        <span>
          {String(index + 1).padStart(2, "0")} / {total}
        </span>
      </div>
      <h1>{term.name}</h1>
      <div className="metadata">
        <span>{term.level}</span>
        <span>{term.status}</span>
        {term.tracks.map((track) => (
          <span key={track}>{track.replace("-", " ")}</span>
        ))}
      </div>

      <section className="definition">
        <h2>AT A GLANCE</h2>
        <p>{term.description}</p>
      </section>

      <div className="detail-rule" />
      <section className="term-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ href, children }) => {
              const id = termIdFromHref(href);
              return id && termsById.has(id) ? (
                <button className="inline-term" onClick={() => onSelect(id)}>
                  {children}
                </button>
              ) : (
                <a href={href}>{children}</a>
              );
            },
          }}
        >
          {term.body}
        </ReactMarkdown>
      </section>

      {related.length > 0 && (
        <section className="relations">
          <h2>RELATES TO</h2>
          <div>
            {related.map((relatedTerm) => (
              <button
                key={relatedTerm.id}
                onClick={() => onSelect(relatedTerm.id)}
              >
                {relatedTerm.name}
              </button>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
