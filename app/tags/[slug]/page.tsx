import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PostCard } from "@/components/post-card";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({ where: { slug } });
  return { title: tag ? `#${tag.name}` : "Tag" };
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) notFound();

  const posts = await prisma.post.findMany({
    where: { published: true, tags: { some: { tagId: tag.id } } },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { username: true, name: true, avatarUrl: true } },
      tags: { include: { tag: true } },
      _count: { select: { comments: true, likes: true } },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <span
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: tag.color }}
            aria-hidden
          />
          <h1 className="text-3xl font-bold">#{tag.name}</h1>
        </div>
        <p className="mt-1 text-muted">{posts.length} posts</p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}
