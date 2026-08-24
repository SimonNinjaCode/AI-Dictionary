export const CATEGORY_BY_HEADING = {
  "Models & inference": "models-and-inference",
  "Context, retrieval & memory": "context-retrieval-and-memory",
  "Agents & tools": "agents-and-tools",
  "Reasoning & orchestration": "reasoning-and-orchestration",
  "Coding practice": "coding-practice",
  "Evaluation & observability": "evaluation-and-observability",
  "Safety, permissions & identity": "safety-permissions-and-identity",
  "Runtime & protocols": "runtime-and-protocols",
} as const;

export const TRACK_LABELS = {
  coding: "AI coding",
  "agent-systems": "Agent systems",
} as const;

export const TERM_STATUSES = [
  "established",
  "emerging",
  "vendor",
  "project",
  "heuristic",
] as const;

export const LEVELS = ["foundational", "intermediate", "advanced"] as const;

export type Category =
  (typeof CATEGORY_BY_HEADING)[keyof typeof CATEGORY_BY_HEADING];
export type Track = keyof typeof TRACK_LABELS;
export type TermStatus = (typeof TERM_STATUSES)[number];
export type Level = (typeof LEVELS)[number];

export type TermMetadata = {
  description: string;
  aliases: string[];
  category: Category;
  tracks: Track[];
  termStatus: TermStatus;
  level: Level;
};

function unquote(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

export function splitFrontmatter(text: string): {
  metadataText: string;
  body: string;
} {
  if (!text.startsWith("---\n")) {
    throw new Error("missing YAML frontmatter");
  }

  const end = text.indexOf("\n---\n", 4);
  if (end === -1) {
    throw new Error("unterminated YAML frontmatter");
  }

  return {
    metadataText: text.slice(4, end),
    body: text.slice(end + 5).replace(/^\n+/, ""),
  };
}

function parseYamlSubset(text: string): Map<string, string | string[]> {
  const values = new Map<string, string | string[]>();
  let listKey: string | null = null;

  for (const rawLine of text.split("\n")) {
    const listMatch = rawLine.match(/^  - (.+)$/);
    if (listMatch && listKey) {
      const current = values.get(listKey);
      if (!Array.isArray(current)) {
        throw new Error(`${listKey} must be a list`);
      }
      current.push(unquote(listMatch[1] ?? ""));
      continue;
    }

    const fieldMatch = rawLine.match(/^([a-z_]+):(?: (.*))?$/);
    if (!fieldMatch) {
      throw new Error(`unsupported frontmatter line: ${rawLine}`);
    }

    const key = fieldMatch[1] ?? "";
    const rawValue = fieldMatch[2];
    if (rawValue === undefined || rawValue === "") {
      values.set(key, []);
      listKey = key;
    } else {
      values.set(key, unquote(rawValue));
      listKey = null;
    }
  }

  return values;
}

function requireString(
  values: Map<string, string | string[]>,
  key: string
): string {
  const value = values.get(key);
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${key} must be a non-empty string`);
  }
  return value;
}

function requireList(
  values: Map<string, string | string[]>,
  key: string
): string[] {
  const value = values.get(key);
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${key} must be a non-empty list`);
  }
  return value;
}

export function parseTermMetadata(text: string): TermMetadata {
  const { metadataText } = splitFrontmatter(text);
  const values = parseYamlSubset(metadataText);
  const allowedKeys = new Set([
    "description",
    "aliases",
    "category",
    "tracks",
    "term_status",
    "level",
  ]);

  for (const key of values.keys()) {
    if (!allowedKeys.has(key)) {
      throw new Error(`unknown frontmatter field: ${key}`);
    }
  }

  const description = requireString(values, "description");
  if (description.length >= 140) {
    throw new Error("description must be less than 140 characters");
  }

  const category = requireString(values, "category");
  if (!Object.values(CATEGORY_BY_HEADING).includes(category as Category)) {
    throw new Error(`unknown category: ${category}`);
  }

  const tracks = requireList(values, "tracks");
  for (const track of tracks) {
    if (!(track in TRACK_LABELS)) {
      throw new Error(`unknown track: ${track}`);
    }
  }

  const termStatus = requireString(values, "term_status");
  if (!TERM_STATUSES.includes(termStatus as TermStatus)) {
    throw new Error(`unknown term_status: ${termStatus}`);
  }

  const level = requireString(values, "level");
  if (!LEVELS.includes(level as Level)) {
    throw new Error(`unknown level: ${level}`);
  }

  const aliasesValue = values.get("aliases") ?? [];
  if (!Array.isArray(aliasesValue)) {
    throw new Error("aliases must be a list");
  }

  return {
    description,
    aliases: aliasesValue,
    category: category as Category,
    tracks: [...new Set(tracks)] as Track[],
    termStatus: termStatus as TermStatus,
    level: level as Level,
  };
}

export function countBodyWords(text: string): number {
  const { body } = splitFrontmatter(text);
  return body.trim().split(/\s+/).filter(Boolean).length;
}
