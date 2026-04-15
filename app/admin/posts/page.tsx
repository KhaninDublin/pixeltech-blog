import Link from "next/link";
import { prisma } from "@/lib/db";
import { PostRow } from "./post-row";
import { timeAgo } from "@/lib/utils";

export const metadata = { title: "Admin · Posts" };

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: "all" | "drafts" | "featured" }>;
}) {
  const { q, filter = "all" } = await searchParams;
  const query = (q ?? "").trim();

  const where = {
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { content: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(filter === "drafts" ? { published: false } : {}),
    ...(filter === "featured" ? { featured: true } : {}),
  };

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      author: { select: { username: true, name: true } },
      _count: { select: { comments: true, likes: true } },
    },
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="text-sm text-muted">{posts.length} shown</p>
        </div>
        <div className="flex items-center gap-2">
          <nav className="flex rounded-lg border border-border bg-surface text-xs">
            {(["all", "drafts", "featured"] as const).map((f) => (
              <Link
                key={f}
                href={`/admin/posts?filter=${f}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                className={
                  (filter === f ? "bg-accent text-white" : "text-muted hover:text-white") +
                  " px-3 py-2 capitalize"
                }
              >
                {f}
              </Link>
            ))}
          </nav>
          <form action="/admin/posts" className="w-64">
            <input type="hidden" name="filter" value={filter} />
            <input type="search" name="q" defaultValue={query} placeholder="Search..." className="input" />
          </form>
        </div>
      </header>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface2 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Author</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Engagement</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {posts.map((p) => (
              <PostRow
                key={p.id}
                post={{
                  id: p.id,
                  slug: p.slug,
                  title: p.title,
                  published: p.published,
                  featured: p.featured,
                  authorName: p.author.name,
                  authorUsername: p.author.username,
                  createdAt: timeAgo(p.createdAt),
                  comments: p._count.comments,
                  likes: p._count.likes,
                  views: p.views,
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
