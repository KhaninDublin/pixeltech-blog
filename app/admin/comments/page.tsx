import Link from "next/link";
import { prisma } from "@/lib/db";
import { CommentRow } from "./comment-row";
import { timeAgo } from "@/lib/utils";

export const metadata = { title: "Admin · Comments" };

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: "all" | "hidden" }>;
}) {
  const { filter = "all" } = await searchParams;
  const rows = await prisma.comment.findMany({
    where: filter === "hidden" ? { hidden: true } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      author: { select: { username: true, name: true } },
      post:   { select: { slug: true, title: true } },
    },
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Comments</h1>
          <p className="text-sm text-muted">{rows.length} shown</p>
        </div>
        <nav className="flex rounded-lg border border-border bg-surface text-xs">
          {(["all", "hidden"] as const).map((f) => (
            <Link
              key={f}
              href={`/admin/comments?filter=${f}`}
              className={
                (filter === f ? "bg-accent text-white" : "text-muted hover:text-white") +
                " px-3 py-2 capitalize"
              }
            >
              {f}
            </Link>
          ))}
        </nav>
      </header>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface2 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 text-left">Comment</th>
              <th className="px-4 py-3 text-left">Author</th>
              <th className="px-4 py-3 text-left">Post</th>
              <th className="px-4 py-3 text-left">Posted</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((c) => (
              <CommentRow
                key={c.id}
                row={{
                  id: c.id,
                  content: c.content,
                  hidden: c.hidden,
                  authorName: c.author.name,
                  authorUsername: c.author.username,
                  postSlug: c.post.slug,
                  postTitle: c.post.title,
                  when: timeAgo(c.createdAt),
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
