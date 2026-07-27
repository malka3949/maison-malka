"""Apply restored storefront design classNames + missing CSS utilities."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(r"C:\Users\user1\Desktop\Masion-malka")
OPS = json.loads((ROOT / ".tmp-design-restore" / "ops.json").read_text(encoding="utf-8"))

SHARED_CSS = r"""
.mm-header {
  border-bottom: 1px solid rgba(217, 205, 184, 0.7);
  background: rgba(245, 239, 230, 0.82);
  backdrop-filter: blur(14px) saturate(1.15);
  -webkit-backdrop-filter: blur(14px) saturate(1.15);
}

.mm-section-head {
  margin-bottom: 1.85rem;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.85rem;
}

.mm-section-link {
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-decoration: none;
  color: var(--color-mm-primary);
  border-bottom: 1px solid var(--color-mm-cta);
  padding-bottom: 2px;
  transition: color 200ms, border-color 200ms, opacity 200ms;
}

.mm-section-link:hover {
  color: var(--color-mm-word);
  border-color: var(--color-mm-word);
}

.mm-footer {
  border-top: 1px solid rgba(217, 205, 184, 0.5);
  background:
    linear-gradient(180deg, #ede0d4 0%, #e4d5c4 100%);
  padding-block: 3.25rem;
}

.mm-footer-link {
  cursor: pointer;
  color: var(--color-mm-primary);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  padding-bottom: 1px;
  transition: border-color 200ms, color 200ms, opacity 200ms;
}

.mm-footer-link:hover {
  border-color: var(--color-mm-cta);
  color: var(--color-mm-word);
}

/* —— Shared inner pages —— */
.mm-page {
  padding-block: 2.75rem 3.75rem;
}

.mm-page-title {
  font-size: clamp(2.15rem, 5vw, 3.35rem);
  line-height: 1.05;
  letter-spacing: -0.035em;
  color: var(--color-mm-primary);
}

.mm-section-title {
  font-size: clamp(1.85rem, 4vw, 2.75rem);
  line-height: 1.08;
  letter-spacing: -0.03em;
  color: var(--color-mm-primary);
}

.mm-page-lead {
  margin-top: 0.75rem;
  max-width: 36rem;
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--color-mm-secondary);
}

.mm-page-banner {
  margin-bottom: 2rem;
  padding-bottom: 1.75rem;
  border-bottom: 1px solid var(--color-mm-line);
  background:
    linear-gradient(180deg, rgba(184, 149, 108, 0.07), transparent 100%);
  margin-inline: -0.25rem;
  padding-inline: 0.25rem;
}

.mm-back-link {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 500;
  letter-spacing: 0.03em;
  color: var(--color-mm-secondary);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  padding-bottom: 1px;
  transition: color 200ms, border-color 200ms;
}

.mm-back-link:hover {
  color: var(--color-mm-primary);
  border-color: var(--color-mm-cta);
}

.mm-panel {
  border: 1px solid var(--color-mm-line);
  background:
    linear-gradient(165deg, rgba(255, 251, 246, 0.98) 0%, rgba(245, 239, 230, 0.72) 100%);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.65) inset, 0 12px 32px rgba(28, 22, 18, 0.05);
  padding: 1.5rem;
}

@media (min-width: 768px) {
  .mm-panel {
    padding: 2rem;
  }
}

.mm-panel-inset {
  border: 1px solid var(--color-mm-line);
  background: rgba(237, 224, 212, 0.45);
  padding: 0.85rem 1rem;
}

.mm-list-panel {
  border: 1px solid var(--color-mm-line);
  background: var(--color-mm-surface);
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(28, 22, 18, 0.05);
}

.mm-list-panel > * + * {
  border-top: 1px solid var(--color-mm-line);
}

.mm-eyebrow {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-mm-word);
}

.mm-auth-shell {
  width: min(28rem, 100%);
  margin-inline: auto;
}

.mm-contact-shell {
  width: min(32rem, 100%);
  margin-inline: auto;
}

.mm-legal-article {
  width: min(42rem, 100%);
  margin-inline: auto;
}

.mm-legal-article header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-mm-line);
}

.mm-legal-article h2 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-mm-primary);
  letter-spacing: -0.01em;
}

.mm-thumb {
  aspect-ratio: 1;
  border: 1px solid var(--color-mm-line);
  object-fit: cover;
  transition: border-color 200ms;
}

.mm-thumb:hover {
  border-color: var(--color-mm-cta);
}

.mm-dialog {
  width: min(28rem, 100%);
  border: 1px solid var(--color-mm-line);
  background:
    linear-gradient(165deg, #fffbf6 0%, #f5efe6 100%);
  box-shadow: 0 24px 60px rgba(28, 22, 18, 0.28);
  padding: 1.5rem;
}

.mm-scroller-btn {
  position: absolute;
  top: 50%;
  z-index: 10;
  display: none;
  height: 2.5rem;
  width: 2.5rem;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-mm-line);
  background: rgba(255, 251, 246, 0.92);
  backdrop-filter: blur(8px);
  color: var(--color-mm-primary);
  font-size: 1.1rem;
  transform: translateY(-50%);
  transition: background-color 200ms, border-color 200ms, color 200ms;
}

.mm-scroller-btn:hover {
  background: var(--color-mm-cta);
  border-color: var(--color-mm-cta);
}

@media (min-width: 768px) {
  .mm-scroller-btn {
    display: flex;
  }
}

.mm-scroller-btn--prev {
  inset-inline-start: 0;
}

.mm-scroller-btn--next {
  inset-inline-end: 0;
}
"""

changed: list[str] = []


def apply_str(path: Path, old: str, new: str, replace_all: bool) -> bool:
    text = path.read_text(encoding="utf-8")
    if old not in text:
        return False
    if replace_all:
        updated = text.replace(old, new)
    else:
        updated = text.replace(old, new, 1)
    if updated == text:
        return False
    path.write_text(updated, encoding="utf-8")
    return True


# 1) Inject CSS utilities into globals.css if missing
globals_path = ROOT / "src" / "app" / "globals.css"
g = globals_path.read_text(encoding="utf-8")
if ".mm-page-title" not in g:
    marker = "@media (prefers-reduced-motion: reduce) {"
    if marker not in g:
        raise SystemExit("Could not find reduced-motion marker in globals.css")
    # Only inject classes that are missing
    inject = SHARED_CSS
    # Avoid duplicating if partial exists
    for cls in [".mm-header {", ".mm-footer {", ".mm-section-head {"]:
        if cls in g:
            # strip that block from inject roughly - keep simple: if mm-header exists skip header part
            pass
    g = g.replace(marker, inject.strip() + "\n\n" + marker, 1)
    globals_path.write_text(g, encoding="utf-8")
    changed.append("src/app/globals.css")
    print("injected CSS utilities into globals.css")
else:
    print("globals.css already has mm-page-title")

# 2) Apply non-globals ops in order (skip globals — handled above)
for o in OPS:
    rel = o["rel"].replace("\\", "/")
    if rel.endswith("globals.css"):
        continue
    path = ROOT / rel
    if not path.exists():
        print("MISSING", rel)
        continue
    if o["kind"] == "write":
        contents = o["contents"]
        # SectionHeading final should use mm-section-title (later patch)
        path.write_text(contents, encoding="utf-8")
        if rel not in changed:
            changed.append(rel)
        print("WRITE", rel)
    elif o["kind"] == "str":
        ok = apply_str(path, o["old"], o["new"], o["all"])
        if ok:
            if rel not in changed:
                changed.append(rel)
            print("OK", rel, "line", o["line"])
        else:
            # try if already applied
            if o["new"] and o["new"] in path.read_text(encoding="utf-8"):
                print("ALREADY", rel, "line", o["line"])
            else:
                print("FAIL", rel, "line", o["line"])
                print("  old starts:", repr((o["old"] or "")[:80]))

# 3) Ensure SectionHeading uses mm-section-title (final intended state)
sh = ROOT / "src/components/storefront/SectionHeading.tsx"
sh_text = sh.read_text(encoding="utf-8")
if "mm-section-title" not in sh_text and "mm-page-title font-heading" in sh_text:
    sh_text2 = sh_text.replace(
        '<h2 className="mm-page-title font-heading" style={{ fontSize: "clamp(1.85rem, 4vw, 2.75rem)" }}>\n          {title}\n        </h2>',
        '<h2 className="mm-section-title font-heading">{title}</h2>',
    )
    if sh_text2 == sh_text:
        sh_text2 = sh_text.replace(
            'mm-page-title font-heading" style={{ fontSize: "clamp(1.85rem, 4vw, 2.75rem)" }}',
            'mm-section-title font-heading"',
        )
        # clean leftover style tag content if broken - safer rewrite
    if "mm-section-title" not in sh_text2:
        sh_text2 = '''import Link from "next/link";

type Props = {
  title: string;
  subtitle?: string;
  moreHref?: string;
  moreLabel?: string;
};

export function SectionHeading({ title, subtitle, moreHref, moreLabel }: Props) {
  return (
    <div className="mm-section-head">
      <div>
        <h2 className="mm-section-title font-heading">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-mm-secondary">{subtitle}</p> : null}
      </div>
      {moreHref && moreLabel ? (
        <Link href={moreHref} className="mm-section-link">
          {moreLabel}
        </Link>
      ) : null}
    </div>
  );
}
'''
    sh.write_text(sh_text2, encoding="utf-8")
    if "src/components/storefront/SectionHeading.tsx" not in changed:
        changed.append("src/components/storefront/SectionHeading.tsx")
    print("fixed SectionHeading to mm-section-title")

print("\nCHANGED FILES:")
for c in changed:
    print(c)
