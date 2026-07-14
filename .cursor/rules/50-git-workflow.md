# 50. Git Workflow Rules

## 10. Purpose
Defines branch and commit discipline for Team Yuri phase work in this repository.

## 20. Branch Model

| Branch | Role |
|---|---|
| `main` | Production-stable. Releases and approved phase completions only. |
| `develop` | Primary integration branch. Day-to-day work lands here. |
| `phase-<N>/<slug>` | Short-lived phase implementation branch from `develop`. |

Rules:
- Do not implement phase work directly on `main` or `develop`.
- Do not commit `.env.local`, `.cursor/mcp.json`, credentials, or other secrets.
- Do not force-push `main` or rewrite published history unless the user explicitly requests it.
- Do not push to remote unless the user asked for git publication or phase implementation is in progress under Team Yuri Developer.
- Hotfixes on `main` are allowed only when the user explicitly requests a production hotfix.

## 30. Phase Branches

At the start of Team Yuri phase `N` implementation:

1. Ensure `develop` is current: `git fetch origin` when a remote exists.
2. Create and checkout: `phase-<N>/<short-slug>` from `develop`.
   - Example: `phase-3/order-management`
   - `<short-slug>`: lowercase, hyphenated, 2–4 words from the phase goal.
3. Record the branch name in `team-Yuri/dev-phase<N>.md`.

Retroactive branches (e.g. after work landed on `main`) are optional and only when the user asks.

## 40. Commit Cadence

Commit after each **significant milestone**, not after every tiny edit.

| Significant milestone | Commit when |
|---|---|
| Database migration | Migration files apply cleanly |
| Feature slice | Milestone behavior works or tests pass for that slice |
| Tests / lint gate | Required verification passes for the milestone |
| Phase artifact | `dev-phase<N>.md` updated with evidence for that milestone |

Avoid empty commits, WIP dumps, and one giant commit at phase end unless the phase is very small.

## 50. Commit Message Format

```text
phase<N>: <imperative summary>
```

Examples:
- `phase-3: add order status migration`
- `phase-3: admin order list and detail pages`
- `phase-3: document verification evidence`

Optional second line for context. No secrets in messages.

## 60. Phase Completion

Before phase close or G3 advance:

1. Working tree clean or only intentional unstaged files documented in `dev-phase<N>.md`.
2. Phase branch pushed to `origin` when remote exists.
3. Merge `phase-<N>/<slug>` → `develop` via PR or explicit user-approved merge.
4. Commits and branch name recorded in `dev-phase<N>.md`.
5. Merge `develop` → `main` only when the user approves a release or phase promotion.

Do not merge to `main` without user approval.

## 70. Developer Evidence

`team-Yuri/dev-phase<N>.md` must include a **Git** section (see dev-phase template) with branch name, commit list, and push status.

## 80. Skill Binding

Team Yuri Developer (`team-yuri-developer`) enforces this rule during IMPLEMENT.
Other roles do not create phase branches or implementation commits unless the user explicitly asks.
