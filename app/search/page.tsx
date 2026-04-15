import { prisma } from "@/lib/db";
import { PostCard } from "@/components/post-card";

export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const posts = query
    ? await prisma.post.findMany({
        where: {
          published: true,
          OR: [
            { title:   { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          author: { select: { username: true, name: true, avatarUrl: true } },
          tags: { include: { tag: true } },
          _count: { select: { comments: true, likes: true } },
        },
      })
    : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">Search</h1>
      <form className="mt-4" action="/search">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search posts..."
          className="input"
          autoFocus
        />
      </form>

      {query && (
        <p className="mt-3 text-sm text-muted">
          {posts.length} result{posts.length === 1 ? "" : "s"} for{" "}
          <span className="text-white">&ldquo;{query}&rdquo;</span>
        </p>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}
