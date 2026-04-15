"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { addComment, deleteComment } from "@/app/actions/comments";
import { timeAgo, avatarFor, cn } from "@/lib/utils";
import { Reply, Trash2 } from "lucide-react";

export type CommentNode = {
  id: string;
  content: string;
  createdAt: string;
  hidden: boolean;
  author: { username: string; name: string; avatarUrl: string | null };
  replies: CommentNode[];
};

export function CommentThread({
  postId,
  comments,
  me,
  canModerate,
}: {
  postId: string;
  comments: CommentNode[];
  me: { id: string; username: string; name: string; image: string | null } | null;
  canModerate: boolean;
}) {
  return (
    <section aria-label="Comments" className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Discussion ({countAll(comments)})</h2>
      </header>

      {me ? (
        <CommentForm postId={postId} />
      ) : (
        <div className="card p-4 text-sm text-muted">
          <Link href="/login" className="text-teal underline">
            Sign in
          </Link>{" "}
          to join the discussion.
        </div>
      )}

      <ul className="space-y-5">
        {comments.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            postId={postId}
            me={me}
            canModerate={canModerate}
            depth={0}
          />
        ))}
      </ul>
    </section>
  );
}

function countAll(list: CommentNode[]): number {
  return list.reduce((n, c) => n + 1 + countAll(c.replies), 0);
}

function CommentItem({
  comment,
  postId,
  me,
  canModerate,
  depth,
}: {
  comment: CommentNode;
  postId: string;
  me: { id: string; username: string; name: string; image: string | null } | null;
  canModerate: boolean;
  depth: number;
}) {
  const [replying, setReplying] = useState(false);
  const [isPending, startTransition] = useTransition();
  const canDelete =
    !!me && (canModerate || me.username === comment.author.username);

  return (
    <li className={cn("relative", depth > 0 && "pl-5 border-l border-border ml-3")}>
      <article className="card p-4">
        <header className="flex items-center gap-3">
          <Image
            src={comment.author.avatarUrl ?? avatarFor(comment.author.username)}
            alt=""
            width={32}
            height={32}
            className="rounded-full bg-surface2"
          />
          <div className="flex-1">
            <Link
              href={`/u/${comment.author.username}`}
              className="font-semibold text-white hover:text-accent"
            >
              {comment.author.name}
            </Link>
            <p className="text-xs text-muted">
              @{comment.author.username} · {timeAgo(comment.createdAt)}
            </p>
          </div>
        </header>
        <p className="mt-3 whitespace-pre-wrap text-text/90">
          {comment.hidden ? (
            <em className="text-muted">[Comment hidden by moderator]</em>
          ) : (
            comment.content
          )}
        </p>

        <footer className="mt-3 flex items-center gap-2 text-xs text-muted">
          {me && depth < 2 && (
            <button
              onClick={() => setReplying((v) => !v)}
              className="flex items-center gap-1 hover:text-white"
            >
              <Reply className="h-3.5 w-3.5" /> Reply
            </button>
          )}
          {canDelete && (
            <button
              onClick={() =>
                startTransition(async () => {
                  if (!confirm("Delete this comment?")) return;
                  await deleteComment(comment.id);
                })
              }
              disabled={isPending}
              className="flex items-center gap-1 hover:text-danger"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          )}
        </footer>

        {replying && (
          <div className="mt-3">
            <CommentForm
              postId={postId}
              parentId={comment.id}
              onDone={() => setReplying(false)}
            />
          </div>
        )}
      </article>

      {comment.replies.length > 0 && (
        <ul className="mt-4 space-y-4">
          {comment.replies.map((r) => (
            <CommentItem
              key={r.id}
              comment={r}
              postId={postId}
              me={me}
              canModerate={canModerate}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function CommentForm({
  postId,
  parentId,
  onDone,
}: {
  postId: string;
  parentId?: string;
  onDone?: () => void;
}) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const body = content.trim();
        if (body.length < 2) { setError("Comment is too short."); return; }
        startTransition(async () => {
          setError(null);
          const res = await addComment({ postId, parentId, content: body });
          if (res?.error) {
            setError(res.error);
            return;
          }
          setContent("");
          onDone?.();
        });
      }}
      className="space-y-2"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="input resize-y"
        placeholder={parentId ? "Write a reply..." : "Add to the discussion..."}
        required
        minLength={2}
        maxLength={4000}
      />
      <div className="flex items-center justify-between">
        {error ? <p className="text-xs text-danger">{error}</p> : <span />}
        <div className="flex gap-2">
          {onDone && (
            <button type="button" onClick={onDone} className="btn-ghost">
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isPending || content.trim().length < 2}
            className="btn-teal"
          >
            {isPending ? "Posting..." : parentId ? "Reply" : "Post comment"}
          </button>
        </div>
      </div>
    </form>
  );
}
