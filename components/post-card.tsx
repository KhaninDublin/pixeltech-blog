import Link from "next/link";
import Image from "next/image";
import { MessageSquare, Heart, Clock } from "lucide-react";
import { readingTime, timeAgo, avatarFor } from "@/lib/utils";

type PostCardPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverUrl: string | null;
  createdAt: Date;
  featured?: boolean;
  author: { username: string; name: string; avatarUrl: string | null };
  tags: { tag: { slug: string; name: string; color: string } }[];
  _count: { comments: number; likes: number };
};

export function PostCard({ post, compact = false }: { post: PostCardPost; compact?: boolean }) {
  const rt = readingTime(post.content);
  return (
    <article className="card-hover group flex flex-col overflow-hidden">
      {!compact && post.coverUrl && (
        <Link href={`/posts/${post.slug}`} className="block">
          <Image
            src={post.coverUrl}
            alt=""
            width={800}
            height={400}
            className="aspect-[16/7] w-full object-cover opacity-90 transition group-hover:opacity-100"
          />
        </Link>
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          {post.featured && <span className="pill-teal">Featured</span>}
          {post.tags.slice(0, 2).map(({ tag }) => (
            <Link key={tag.slug} href={`/tags/${tag.slug}`} className="pill">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: tag.color }}
                aria-hidden
              />
              {tag.name}
            </Link>
          ))}
        </div>

        <h3 className="text-xl font-bold leading-snug text-white group-hover:text-accent">
          <Link href={`/posts/${post.slug}`}>{post.title}</Link>
        </h3>

        <p className="line-clamp-3 text-sm text-text/80">{post.excerpt}</p>

        <div className="mt-auto flex items-center justify-between pt-2 text-sm text-muted">
          <Link
            href={`/u/${post.author.username}`}
            className="flex items-center gap-2 hover:text-white"
          >
            <Image
              src={post.author.avatarUrl ?? avatarFor(post.author.username)}
              alt=""
              width={24}
              height={24}
              className="rounded-full bg-surface2"
            />
            <span>{post.author.name}</span>
          </Link>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {rt} min
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" /> {post._count.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" /> {post._count.comments}
            </span>
          </div>
        </div>
        <p className="text-[11px] uppercase tracking-wider text-muted/70">
          {timeAgo(post.createdAt)}
        </p>
      </div>
    </article>
  );
}
