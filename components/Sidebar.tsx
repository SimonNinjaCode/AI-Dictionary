"use client";

import { useEffect, useRef } from "react";

import type { Term } from "@/lib/types";

type Props = {
  terms: Term[];
  total: number;
  activeTermId: string;
  onSelect: (id: string) => void;
};

export default function Sidebar({
  terms,
  total,
  activeTermId,
  onSelect,
}: Props) {
  const sidebarRef = useRef<HTMLElement>(null);
  const hasPositionedInitialTerm = useRef(false);
  const groups = new Map<string, Term[]>();
  for (const term of terms) {
    groups.set(term.category, [...(groups.get(term.category) ?? []), term]);
  }

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    if (!hasPositionedInitialTerm.current) {
      sidebar.scrollTop = 0;
      hasPositionedInitialTerm.current = true;
    }

    sidebar
      .querySelector<HTMLButtonElement>(`[data-term-id="${activeTermId}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeTermId, terms]);

  return (
    <aside ref={sidebarRef} className="sidebar" aria-label="Dictionary terms">
      <div className="sidebar-count">
        <span>TERMS</span>
        <span>
          {terms.length === total ? total : `${terms.length}/${total}`}
        </span>
      </div>
      {[...groups.entries()].map(([category, categoryTerms]) => (
        <section className="term-group" key={category}>
          <h2>{category}</h2>
          {categoryTerms.map((term) => (
            <button
              className={
                term.id === activeTermId ? "term-link active" : "term-link"
              }
              key={term.id}
              data-term-id={term.id}
              onClick={() => onSelect(term.id)}
            >
              <span>{term.name}</span>
              {term.id === activeTermId && <i aria-hidden="true" />}
            </button>
          ))}
        </section>
      ))}
      {terms.length === 0 && <p className="empty-state">NO TERMS FOUND</p>}
    </aside>
  );
}
