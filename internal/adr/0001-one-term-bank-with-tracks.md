# ADR-0001: One term bank with audience tracks

## Status

Accepted

## Context

The original dictionary focused on using coding agents. REF-AID covers the
broader language of agent systems. Maintaining them as separate dictionaries
would duplicate foundational Terms such as Agent, Model, Harness, Tool, Context
Window, and MCP. The copies would drift and search results would compete.

Categories cannot solve the audience problem. "AI coding" and "agent systems"
are overlapping routes through the material, not mutually exclusive subject
areas. Context Engineering, Prompt Injection, and Eval matter to both.

## Decision

Maintain one canonical Term per concept.

Each Term has one Category and one or more Tracks. The supported Tracks are
`coding` and `agent-systems`. The Curriculum remains the canonical order and is
grouped by Category. Track views filter that order, so a Term has one source
file, one definition, and one URL regardless of where a reader encounters it.

Term metadata also records Level and Term status. This distinguishes established
industry vocabulary from emerging protocols, vendor language, project-specific
terms, and pedagogical heuristics.

## Consequences

- Foundational Terms appear in both Tracks without duplication.
- Coding-specific working practices remain visible as their own Category.
- New audiences can be added as Tracks without copying the dictionary.
- Every Term needs valid Category, Track, Level, and Term status metadata.
- Consumers must treat Track membership as a list rather than a single value.
