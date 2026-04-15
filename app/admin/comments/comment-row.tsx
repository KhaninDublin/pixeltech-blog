"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteComment, toggleHideComment } from "@/app/actions/comments";

export function CommentRow({
  row,
}: {
  row: {
    id: string;
    content: string;
    hidden: boolean;
    authorName: string;
    authorUsername: string;
    postSlug: string;
    postTitle: string;
    when: string;
  };
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <tr>
      <td className="max-w-sm px-4 py-3">
        <p className={"line-clamp-3 " + (row.hidden ? "italic text-muted" : "text-text/90")}>
          {row.content}
        </p>
      </td>
      <td className="px-4 py-3">
        <Link href={`/u/${row.authorUsername}`} className="hover:text-accent">
          {row.authorName}
        </Link>
      </td>
      <td className="px-4 py-3">
        <Link href={`/posts/${row.postSlug}`} className="line-clamp-2 text-muted hover:text-accent">
          {row.postTitle}
        </Link>
      </td>
      <td className="px-4 py-3 text-muted">{row.when}</td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => startTransition(() => toggleHideComment(row.id))}
            className="btn-outline"
            disabled={isPending}
          >
            {row.hidden ? "Unhide" : "Hide"}
          </button>
          <button
            onClick={() => {
              if (!confirm("Delete this comment?")) return;
              startTransition(() => deleteComment(row.id));
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
