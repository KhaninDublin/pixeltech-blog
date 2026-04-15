import { prisma } from "@/lib/db";
import { PostCard } from "@/components/post-card";

export const metadata = { title: "Trending" };
export const revalidate = 120;

export default async function TrendingPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: [{ likes: { _count: "desc" } }, { views: "desc" }],
    take: 30,
    include: {
      author: { select: { username: true, name: true, avatarUrl: true } },
      tags: { include: { tag: true } },
      _count: { select: { comments: true, likes: true } },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Trending</h1>
      <p className="mt-1 text-muted">The most engaged-with writing on PixelTech right now.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}
