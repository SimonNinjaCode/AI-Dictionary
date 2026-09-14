import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  CATEGORY_BY_HEADING,
  parseTermMetadata,
  splitFrontmatter,
  type Category,
} from "./term-metadata.js";
import { parseCurriculum } from "./generate-readme.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(HERE);
const DICTIONARY = join(ROOT, "dictionary");
const CURRICULUM = join(HERE, "Curriculum.md");
const OUTPUT = join(ROOT, "data", "terms.json");
const LINK_RE = /\[[^\]]+\]\(\.\/([^)]+)\.md\)/g;

type AppTerm = {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryId: Category;
  tracks: string[];
  level: string;
  status: string;
  aliases: string[];
  body: string;
  relationships: string[];
};

function idFor(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/(^-|-$)/g, "");
}

function termLinks(body: string, known: Set<string>): string[] {
  const relationships = new Set<string>();
  for (const match of body.matchAll(LINK_RE)) {
    const target = decodeURIComponent(match[1] ?? "");
    const id = idFor(target);
    if (known.has(id)) relationships.add(id);
  }
  return [...relationships];
}

export function main(): void {
  const categoryNames = Object.fromEntries(
    Object.entries(CATEGORY_BY_HEADING).map(([name, id]) => [id, name])
  ) as Record<Category, string>;
  const orderedNames = parseCurriculum(
    readFileSync(CURRICULUM, "utf8")
  ).flatMap((section) => section.terms);
  const known = new Set(orderedNames.map(idFor));
  const terms: AppTerm[] = orderedNames.map((name) => {
    const raw = readFileSync(join(DICTIONARY, `${name}.md`), "utf8");
    const metadata = parseTermMetadata(raw);
    const { body } = splitFrontmatter(raw);
    return {
      id: idFor(name),
      name,
      description: metadata.description,
      category: categoryNames[metadata.category],
      categoryId: metadata.category,
      tracks: metadata.tracks,
      level: metadata.level,
      status: metadata.termStatus,
      aliases: metadata.aliases,
      body,
      relationships: termLinks(body, known),
    };
  });

  const referenced = new Set(terms.flatMap((term) => term.relationships));
  for (const term of terms) {
    for (const source of terms) {
      if (source.relationships.includes(term.id)) referenced.add(term.id);
    }
  }
  writeFileSync(
    OUTPUT,
    `${JSON.stringify({ terms, referenced: [...referenced] }, null, 2)}\n`
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main();
}
