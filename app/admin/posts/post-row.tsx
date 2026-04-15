"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  togglePostFeaturedAction,
  togglePostPublishedAction,
  adminDeletePostAction,
} from "@/app/actions/admin";

type Row = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  featured: boolean;
  authorName: string;
  authorUsername: string;
  createdAt: string;
  comments: number;
  likes: number;
  views: number;
};

export function PostRow({ post }: { post: Row }) {
  const [isPending, startTransition] = useTransition();
  return (
    <tr>
      <td className="px-4 py-3">
        <Link href={`/posts/${post.slug}`} className="font-semibold hover:text-accent">
          {post.title}
        </Link>
        <div className="text-xs text-muted">{post.createdAt}</div>
      </td>
      <td className="px-4 py-3">
        <Link href={`/u/${post.authorUsername}`} className="hover:text-accent">
          {post.authorName}
        </Link>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          <span className={post.published ? "pill-teal" : "pill"}>
            {post.published ? "Published" : "Draft"}
          </span>
          {post.featured && <span className="pill border-accent/50 text-accent">Featured</span>}
        </div>
      </td>
      <td className="px-4 py-3 text-right text-xs text-muted">
        {post.likes} likes · {post.comments} cmts · {post.views} views
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap justify-end gap-2">
          <button
            onClick={() => startTransition(() => togglePostFeaturedAction(post.id))}
            className="btn-outline"
            disabled={isPending}
          >
            {post.featured ? "Unfeature" : "Feature"}
          </button>
          <button
            onClick={() => startTransition(() => togglePostPublishedAction(post.id))}
            className="btn-outline"
            disabled={isPending}
          >
            {post.published ? "Unpublish" : "Publish"}
          </button>
          <Link href={`/posts/${post.slug}/edit`} className="btn-outline">Edit</Link>
          <button
            onClick={() => {
              if (!confirm("Delete this post? This cannot be undone.")) return;
              startTransition(() => adminDeletePostAction(post.id));
            }}
            className="btn-danger"
            disabled={isPending}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
