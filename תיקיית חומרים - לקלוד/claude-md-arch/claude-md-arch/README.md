# Claude Code Project Memory Architecture

A generic scaffold for organizing project context so Claude Code stays aligned across long sessions and across multiple sessions over time.

## Why this exists

Claude Code loads `CLAUDE.md` into context every session. As a project grows, a single file becomes unreadable and gets ignored. This layout splits memory by **scope**, **lifecycle**, and **read-trigger** — so the right context loads when it's needed and nothing else.

## File layout

```
<repo-root>/
├── CLAUDE.md                  # Index + golden rules (always loaded). Keep < 200 lines.
├── CLAUDE/                    # Detail docs — read on demand from index.
│   ├── invariants.md          # MUSTs/NEVERs derived from past incidents.
│   ├── lessons-learned.md     # Backward-looking incident log.
│   ├── system-flows.md        # Cross-system data flows / topology.
│   ├── servers.md             # Hosts, SSH, environments.
│   ├── services.md            # Ports, containers, dev commands.
│   ├── deploy.md              # Build, push, release flow.
│   ├── db.md                  # Schemas, connection strings, keys.
│   └── <topic>.md             # One file per subsystem.
├── PROGRESS.txt               # Append-only journal of significant changes.
├── FOLLOWUPS.md               # Out-of-scope bugs found in passing.
├── BACKLOG.md                 # Out-of-scope features / mock-stub debt.
├── agents/                    # Subagent pipeline (PubNub-proven, 5 stages).
│   ├── PIPELINE.md            # Overview + when to use which stage.
│   ├── pm-spec.md             # 1. Spec writer (Haiku, read-only)
│   ├── architect-review.md    # 2. ADR writer (Opus, read-only)
│   ├── implementer-tester.md  # 3. Implements + tests (Sonnet, write)
│   ├── code-reviewer.md       # 4. Post-commit review (Sonnet, read-only)
│   └── security-reviewer.md   # 5. Injection/auth/secrets scan (Opus, read-only)
└── <project>/CLAUDE.md        # Per-project overrides — loaded when cwd is inside.
```

Plus the user-level memory directory (per-user, not committed):

```
~/.claude/projects/<project-slug>/memory/
├── MEMORY.md                  # Index, always loaded. ≤ 200 lines.
└── <type>_<topic>.md          # Individual memory files.
```

## File roles

### `CLAUDE.md` (root) — The Index

- **Always loaded.** Keep tight. No prose; bullet lists + a pointer table to detail docs.
- Three sections work well:
  1. **Repo summary** — one paragraph: what this repo is, what's the default architecture/version, what's deprecated.
  2. **Golden rules** — non-negotiables. Fewer than 10. Each is a one-liner with a why.
  3. **Detail-doc index** — a table mapping topic → file → "when to read".

### `CLAUDE/<topic>.md` — Detail docs

- **Loaded on demand.** Claude reads only when the index points there for the current task.
- Split by subsystem, not by chapter. One file = one mental model.
- Two doc types pay off most:
  - **`invariants.md`** — load-bearing MUSTs/NEVERs. Read before touching named risky surfaces. These are forward-looking guards.
  - **`lessons-learned.md`** — backward-looking incident log. "X broke because Y; rule Z prevents it."

### `PROGRESS.txt` — The journal

- **Append-only.** Never rewritten. Rotate as `PROGRESS_OLD_<date>.txt` when too big.
- Each entry: timestamp, optional session id, what changed, files touched, result.
- Purpose: future sessions can grep `PROGRESS.txt` before re-investigating something already solved.

### `FOLLOWUPS.md` — Bug bin

- One-liners for bugs found out-of-scope. Severity P0/P1/P2/P3, file:line, repro.
- Read at session start so high-severity items get surfaced before new work begins.

### `BACKLOG.md` — Idea bin

- Out-of-scope feature ideas, intentional mock/stub code, deferred refactors.
- The `plan-to-backlog.sh` hook auto-appends "Out of scope" bullets from approved plans.

### Per-project `<project>/CLAUDE.md`

- For monorepos. Loaded automatically when the working dir is inside that project.
- Holds rules that apply to that project only — keeps the root index lean.

### `~/.claude/.../memory/MEMORY.md` — Auto-memory index

- Per-user, persists across sessions, not committed.
- One-line pointers to typed memory files: `user`, `feedback`, `project`, `reference`.
- Use for things derived from conversations, not from the code: user preferences, validated approaches, external system pointers.

## How they interact

1. **Session start** — Claude loads root `CLAUDE.md` + `MEMORY.md` + (if cwd) project `CLAUDE.md`. Reads `FOLLOWUPS.md` / `BACKLOG.md` per the golden rule.
2. **During work** — Index points Claude at the right `CLAUDE/<topic>.md` for the task. Invariants are read before risky edits.
3. **Past-work lookup order** (defined in golden rules):
   1. `PROGRESS.txt` + rotated archives
   2. `git log --grep=…`
   3. Memory search
   4. `CLAUDE/*.md`
4. **End of work** — Append to `PROGRESS.txt`. New bugs → `FOLLOWUPS.md`. New ideas → `BACKLOG.md`. New rule from incident → `CLAUDE/invariants.md` or `lessons-learned.md`.

## Hooks (in `hooks/`)

Drop these into your settings to automate the boring parts. See `hooks/settings-snippet.json` for the wiring.

- **`plan-to-backlog.sh`** — `PostToolUse` on `ExitPlanMode`. Extracts `## Out of scope` bullets from the approved plan and appends to `BACKLOG.md`. Dedupes by exact line.
- **`block-destructive-docker.sh`** — `PreToolUse` on Bash. Blocks `docker volume rm/prune`, `docker compose down -v`, `docker system prune --volumes`. Persistent data guard.

## Adoption checklist

- [ ] Drop `CLAUDE.md.template` at repo root, fill in the three sections.
- [ ] Create `CLAUDE/` and copy the topic templates that apply.
- [ ] Create empty `PROGRESS.txt`, `FOLLOWUPS.md`, `BACKLOG.md`.
- [ ] Add hooks to `~/.claude/settings.json` (merge `hooks/settings-snippet.json`).
- [ ] Commit. Future sessions inherit the structure automatically.
