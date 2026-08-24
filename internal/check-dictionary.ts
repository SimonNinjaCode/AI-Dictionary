#!/usr/bin/env -S npx tsx

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { parseCurriculum } from "./generate-readme.js";
import { countBodyWords, parseTermMetadata } from "./term-metadata.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(HERE);
const DICT_DIR = join(ROOT, "dictionary");
const MIN_BODY_WORDS = 200;
const LINK_RE = /\[[^\]]+\]\(\.\/([^)]+\.md)\)/g;

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("en");
}

function main(): void {
  const failures: string[] = [];
  const files = readdirSync(DICT_DIR).filter((name) => name.endsWith(".md"));
  const terms = new Set(files.map((name) => name.slice(0, -3)));
  const namesAndAliases = new Map<string, string>();

  for (const file of files) {
    const term = file.slice(0, -3);
    const path = join(DICT_DIR, file);
    const text = readFileSync(path, "utf8");
    let metadata;
    try {
      metadata = parseTermMetadata(text);
    } catch (error) {
      failures.push(
        `${file}: ${error instanceof Error ? error.message : String(error)}`
      );
      continue;
    }

    const words = countBodyWords(text);
    if (words < MIN_BODY_WORDS) {
      failures.push(
        `${file}: body has ${words} words, minimum is ${MIN_BODY_WORDS}`
      );
    }

    for (const name of [term, ...metadata.aliases]) {
      const key = normalize(name);
      const owner = namesAndAliases.get(key);
      if (owner && owner !== term) {
        failures.push(
          `${file}: name or alias "${name}" collides with ${owner}`
        );
      } else {
        namesAndAliases.set(key, term);
      }
    }

    for (const match of text.matchAll(LINK_RE)) {
      const target = decodeURIComponent(match[1] ?? "");
      if (!existsSync(join(DICT_DIR, target))) {
        failures.push(`${file}: broken dictionary link ${target}`);
      }
    }
  }

  const curriculum = parseCurriculum(
    readFileSync(join(HERE, "Curriculum.md"), "utf8")
  );
  const listed = curriculum.flatMap((section) => section.terms);
  for (const term of terms) {
    if (!listed.includes(term)) {
      failures.push(`${term}.md: missing from Curriculum.md`);
    }
  }
  for (const term of listed) {
    if (!terms.has(term)) {
      failures.push(`Curriculum.md: missing dictionary/${term}.md`);
    }
  }
  if (new Set(listed).size !== listed.length) {
    failures.push("Curriculum.md: duplicate Term");
  }

  if (failures.length > 0) {
    console.error(failures.map((failure) => `FAIL: ${failure}`).join("\n"));
    process.exit(1);
  }

  console.log(`Dictionary check passed: ${files.length} Terms`);
}

main();
