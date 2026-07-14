import Link from "next/link";

type Props = {
  title: string;
  subtitle?: string;
  moreHref?: string;
  moreLabel?: string;
};

export function SectionHeading({ title, subtitle, moreHref, moreLabel }: Props) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-heading text-3xl text-mm-primary md:text-4xl">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-mm-secondary">{subtitle}</p> : null}
      </div>
      {moreHref && moreLabel ? (
        <Link
          href={moreHref}
          className="cursor-pointer text-sm font-medium text-mm-secondary underline-offset-4 transition-colors hover:text-mm-primary hover:underline"
        >
          {moreLabel}
        </Link>
      ) : null}
    </div>
  );
}
