import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { PostCard } from "@/components/post-card";
import { Empty } from "@/components/empty";
import { Bookmark } from "lucide-react";

export const metadata = { title: "Bookmarks" };

export default async function BookmarksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/bookmarks");

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        include: {
          author: { select: { username: true, name: true, avatarUrl: true } },
          tags: { include: { tag: true } },
          _count: { select: { comments: true, likes: true } },
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Your bookmarks</h1>
      <p className="mt-1 text-muted">Posts you saved for later.</p>
      <div className="mt-8">
        {bookmarks.length === 0 ? (
          <Empty
            icon={<Bookmark className="h-10 w-10 text-muted" />}
            title="No bookmarks yet"
            hint="Tap the Save button on any post to pin it here."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookmarks.map((b) => (
              <PostCard key={b.post.id} post={b.post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
