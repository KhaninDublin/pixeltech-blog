import Link from "next/link";
import { prisma } from "@/lib/db";
import { timeAgo } from "@/lib/utils";

export const metadata = { title: "Admin · Dashboard" };

export default async function AdminDashboard() {
  const [userCount, postCount, commentCount, likeCount, recentPosts, recentUsers, topPosts] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.comment.count(),
    prisma.like.count(),
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        slug: true,
        title: true,
        createdAt: true,
        published: true,
        author: { select: { username: true } },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, username: true, role: true, createdAt: true },
    }),
    prisma.post.findMany({
      orderBy: [{ views: "desc" }],
      take: 5,
      select: { id: true, slug: true, title: true, views: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Users" value={userCount} />
        <Stat label="Posts" value={postCount} />
        <Stat label="Comments" value={commentCount} />
        <Stat label="Likes" value={likeCount} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Recent posts" actionHref="/admin/posts" actionLabel="Manage →">
          <ul className="divide-y divide-border">
            {recentPosts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <Link href={`/posts/${p.slug}`} className="truncate font-semibold hover:text-accent">
                    {p.title}
                  </Link>
                  <p className="text-xs text-muted">
                    @{p.author.username} · {timeAgo(p.createdAt)}
                  </p>
                </div>
                <span className={p.published ? "pill-teal" : "pill"}>
                  {p.published ? "Published" : "Draft"}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="New users" actionHref="/admin/users" actionLabel="Manage →">
          <ul className="divide-y divide-border">
            {recentUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <Link href={`/u/${u.username}`} className="font-semibold hover:text-accent">
                    {u.name}
                  </Link>
                  <p className="text-xs text-muted">
                    @{u.username} · {timeAgo(u.createdAt)}
                  </p>
                </div>
                <span className="pill">{u.role}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Most viewed" actionHref="/admin/posts" actionLabel="Manage →">
          <ul className="divide-y divide-border">
            {topPosts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 py-3">
                <Link href={`/posts/${p.slug}`} className="truncate font-semibold hover:text-accent">
                  {p.title}
                </Link>
                <span className="text-xs text-muted">{p.views} views</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Quick actions">
          <div className="grid gap-2">
            <Link href="/write" className="btn-teal">Write a new post</Link>
            <Link href="/admin/comments" className="btn-outline">Moderate comments</Link>
            <Link href="/admin/tags" className="btn-outline">Edit tags</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function Card({
  title,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  actionHref?: string;
  actionLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5">
      <header className="flex items-center justify-between">
        <h2 className="font-bold">{title}</h2>
        {actionHref && (
          <Link href={actionHref} className="text-xs text-teal hover:underline">
            {actionLabel ?? "View"}
          </Link>
        )}
      </header>
      <div className="mt-3">{children}</div>
    </section>
  );
}
