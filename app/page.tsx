import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { PostCard } from "@/components/post-card";
import { TagPill } from "@/components/tag-pill";
import { avatarFor, readingTime, timeAgo } from "@/lib/utils";
import { ArrowRight, Flame, Sparkles, TrendingUp } from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  const [featured, latest, trending, popularTags, topAuthors] = await Promise.all([
    prisma.post.findMany({
      where: { published: true, featured: true },
      orderBy: { createdAt: "desc" },
      take: 2,
      include: {
        author: { select: { username: true, name: true, avatarUrl: true } },
        tags: { include: { tag: true } },
        _count: { select: { comments: true, likes: true } },
      },
    }),
    prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 9,
      include: {
        author: { select: { username: true, name: true, avatarUrl: true } },
        tags: { include: { tag: true } },
        _count: { select: { comments: true, likes: true } },
      },
    }),
    prisma.post.findMany({
      where: { published: true },
      orderBy: [{ likes: { _count: "desc" } }, { views: "desc" }],
      take: 5,
      include: {
        author: { select: { username: true, name: true, avatarUrl: true } },
        tags: { include: { tag: true } },
        _count: { select: { comments: true, likes: true } },
      },
    }),
    prisma.tag.findMany({
      take: 12,
      orderBy: { posts: { _count: "desc" } },
    }),
    prisma.user.findMany({
      where: { role: { in: ["AUTHOR", "ADMIN"] } },
      orderBy: { posts: { _count: "desc" } },
      take: 5,
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        bio: true,
        _count: { select: { posts: true, followers: true } },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="mb-12 rounded-2xl border border-border bg-gradient-to-br from-surface to-[#1a1040] p-8 md:p-12">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal">
          <Sparkles className="h-4 w-4" /> A computer technology blog
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
          Long-form writing on{" "}
          <span className="text-accent">software engineering</span>, web platforms, and the
          tools we build with.
        </h1>
        <p className="mt-4 max-w-2xl text-text/80">
          By working engineers, for working engineers. No thought pieces, no listicles —
          just the depth you wished the official docs had.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/register" className="btn-teal">
            Join the community <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/trending" className="btn-outline">
            Read what&apos;s trending
          </Link>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mb-14">
          <SectionHeader icon={<Flame className="h-5 w-5 text-amber" />} title="Featured" />
          <div className="grid gap-6 md:grid-cols-2">
            {featured.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <section>
          <SectionHeader title="Latest posts" action={<Link href="/trending" className="text-sm text-teal hover:underline">View all</Link>} />
          <div className="grid gap-6 sm:grid-cols-2">
            {latest.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>

        <aside className="space-y-8">
          <div className="card p-5">
            <SidebarTitle icon={<TrendingUp className="h-4 w-4 text-teal" />} title="Trending" />
            <ul className="mt-3 space-y-4">
              {trending.map((p, i) => (
                <li key={p.id} className="flex gap-3">
                  <span className="font-mono text-lg font-bold text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/posts/${p.slug}`}
                      className="line-clamp-2 font-semibold hover:text-accent"
                    >
                      {p.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted">
                      {p.author.name} · {readingTime(p.content)} min · {p._count.likes} likes
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-5">
            <SidebarTitle title="Popular tags" />
            <div className="mt-3 flex flex-wrap gap-2">
              {popularTags.map((t) => (
                <TagPill key={t.id} tag={t} />
              ))}
            </div>
          </div>

          <div className="card p-5">
            <SidebarTitle title="Top authors" />
            <ul className="mt-3 space-y-4">
              {topAuthors.map((a) => (
                <li key={a.id} className="flex items-center gap-3">
                  <Image
                    src={a.avatarUrl ?? avatarFor(a.username)}
                    alt=""
                    width={36}
                    height={36}
                    className="rounded-full bg-surface2"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/u/${a.username}`}
                      className="block truncate font-semibold hover:text-accent"
                    >
                      {a.name}
                    </Link>
                    <p className="truncate text-xs text-muted">
                      {a._count.posts} posts · {a._count.followers} followers
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  icon,
  action,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <h2 className="flex items-center gap-2 text-2xl font-bold">
        {icon}
        {title}
      </h2>
      {action}
    </div>
  );
}

function SidebarTitle({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted">
      {icon}
      {title}
    </h3>
  );
}
