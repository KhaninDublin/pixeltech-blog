import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata = { title: "Tags" };

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { posts: { _count: "desc" } },
    include: { _count: { select: { posts: true } } },
  });
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">All tags</h1>
      <p className="mt-1 text-muted">Browse writing by subject area.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {tags.map((t) => (
          <Link
            key={t.id}
            href={`/tags/${t.slug}`}
            className="card-hover flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: t.color }}
                aria-hidden
              />
              <span className="font-semibold">{t.name}</span>
            </div>
            <span className="text-xs text-muted">{t._count.posts} posts</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
