# Developer Git Discipline

Read `.cursor/rules/50-git-workflow.md` before IMPLEMENT.

## At IMPLEMENT start

1. Read `PHASE.md` → `N`.
2. Derive slug from `manager-phase<N>.md` phase goal (2–4 hyphenated words).
3. Run:
   ```bash
   git fetch origin
   git checkout main
   git pull --ff-only origin main
   git checkout -b phase-<N>/<slug>
   ```
4. Record branch name in `dev-phase<N>.md` → Git section.

If `git pull` fails or branch already exists, stop and report; do not guess.

## During implementation

After each Manager milestone (or equivalent slice in `manager-phase<N>.md`):

1. Complete the milestone scope.
2. Run tests/lint when required for that slice.
3. Commit with `phase<N>: <milestone summary>`.
4. Update Implemented Milestones and Git tables in `dev-phase<N>.md`.

## At IMPLEMENT end

1. Ensure verification evidence is documented.
2. `git push -u origin phase-<N>/<slug>` when remote exists.
3. Record final commit SHAs and push result in `dev-phase<N>.md`.

## Never

- Commit secrets (`.env.local`, `.cursor/mcp.json`, tokens).
- Commit on `main` during normal phase work.
- Push without user-requested publication or active Team Yuri IMPLEMENT.
