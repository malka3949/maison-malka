# Developer Phase 6

## Phase Identifier
PHASE=6

## Status
STATUS: COMPLETE

## Source References

- `team-Yuri/arch-phase6.md`
- `team-Yuri/manager-phase6.md`
- `team-Yuri/plan.md` — Phase 6 Site Content CMS
- `.cursor/rules/20-testing.md`, `30-docs.md`, `50-git-workflow.md`

## Implementation Summary

Implemented Site Content CMS: Prisma models `SiteMedia`, `SiteContentBlock`, `SiteSettings` + migration; allowlisted content helpers with messages/`HOME_MEDIA` fallback; `site-media` upload + NetFree-friendly local/proxy URLs; admin pages `/admin/site`, `/admin/media`, `/admin/settings` with nav; storefront layout/home/footer read CMS overrides. Phase 4 Production remains PARKED.

## Implemented Milestones

| Milestone | Completed: Yes/No | Notes |
|---|---:|---|
| M0 Git branch | Yes | `phase-6/site-content-cms` (existing remote branch checked out) |
| M1 Schema + ERD | Yes | Migration `20260716120000_phase6_site_cms`; ERD §4b |
| M2 Allowlist + libs | Yes | `src/lib/site-content.ts` + unit tests |
| M3 Storage + upload | Yes | `/api/admin/upload-site-media`; local cache + `/api/media/site-media` |
| M4 Media admin | Yes | `/admin/media` |
| M5 Site content admin | Yes | `/admin/site` HE/EN + image slots |
| M6 Settings admin | Yes | `/admin/settings` |
| M7 Admin nav | Yes | layout nav links |
| M8 Storefront readers | Yes | layout/home/footer merge CMS |
| M9 Gates + evidence | Yes | lint/test/build PASS; this file |

## Files Changed

| File | Change Summary | Reason |
|---|---|---|
| `prisma/schema.prisma` | SiteMedia / SiteContentBlock / SiteSettings | M1 |
| `prisma/migrations/20260716120000_phase6_site_cms/` | SQL migration | M1 |
| `DOCS/Maison-Malka-ERD.md` | CMS entities | M1 docs |
| `src/lib/site-content.ts` | Allowlist + merge helpers | M2 |
| `src/lib/site-cms.ts` | DB loaders | M8 |
| `src/lib/site-media-url.ts` | Public URLs | M3 |
| `src/lib/local-site-media.ts` | Local disk cache | M3 |
| `src/lib/actions/site-cms.ts` | Admin server actions | M4–M6 |
| `src/app/api/admin/upload-site-media/route.ts` | Upload API | M3 |
| `src/app/api/media/site-media/[...path]/route.ts` | Media proxy | M3 |
| `src/app/admin/(protected)/{site,media,settings}/page.tsx` | Admin UI | M4–M6 |
| `src/components/admin/Site*.tsx` | Admin forms | M4–M6 |
| `src/app/admin/(protected)/layout.tsx` | Nav | M7 |
| `src/app/[locale]/layout.tsx` | CMS messages + settings | M8 |
| `src/app/[locale]/page.tsx` | CMS home media + messages | M8 |
| `src/components/storefront/StorefrontFooter.tsx` | Settings display | M8 |
| `src/lib/i18n.ts`, `src/messages/{he,en}.ts` | contactLabel / hoursLabel | M8 |
| `next.config.ts` | site-media rewrite/headers | M3 |
| `README.md` | CMS routes + site-media bucket | Docs |
| `tests/lib/phase6-site-cms.test.ts` | Allowlist/fallback/ticker | M2/M9 |
| `team-Yuri/manager-phase6.md` | Track Manager plan | Artifact |

## Dependencies Installed

| Dependency / Tool | Command Used | Reason |
|---|---|---|
| (none new) | — | Used existing stack |

## Unit Tests

| Field | Value |
|---|---|
| Command | `npm test` |
| Result | PASS |
| Notes | 25 tests (7 new in `phase6-site-cms.test.ts`) |

## Lint

| Field | Value |
|---|---|
| Command | `npm run lint` |
| Result | PASS |
| Notes | No ESLint warnings or errors |

## Build

| Field | Value |
|---|---|
| Command | `npx next build` |
| Result | PASS |
| Notes | Routes include `/admin/site`, `/admin/media`, `/admin/settings`, upload + media APIs |

## Functional Testability Evidence

| Field | Value |
|---|---|
| Method | CLI migrate + build route proof; unit tests for CMS merge |
| Steps | 1) `npx prisma migrate deploy` applied `20260716120000_phase6_site_cms`. 2) `npm test` / `npm run lint` / `npx next build` PASS. 3) Build output lists `/admin/site`, `/admin/media`, `/admin/settings`, `/api/admin/upload-site-media`, `/api/media/site-media/[...path]`. |
| Expected Result | Schema live; CMS surfaces compile; empty CMS falls back to messages/`HOME_MEDIA` |
| Actual Result | PASS |
| Notes | Full browser admin login → edit hero → `/he` visual E2E not re-run in this session (requires interactive admin session). Empty-CMS fallback covered by unit tests. Recommend manual smoke after deploy: login → `/admin/site` → save HE hero.title → refresh `/he`. |

## Documentation Update Evidence

| Field | Value |
|---|---|
| Documentation Updated | YES |
| Files Updated | `DOCS/Maison-Malka-ERD.md`, `README.md` |
| Reason if Not Required | — |

## Git

| Field | Value |
|---|---|
| Branch | `phase-6/site-content-cms` |
| Base | `develop` |
| Push | (pending this completion) |
| Remote | `origin` https://github.com/malka3949/maison-malka |

### Commits

| SHA (short) | Message | Milestone |
|---|---|---|
| (filled after commit) | `phase6: ...` | M1–M9 |

## Known Issues / Limitations

- Phase 4 Production / live Resend remains PARKED / open.
- `site-media` bucket is auto-created on first admin upload when service role is available; create manually in Supabase if preferred.
- Image slots stored as `SiteContentBlock` with shared locale `he` only (per Manager plan).
- Interactive admin→storefront browser E2E left as recommended manual smoke (see Functional notes).

## Scope Compliance

- [x] Allowlisted keys only; plain text; no HTML CMS render
- [x] No payments/loyalty/page builder
- [x] Catalog/order domain not changed
- [x] Production not required to close phase
- [x] Branch naming per workflow

## Developer Declaration

READY_FOR_MANAGER_REVIEW
