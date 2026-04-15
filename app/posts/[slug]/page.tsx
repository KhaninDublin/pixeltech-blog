import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Markdown } from "@/components/markdown";
import { PostActions } from "@/components/post-actions";
import { FollowButton } from "@/components/follow-button";
import { CommentThread, type CommentNode } from "@/components/comment-thread";
import { TagPill } from "@/components/tag-pill";
import { avatarFor, formatDate, readingTime } from "@/lib/utils";
import { Edit3, Eye, Trash2 } from "lucide-react";
import { deletePostAction } from "@/app/actions/posts";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug }, select: { title: true, excerpt: true } });
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  const me = session?.user;

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          bio: true,
          avatarUrl: true,
          _count: { select: { followers: true, posts: true } },
        },
      },
      tags: { include: { tag: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });
  if (!post || (!post.published && post.authorId !== me?.id && me?.role !== "ADMIN")) {
    notFound();
  }

  // Lightweight view increment
  await prisma.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } });

  const [liked, bookmarked, following, rawComments, moreFromAuthor] = await Promise.all([
    me
      ? prisma.like.findUnique({
          where: { userId_postId: { userId: me.id, postId: post.id } },
        })
      : null,
    me
      ? prisma.bookmark.findUnique({
          where: { userId_postId: { userId: me.id, postId: post.id } },
        })
      : null,
    me
      ? prisma.follow.findUnique({
          where: {
            followerId_followingId: { followerId: me.id, followingId: post.authorId },
          },
        })
      : null,
    prisma.comment.findMany({
      where: { postId: post.id },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { username: true, name: true, avatarUrl: true } },
      },
    }),
    prisma.post.findMany({
      where: { authorId: post.authorId, published: true, NOT: { id: post.id } },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { slug: true, title: true, createdAt: true, excerpt: true },
    }),
  ]);

  const tree = buildCommentTree(
    rawComments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      hidden: c.hidden,
      parentId: c.parentId,
      author: c.author,
    }))
  );

  const canEdit = !!me && (me.id === post.authorId || me.role === "ADMIN");

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <header className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {post.tags.map(({ tag }) => (
            <TagPill key={tag.slug} tag={tag} />
          ))}
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
          {post.title}
        </h1>
        <p className="text-lg text-text/80">{post.excerpt}</p>

        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
          <div className="flex items-center gap-3">
            <Image
              src={post.author.avatarUrl ?? avatarFor(post.author.username)}
              alt=""
              width={44}
              height={44}
              className="rounded-full bg-surface2"
            />
            <div>
              <Link
                href={`/u/${post.author.username}`}
                className="font-semibold text-white hover:text-accent"
              >
                {post.author.name}
              </Link>
              <p className="text-xs text-muted">
                {formatDate(post.createdAt)} · {readingTime(post.content)} min read ·{" "}
                <Eye className="inline h-3.5 w-3.5" /> {post.views} views
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {me && me.id !== post.authorId && (
              <FollowButton
                userId={post.authorId}
                following={!!following}
                authed={!!me}
              />
            )}
            {canEdit && (
              <>
                <Link href={`/posts/${post.slug}/edit`} className="btn-outline">
                  <Edit3 className="h-4 w-4" /> Edit
                </Link>
                <form action={async () => {
                  "use server";
                  await deletePostAction(post.id);
                }}>
                  <button type="submit" className="btn-danger" aria-label="Delete post">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </header>

      {post.coverUrl && (
        <Image
          src={post.coverUrl}
          alt=""
          width={1200}
          height={600}
          className="my-8 aspect-[16/7] w-full rounded-xl border border-border object-cover"
        />
      )}

      <div className="my-10">
        <Markdown>{post.content}</Markdown>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
        <div className="flex flex-wrap gap-2">
          {post.tags.map(({ tag }) => (
            <TagPill key={tag.slug} tag={tag} />
          ))}
        </div>
        <PostActions
          postId={post.id}
          liked={!!liked}
          bookmarked={!!bookmarked}
          likeCount={post._count.likes}
          authed={!!me}
        />
      </div>

      <section className="mt-10 rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center gap-4">
          <Image
            src={post.author.avatarUrl ?? avatarFor(post.author.username)}
            alt=""
            width={64}
            height={64}
            className="rounded-full bg-surface2"
          />
          <div className="min-w-0">
            <Link
              href={`/u/${post.author.username}`}
              className="text-lg font-bold text-white hover:text-accent"
            >
              {post.author.name}
            </Link>
            <p className="text-xs text-muted">
              @{post.author.username} · {post.author._count.posts} posts · {post.author._count.followers} followers
            </p>
            {post.author.bio && (
              <p className="mt-2 text-sm text-text/80">{post.author.bio}</p>
            )}
          </div>
        </div>
      </section>

      {moreFromAuthor.length > 0 && (
        <section className="mt-10">
          <h3 className="mb-4 text-lg font-bold">More from {post.author.name}</h3>
          <ul className="space-y-3">
            {moreFromAuthor.map((p) => (
              <li key={p.slug} className="card-hover p-4">
                <Link
                  href={`/posts/${p.slug}`}
                  className="block font-semibold hover:text-accent"
                >
                  {p.title}
                </Link>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{p.excerpt}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-14">
        <CommentThread
          postId={post.id}
          comments={tree}
          me={
            me
              ? {
                  id: me.id,
                  username: me.username ?? "",
                  name: me.name ?? "",
                  image: me.image ?? null,
                }
              : null
          }
          canModerate={me?.role === "ADMIN"}
        />
      </section>
    </article>
  );
}

type Flat = {
  id: string; content: string; createdAt: string; hidden: boolean;
  parentId: string | null;
  author: { username: string; name: string; avatarUrl: string | null };
};

function buildCommentTree(rows: Flat[]): CommentNode[] {
  const map = new Map<string, CommentNode>();
  rows.forEach((r) =>
    map.set(r.id, {
      id: r.id,
      content: r.content,
      createdAt: r.createdAt,
      hidden: r.hidden,
      author: r.author,
      replies: [],
    })
  );
  const roots: CommentNode[] = [];
  rows.forEach((r) => {
    const node = map.get(r.id)!;
    if (r.parentId && map.has(r.parentId)) {
      map.get(r.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}
