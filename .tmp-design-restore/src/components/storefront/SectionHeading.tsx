import Link from "next/link";

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
        <h2 className="mm-page-title font-heading" style={{ fontSize: "clamp(1.85rem, 4vw, 2.75rem)" }}>
          {title}
        </h2>
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
