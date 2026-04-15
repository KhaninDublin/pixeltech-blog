import Link from "next/link";

export function TagPill({ tag }: { tag: { slug: string; name: string; color: string } }) {
  return (
    <Link
      href={`/tags/${tag.slug}`}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface2 px-3 py-1 text-xs font-medium text-text hover:border-accent/60 hover:text-white"
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: tag.color }}
        aria-hidden
      />
      {tag.name}
    </Link>
  );
}
