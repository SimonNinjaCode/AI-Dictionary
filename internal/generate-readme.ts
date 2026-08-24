#!/usr/bin/env -S npx tsx
// Generate README.md from internal/Curriculum.md + dictionary/*.md + internal/README.template.md.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

import {
  CATEGORY_BY_HEADING,
  parseTermMetadata,
  TRACK_LABELS,
  type Category,
  type TermMetadata,
  type Track,
} from "./term-metadata.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(HERE);
const CURRICULUM = join(HERE, "Curriculum.md");
const TEMPLATE = join(HERE, "README.template.md");
const DICT_DIR = join(ROOT, "dictionary");
const OUTPUT = join(ROOT, "README.md");
const MARKER = "<!-- CURRICULUM -->";
const TOC_MARKER = "<!-- TOC -->";
const TRACKS_MARKER = "<!-- TRACKS -->";

const BULLET_RE = /^- (.+)$/;
const LINK_RE = /\[([^\]]+)\]\(\.\/([^)]+)\.md\)/g;

type Section = { heading: string; category: Category; terms: string[] };

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

// Mirrors GitHub's heading slugger: lowercase, strip punctuation (keeping hyphens),
// then replace spaces with hyphens. "Section 1 — Foundations" → "section-1--foundations".
export function headingSlug(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N} -]/gu, "")
    .replace(/ /g, "-");
}

export function parseCurriculum(text: string): Section[] {
  const sections: Section[] = [];
  let current: Section | null = null;

  text.split("\n").forEach((raw, idx) => {
    const lineNo = idx + 1;
    const line = raw.trimEnd();
    if (line === "") return;

    if (line.startsWith("## ")) {
      const heading = line.slice(3);
      const category =
        CATEGORY_BY_HEADING[heading as keyof typeof CATEGORY_BY_HEADING];
      if (!category) {
        fail(`Curriculum.md:${lineNo}: unknown category heading: ${heading}`);
      }
      current = { heading, category, terms: [] };
      sections.push(current);
      return;
    }

    if (line.startsWith("- ")) {
      if (!current)
        fail(`Curriculum.md:${lineNo}: bullet before any section heading`);
      const m = line.match(BULLET_RE);
      if (!m || !m[1])
        fail(`Curriculum.md:${lineNo}: malformed bullet: ${line}`);
      const term = m[1];
      if (term.trim() !== term)
        fail(`Curriculum.md:${lineNo}: term has surrounding whitespace`);
      if (term.includes("[") || /[*_`]/.test(term))
        fail(
          `Curriculum.md:${lineNo}: term must be plain text, no markdown: ${term}`
        );
      current.terms.push(term);
      return;
    }

    fail(
      `Curriculum.md:${lineNo}: only category headings and "- Term" bullets are allowed: ${line}`
    );
  });

  return sections;
}

function stripFrontmatter(body: string): string {
  if (!body.startsWith("---\n")) return body;
  const end = body.indexOf("\n---\n", 4);
  if (end === -1) return body;
  return body.slice(end + 5).replace(/^\n+/, "");
}

function rewriteLinks(body: string): string {
  return body.replace(LINK_RE, (_, text: string, target: string) => {
    return `[${text}](#${headingSlug(decodeURIComponent(target))})`;
  });
}

function renderTrackIndexes(
  orderedTerms: string[],
  metadata: Map<string, TermMetadata>
): string {
  return Object.entries(TRACK_LABELS)
    .map(([track, label]) => {
      const typedTrack = track as Track;
      const links = orderedTerms
        .filter((term) => metadata.get(term)?.tracks.includes(typedTrack))
        .map((term) => `- [${term}](#${headingSlug(term)})`)
        .join("\n");
      return [
        "<details>",
        `<summary>${label}</summary>`,
        "",
        links,
        "",
        "</details>",
      ].join("\n");
    })
    .join("\n\n");
}

function validateTemplate(template: string): void {
  if (!template.includes(MARKER)) fail(`Template missing ${MARKER} marker`);
  if (!template.includes(TOC_MARKER))
    fail(`Template missing ${TOC_MARKER} marker`);
  if (!template.includes(TRACKS_MARKER))
    fail(`Template missing ${TRACKS_MARKER} marker`);
}

function readTerm(
  term: string,
  expectedCategory: Category
): { body: string; metadata: TermMetadata } {
  const entryPath = join(DICT_DIR, `${term}.md`);
  let body: string;
  try {
    body = readFileSync(entryPath, "utf8");
  } catch {
    fail(`Curriculum.md references "${term}" but ${entryPath} does not exist`);
  }

  let metadata: TermMetadata;
  try {
    metadata = parseTermMetadata(body);
  } catch (error) {
    fail(
      `${entryPath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  if (metadata.category !== expectedCategory) {
    fail(
      `${entryPath}: category ${metadata.category} does not match Curriculum category ${expectedCategory}`
    );
  }
  return { body, metadata };
}

function renderTerm(
  term: string,
  category: Category
): { content: string; metadata: TermMetadata } {
  const { body, metadata } = readTerm(term, category);
  const trackLabels = metadata.tracks.map((track) => TRACK_LABELS[track]);
  const facts = [...trackLabels, metadata.level, metadata.termStatus].join(
    " · "
  );
  const content = [
    `### ${term}`,
    "",
    `_${facts}_`,
    "",
    rewriteLinks(stripFrontmatter(body).trimEnd()),
    "",
  ].join("\n");
  return { content, metadata };
}

function renderCurriculum(sections: Section[]): {
  block: string;
  metadata: Map<string, TermMetadata>;
  orderedTerms: string[];
  seen: Set<string>;
} {
  const seen = new Set<string>();
  const parts: string[] = [];
  const metadata = new Map<string, TermMetadata>();
  const orderedTerms: string[] = [];

  for (const section of sections) {
    parts.push(`## ${section.heading}`, "");
    for (const term of section.terms) {
      if (seen.has(term)) fail(`Curriculum.md: duplicate term "${term}"`);
      seen.add(term);
      const renderedTerm = renderTerm(term, section.category);
      metadata.set(term, renderedTerm.metadata);
      orderedTerms.push(term);
      parts.push(renderedTerm.content);
    }
  }

  return {
    block: parts.join("\n").trimEnd() + "\n",
    metadata,
    orderedTerms,
    seen,
  };
}

function validateCoverage(seen: Set<string>): void {
  const onDisk = new Set(
    readdirSync(DICT_DIR)
      .filter((n) => n.endsWith(".md"))
      .map((n) => n.slice(0, -3))
  );
  const orphans = [...onDisk].filter((t) => !seen.has(t)).sort();
  if (orphans.length)
    fail(
      `dictionary/ entries not referenced by Curriculum.md: ${orphans.join(", ")}`
    );
}

function renderTableOfContents(sections: Section[]): string {
  return sections
    .map((s) => {
      const terms = s.terms
        .map((t) => `- [${t}](#${headingSlug(t)})`)
        .join("\n");
      return [
        "<details>",
        `<summary>${s.heading}</summary>`,
        "",
        terms,
        "",
        "</details>",
      ].join("\n");
    })
    .join("\n\n");
}

function generatedBanner(): string {
  return (
    "<!--\n" +
    "  GENERATED FILE — DO NOT EDIT.\n" +
    "  Source: dictionary/*.md, internal/Curriculum.md, internal/README.template.md\n" +
    "  Regenerate: npm run generate\n" +
    "-->\n\n"
  );
}

export function main(): void {
  const template = readFileSync(TEMPLATE, "utf8");
  validateTemplate(template);
  const sections = parseCurriculum(readFileSync(CURRICULUM, "utf8"));
  const rendered = renderCurriculum(sections);
  validateCoverage(rendered.seen);
  const toc = renderTableOfContents(sections);
  const trackIndexes = renderTrackIndexes(
    rendered.orderedTerms,
    rendered.metadata
  );

  writeFileSync(
    OUTPUT,
    generatedBanner() +
      template
        .replace(TRACKS_MARKER, trackIndexes)
        .replace(TOC_MARKER, toc)
        .replace(MARKER, rendered.block)
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main();
}
