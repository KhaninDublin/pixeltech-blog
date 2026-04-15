import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { PostCard } from "@/components/post-card";
import { FollowButton } from "@/components/follow-button";
import { avatarFor } from "@/lib/utils";
import { Empty } from "@/components/empty";
import { NotebookPen } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const session = await auth();
  const me = session?.user;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: { select: { posts: true, followers: true, following: true } },
    },
  });
  if (!user) notFound();

  const [posts, isFollowing] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: user.id, published: true },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        author: { select: { username: true, name: true, avatarUrl: true } },
        tags: { include: { tag: true } },
        _count: { select: { comments: true, likes: true } },
      },
    }),
    me
      ? prisma.follow.findUnique({
          where: { followerId_followingId: { followerId: me.id, followingId: user.id } },
        })
      : null,
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-6 md:flex-row md:items-center">
        <Image
          src={user.avatarUrl ?? avatarFor(user.username)}
          alt=""
          width={96}
          height={96}
          className="rounded-full bg-surface2"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            <span className="pill text-xs">{user.role}</span>
          </div>
          <p className="text-sm text-muted">@{user.username}</p>
          {user.bio && <p className="mt-3 max-w-2xl text-text/90">{user.bio}</p>}
          <div className="mt-3 flex gap-4 text-sm text-muted">
            <span>
              <strong className="text-white">{user._count.posts}</strong> posts
            </span>
            <span>
              <strong className="text-white">{user._count.followers}</strong> followers
            </span>
            <span>
              <strong className="text-white">{user._count.following}</strong> following
            </span>
          </div>
        </div>
        {me && me.id !== user.id && (
          <div>
            <FollowButton userId={user.id} following={!!isFollowing} authed={!!me} />
          </div>
        )}
      </header>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold">Posts</h2>
        {posts.length === 0 ? (
          <Empty
            icon={<NotebookPen className="h-10 w-10 text-muted" />}
            title="No posts yet"
            hint="When this user publishes something, it will appear here."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
