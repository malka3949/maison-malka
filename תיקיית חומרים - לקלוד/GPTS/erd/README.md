# ERD Architect Agent — Setup Guide

## File Layout

```
erd-agent/
├── INSTRUCTIONS.md          ← System Prompt (paste into agent's instructions field)
├── process.md               ← Knowledge: 5-phase process
├── output_template.md       ← Knowledge: exact output structure & logical types
├── mermaid_syntax.md        ← Knowledge: Mermaid ER syntax reference
├── modeling_patterns.md     ← Knowledge: patterns for ambiguous cases
└── anti_patterns.md         ← Knowledge: anti-patterns, quality checks, examples
```

## File Sizes

| File | Size | Role |
|------|------|------|
| INSTRUCTIONS.md | ~1.6 KB | Identity, boundary, references — read every turn |
| process.md | ~3.4 KB | Read at start of session |
| output_template.md | ~6.0 KB | Read before drafting (Phase 3) |
| mermaid_syntax.md | ~6.5 KB | Read while drawing diagram |
| modeling_patterns.md | ~11.5 KB | Consulted only when ambiguity arises |
| anti_patterns.md | ~4.1 KB | Read before output (Phase 3 and Phase 5) |

The split keeps the System Prompt well under 8K, while putting reference content where it belongs — in retrievable knowledge files that the agent reads on demand.

## How to Set Up

### Option A: ChatGPT Custom GPT
1. Create a new GPT in the GPT Builder.
2. Paste contents of `INSTRUCTIONS.md` into the **Instructions** field.
3. In the **Knowledge** section, upload all five knowledge files.
4. Disable unnecessary capabilities (Web Browsing, DALL-E, Code Interpreter).
5. Save.

### Option B: Claude Project
1. Create a new Project.
2. Paste `INSTRUCTIONS.md` into Project Instructions.
3. Add the five knowledge files to Project Knowledge.
4. Save.

### Option C: API
1. Use `INSTRUCTIONS.md` as the system prompt.
2. Inject knowledge files as tool-retrievable resources, or appended with clear delimiters.

## Verification — Run Before Class

### Test 1: Structured PRD input
Paste a PRD with the standard 8-section format.
Expected: reads silently, drafts or asks 1-3 lettered questions, outputs full ERD with Coverage Map covering every user story, no mention of any database.

### Test 2: Free-form description
Paste: "I want to build a workout tracking app where I log exercises and see my progress."
Expected: asks Case B response (paste PRD or answer 5-7 questions); if user picks questions, asks the six structured questions, then drafts.

### Test 3: Off-track push
Paste a PRD, then ask "should I use Postgres or MongoDB?"
Expected: returns boundary response, does NOT recommend a database, returns to ERD work.

## Common Failures to Watch For

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Suggests "use Postgres" | Boundary not enforced | Reinforce `INSTRUCTIONS.md` boundary section |
| Skips Coverage Map | Template not consulted | Confirm `output_template.md` is uploaded |
| Invents entities not in PRD | Out of Scope ignored | Reinforce in `anti_patterns.md` |
| Uses VARCHAR or BIGINT | Logical types not enforced | Confirm `output_template.md` is loaded |
| Asks too many questions | Phase 2 limit not held | Reinforce in `process.md` |
| Mermaid diagram malformed | Syntax not consulted | Confirm `mermaid_syntax.md` is uploaded |

## What Makes This Agent Good

The boundary is the product. The agent's value is what it does NOT do — it does not cross into tech stack territory, does not invent features, does not pad output. It produces a logical model that maps cleanly to the PRD and hands off cleanly to the next agent.

If the agent drifts, the fix is always the same: tighten the relevant rule in the appropriate knowledge file and re-test.
