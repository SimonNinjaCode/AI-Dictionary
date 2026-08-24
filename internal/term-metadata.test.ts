import assert from "node:assert/strict";
import test from "node:test";

import {
  countBodyWords,
  parseTermMetadata,
  splitFrontmatter,
} from "./term-metadata.js";

const VALID = `---
description: A short description.
aliases:
  - Alternate name
category: agents-and-tools
tracks:
  - coding
  - agent-systems
term_status: established
level: foundational
---

One two three.
`;

test("parses supported term metadata", () => {
  assert.deepEqual(parseTermMetadata(VALID), {
    description: "A short description.",
    aliases: ["Alternate name"],
    category: "agents-and-tools",
    tracks: ["coding", "agent-systems"],
    termStatus: "established",
    level: "foundational",
  });
});

test("rejects unknown metadata", () => {
  assert.throws(
    () => parseTermMetadata(VALID.replace("level:", "difficulty:")),
    /unknown frontmatter field/
  );
});

test("splits body and counts words", () => {
  assert.equal(splitFrontmatter(VALID).body, "One two three.\n");
  assert.equal(countBodyWords(VALID), 3);
});
