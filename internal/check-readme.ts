#!/usr/bin/env -S npx tsx

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { main as generateReadme } from "./generate-readme.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const README = join(dirname(HERE), "README.md");
const before = readFileSync(README, "utf8");

generateReadme();

const after = readFileSync(README, "utf8");
if (after !== before) {
  console.error("README.md was out of sync and has been regenerated.");
  process.exit(1);
}

console.log("README.md is in sync");
