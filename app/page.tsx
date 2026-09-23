"use client";

import { useEffect, useMemo, useState } from "react";
import termsData from "@/data/terms.json";
import DetailPanel from "@/components/DetailPanel";
import GraphPanel from "@/components/GraphPanel";
import Sidebar from "@/components/Sidebar";
import { buildGraphData } from "@/lib/graphData";
import type { Term } from "@/lib/types";

const terms = termsData.terms as Term[];

export default function Home() {
  const [activeTermId, setActiveTermId] = useState(terms[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [track, setTrack] = useState("all");
  const termsById = useMemo(
    () => new Map(terms.map((term) => [term.id, term])),
    []
  );
  const graphData = useMemo(() => buildGraphData(terms), []);

  const activeTerm = termsById.get(activeTermId) ?? terms[0];
  const visibleTerms = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return terms.filter((term) => {
      const matchesTrack = track === "all" || term.tracks.includes(track);
      const searchable =
        `${term.name} ${term.description} ${term.aliases.join(" ")}`.toLocaleLowerCase();
      return matchesTrack && (!normalized || searchable.includes(normalized));
    });
  }, [query, track]);

  const selectTerm = (id: string) => {
    if (!termsById.has(id)) return;
    setActiveTermId(id);
    window.history.replaceState(null, "", `#${id}`);
  };

  useEffect(() => {
    const fromHash = decodeURIComponent(window.location.hash.slice(1));
    if (termsById.has(fromHash)) setActiveTermId(fromHash);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
        event.preventDefault();
        document.getElementById("term-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [termsById]);

  if (!activeTerm) return null;

  return (
    <main className="app-shell">
      <header className="topbar">
        <a
          className="wordmark"
          href="#agent"
          onClick={() => selectTerm("agent")}
        >
          AI DICTIONARY
        </a>
        <div className="topbar-controls">
          <div className="track-switcher" aria-label="Filter by track">
            {[
              ["all", "ALL"],
              ["coding", "AI CODING"],
              ["agent-systems", "AGENT SYSTEMS"],
            ].map(([value, label]) => (
              <button
                className={track === value ? "selected" : ""}
                key={value}
                onClick={() => setTrack(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="search-field">
            <span>SEARCH</span>
            <input
              id="term-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="/"
            />
          </label>
        </div>
      </header>

      <div className="workspace">
        <Sidebar
          terms={visibleTerms}
          total={terms.length}
          activeTermId={activeTerm.id}
          onSelect={selectTerm}
        />
        <section className="graph-panel" aria-label="Term relationship graph">
          <GraphPanel
            graphData={graphData}
            activeTermId={activeTerm.id}
            onTermSelect={selectTerm}
          />
          <div className="graph-hud">
            <span>
              NODES <b>{terms.length}</b>
            </span>
            <span>
              EDGES <b>{graphData.edges.length}</b>
            </span>
            <span>
              FOCUS <b>{activeTerm.name.toUpperCase()}</b>
            </span>
          </div>
          <p className="graph-tip">
            DRAG TO ORBIT · SCROLL TO ZOOM · CLICK A TERM
          </p>
        </section>
        <DetailPanel
          term={activeTerm}
          index={terms.findIndex((term) => term.id === activeTerm.id)}
          total={terms.length}
          termsById={termsById}
          onSelect={selectTerm}
        />
      </div>
    </main>
  );
}
