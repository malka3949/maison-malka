# runtime-verify

The **one non-read-only** package in the audit suite. It actively confirms *static* security findings
against a **running** instance — turning "config says exposed" into "HTTP 200, here's the body". It does
the narrow, high-value slice of DAST (confirm the confirmable), not full active discovery. For the big
picture: `../README.md`.

```text
runtime-verify/
├── SKILL.md
├── references/runtime-checks.md   confirmable types + per-type probe + safety rules + verdicts
└── assets/ (template inline in the workflow)
~/.claude/agents/runtime-verifier.md     probes ONE finding, returns verdict+evidence (sends HTTP)
~/.claude/commands/runtime-confirm.md    /runtime-confirm <report> <baseUrl>
~/.claude/workflows/runtime-confirm.js   extract confirmable → probe each → write RUNTIME-CONFIRMATION.md
```

## ⚠️ Side effects — read this
- **Sends real HTTP requests.** Local/staging/disposable targets **only — never production** (refuses prod-like URLs).
- Non-destructive: GET/HEAD/OPTIONS, low volume, no fuzzing, `-m 10`.
- May boot a **disposable** compose stack (isolated `-p audit_tmp`, localhost) only on explicit opt-in, and tears it down.
- Opt-in: prefer giving it a base URL you already run.

## Run
```bash
/runtime-confirm <repo>/security/SOFTWARE-SECURITY-FINDINGS.md http://127.0.0.1:<port>
Workflow({ name:"runtime-confirm", args:{ report:"<...>/SOFTWARE-SECURITY-FINDINGS.md", baseUrl:"http://127.0.0.1:<port>" } })
```
Output: `<report-dir>/RUNTIME-CONFIRMATION.md` — each finding → confirmed / not-reproduced / inconclusive / n-a + HTTP evidence.

## Where it fits
```text
/secure-audit + /infra-audit   →  find (static)
runtime-confirm                →  confirm the confirmable (runtime evidence)
```
Confirmable: unauth endpoints, missing security headers, http→https, error leaks, IDOR, rate-limit, open CORS, banners.
Source-only (hard-coded secret, mass-assignment, plaintext token in DB) stay static → marked `not-applicable`.
