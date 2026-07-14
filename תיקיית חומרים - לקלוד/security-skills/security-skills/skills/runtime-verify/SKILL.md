---
name: runtime-verify
description: >
  Actively confirm static security findings against a RUNNING instance — the one non-read-only tool in
  the audit suite. Reads a findings report (from /secure-audit or /infra-audit), extracts the
  runtime-confirmable items (unauth endpoints, missing security headers, http→https, error leaks, IDOR,
  rate-limit, open CORS), sends a few targeted non-destructive HTTP probes, and writes a confirmation
  report upgrading each to confirmed/not-reproduced with HTTP evidence. Use when asked to confirm/repro a
  security finding at runtime, DAST-lite, "is it actually exposed", or runs runtime-confirm. Side-effecting
  (sends requests / may boot a disposable stack) — opt-in, local/staging only, never production.
metadata:
  author: skill-crator session
  version: "1.0"
---

# runtime-verify

Turn static security findings into **runtime-confirmed** facts. This is the **only** package here that
is not read-only — it sends real HTTP requests. It deliberately does the narrow, high-value slice of
DAST: confirm the confirmable findings; it does NOT try to re-discover everything (full active DAST is
future work).

## Baseline
- **`references/runtime-checks.md`** — which findings are confirmable, the exact probe per type, the
  safety rules, verdicts, and the disposable-boot procedure. **Load first.**

## Inputs (one of)
- `report` = path to a findings report (`SOFTWARE-SECURITY-FINDINGS.md` / `INFRA-SECURITY-FINDINGS.md`)
  **and** `baseUrl` = a local/staging origin → confirm each confirmable finding.
- `report` only, no baseUrl → either ask for a base URL, or (explicit opt-in) boot a **disposable**
  compose project bound to localhost, probe, then tear it down.

## Safety (non-negotiable)
```text
✗ never target production (public prod hostname/IP) — refuse and stop
✗ never destructive verbs / fuzzing / brute-force — a few GET/HEAD/OPTIONS per finding
✓ low volume, -m 10 timeout; IDOR uses two low-priv test accounts on read-only endpoints
✓ if booting a stack: isolated project (-p audit_tmp), localhost bind, tear down after (down -v)
```

## Workflow
1. Load `references/runtime-checks.md`. Resolve `baseUrl` (given) or boot a disposable instance (opt-in).
   If the target looks like production → **stop**.
2. Read the findings report; **extract the runtime-confirmable findings** (unauth endpoint, missing
   header, http→https, error-leak, IDOR, rate-limit, CORS, banner). Source-only findings (hard-coded
   secret, mass-assignment, plaintext-token-in-DB) are marked `not-applicable` — keep them static.
3. For each confirmable finding, spawn `runtime-verifier` with the finding + baseUrl → verdict + HTTP
   evidence. (Parallel, but keep total request volume low.)
4. **Write** `<dir>/RUNTIME-CONFIRMATION.md`: a table of finding → verdict (confirmed / not-reproduced /
   inconclusive / n-a) → status + evidence. Confirmed items are the ones to fix first; not-reproduced
   items are candidate false-positives to recheck.
5. If a stack was booted, **tear it down** and say so.

## Rules
- This is side-effecting and opt-in. Default to **not** booting anything; prefer a user-given base URL.
- Never production. Never destructive. Low volume. Tear down what you start.
- Evidence is the point — every `confirmed` carries an HTTP status + a short body/header snippet.
- It confirms, it does not fix. Pair with `/secure-audit` + `/infra-audit` (which find) upstream.
