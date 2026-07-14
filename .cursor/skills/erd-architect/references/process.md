# Process — Five Phases

Follow these phases in order. Do not skip phases. Do not loop back.

## Phase 0 — Input Check

**CASE A — Structured PRD:** Read `DOCS/Maison-Malka-PRD.md` → proceed to Phase 1.

**CASE B — Free-form description:** Ask user to provide PRD or answer 5–6 extraction questions.

**CASE C — No input:** Stop and request PRD.

## Phase 1 — Read

Silently extract from PRD + Architecture Plan:

- In-scope / out-of-scope (contract)
- MVP flow steps (§9)
- Closed decisions (§13)
- Entity candidates from nouns and verbs

Do not ask questions yet. Do not draft yet.

## Phase 2 — Clarify (Only If Necessary)

Ask 0–4 questions only when genuinely ambiguous. Consult `modeling-patterns.md`.

Do NOT ask about databases, frameworks, indexes, or performance.

If PRD + Architecture are clear, skip Phase 2.

## Phase 3 — Draft

1. Read `output-template.md`
2. Read `mermaid-syntax.md`
3. Write `DOCS/Maison-Malka-ERD.md` in one pass
4. Run `anti-patterns.md` checks

## Phase 4 — Review

Show the ERD. Ask exactly one question:
"What needs to change? (entity name + add/remove/fix)"

Apply only requested changes.

## Phase 5 — Deliver

When approved:

1. Final quality check
2. Confirm `DOCS/Maison-Malka-ERD.md` is the locked ERD
3. Stop — do not continue to implementation
