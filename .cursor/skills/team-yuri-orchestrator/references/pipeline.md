# Team Yuri Pipeline — Visual Flow

## Full phase lifecycle

```text
                    ┌─────────────────────────────────────┐
                    │  USER invokes team-yuri-orchestrator │
                    └──────────────────┬──────────────────┘
                                       │
         ┌─────────────────────────────▼─────────────────────────────┐
         │                    ARCHITECT (Yuri)                        │
         │  S01 INIT → S02 PLANNING → S03 PHASE-DESIGN               │
         └─────────────────────────────┬─────────────────────────────┘
                                       │ G2: user approves arch
         ┌─────────────────────────────▼─────────────────────────────┐
         │                    MANAGER (Ben)                           │
         │  S04 MANAGER-PLANNING                                      │
         └─────────────────────────────┬─────────────────────────────┘
                                       │ G4: optional pause
         ┌─────────────────────────────▼─────────────────────────────┐
         │                   DEVELOPER (Sarah)                        │
         │  S05 IMPLEMENT + tests + lint + dev-phase<N>.md             │
         └─────────────────────────────┬─────────────────────────────┘
                                       │
         ┌─────────────────────────────▼─────────────────────────────┐
         │                    MANAGER (Ben)                           │
         │  S06 REVIEW-DEVELOPER → approve or reject                  │
         └──────────────┬──────────────────────────┬─────────────────┘
                        │ reject                    │ approve
                        ▼                           ▼
                   back to S05              ┌──────────────────┐
                                            │ ARCHITECT (Yuri) │
                                            │ S07 REVIEW-PHASE │
                                            └────────┬─────────┘
                                                     │ approve
                                                     ▼
                                            ┌──────────────────┐
                                            │ S08 PHASE-COMPLETE│
                                            │ G3: user advances │
                                            │     PHASE.md      │
                                            └──────────────────┘
```

## Gates explained

| Gate | When | User action |
|---|---|---|
| G1 INIT | Before first `PHASE.md` | Confirm start at Phase 1 |
| G2 ARCH→MGR | `arch-phase<N>.md` ready | "Approve handoff to Manager" |
| G3 ADVANCE | Phase fully approved | Confirm `PHASE=N+1` update |
| G4 MGR→DEV | `manager-phase<N>.md` ready | Optional in `phase`/`full` mode |

## Invocation examples

```text
@team-yuri-orchestrator step
→ Run one step only

@team-yuri-orchestrator phase
→ Run until next mandatory gate

@team-yuri-orchestrator full
→ Run full pipeline with gates only

הפעל Team Yuri — המשך את הפאזה הנוכחית
→ Detect state and continue
```

## Rejection loops

| Reviewer | Rejects because | Return to |
|---|---|---|
| Manager | Failed tests/lint, missing evidence | S05 Developer |
| Manager | Scope violation in implementation | S05 Developer |
| Architect | Architecture misalignment | S03 or S05 (depends on issue) |
| Architect | Incomplete functional testability | S05 Developer |

## Artifact checklist per phase N

Before declaring S08 complete, verify:

- [ ] `arch-phase<N>.md` — STATUS approved
- [ ] `manager-phase<N>.md` — complete with acceptance criteria
- [ ] `dev-phase<N>.md` — tests, lint, functional evidence documented
- [ ] Manager review: PASS
- [ ] Architect review: PASS

## Anti-patterns

- Running Developer before Manager plan exists
- Skipping Manager review because "code looks fine"
- Updating `PHASE.md` without user confirmation
- Writing PRD/ERD content into `team-Yuri/` artifacts
- Creating duplicate skills that copy Architect/Manager/Developer rules
