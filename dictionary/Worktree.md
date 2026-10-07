---
description: A separate working directory checked out from the same git repository, so parallel agents can edit different branches without colliding.
aliases:
  - Git worktree
category: coding-practice
tracks:
  - coding
term_status: established
level: intermediate
---

A separate working directory checked out from the same git repository, created with `git worktree add`. Each worktree has its own branch and its own files on disk, while all of them share one repository history. The common way to run several [agents](./Agent.md) on one codebase at the same time.

Two agents in one checkout share one [filesystem](./Filesystem.md), so each one's edits land in the other's working tree. A test run picks up the other agent's half-finished change and fails for reasons neither caused. A formatter rewrites files the other agent is in the middle of editing. A `git commit` sweeps in changes from both tasks. Each agent's picture of the files is a snapshot from its last read of the [environment](./Environment.md), and the other agent keeps making it stale.

| Step   | Command                                                  | What happens                                          |
| ------ | -------------------------------------------------------- | ----------------------------------------------------- |
| Create | `git worktree add ../app-ticket-42 -b ticket-42`         | New directory with a new branch checked out           |
| Work   | Start an agent [session](./Session.md) in that directory | Edits, test runs, and commits stay on that branch     |
| Review | Open a PR from the branch                                | [Human review](./Human%20review.md) as for any branch |
| Remove | `git worktree remove ../app-ticket-42`                   | Directory deleted; the branch and commits remain      |

Worktrees share history, not runtime state. Each directory needs its own dependency install and build output, untracked files such as `.env` aren't copied, and dev servers or test databases on fixed ports collide. Git also allows a branch to be checked out in only one worktree at a time. Worktrees isolate files, not side effects: two agents running migrations against the same local database still interfere, so a worktree is not a [sandbox](./Sandbox.md).

Parallel worktrees help only when the work is independent. They prevent agents from overwriting each other's files; they don't prevent merge conflicts when two [tickets](./Ticket.md) change the same code.

_Usage:_

"I ran two agents on the same repo and one keeps failing on tests the other one broke."

"They're sharing a working tree. Give each its own worktree on its own branch, and merge the branches when both are done."
