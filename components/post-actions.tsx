"use client";

import { useTransition, useOptimistic } from "react";
import { Heart, Bookmark } from "lucide-react";
import { toggleLike, toggleBookmark } from "@/app/actions/post-social";
import { cn } from "@/lib/utils";

export function PostActions({
  postId,
  liked,
  bookmarked,
  likeCount,
  authed,
}: {
  postId: string;
  liked: boolean;
  bookmarked: boolean;
  likeCount: number;
  authed: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic({ liked, bookmarked, likeCount });

  function onLike() {
    if (!authed) { window.location.href = "/login?next=" + encodeURIComponent(location.pathname); return; }
    startTransition(async () => {
      setOptimistic((s) => ({ ...s, liked: !s.liked, likeCount: s.likeCount + (s.liked ? -1 : 1) }));
      await toggleLike(postId);
    });
  }
  function onBookmark() {
    if (!authed) { window.location.href = "/login?next=" + encodeURIComponent(location.pathname); return; }
    startTransition(async () => {
      setOptimistic((s) => ({ ...s, bookmarked: !s.bookmarked }));
      await toggleBookmark(postId);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onLike}
        aria-pressed={optimistic.liked}
        aria-label="Like post"
        disabled={isPending}
        className={cn(
          "btn-outline gap-2",
          optimistic.liked && "border-danger/70 text-danger"
        )}
      >
        <Heart className={cn("h-4 w-4", optimistic.liked && "fill-current")} />
        {optimistic.likeCount}
      </button>
      <button
        onClick={onBookmark}
        aria-pressed={optimistic.bookmarked}
        aria-label="Bookmark post"
        disabled={isPending}
        className={cn(
          "btn-outline gap-2",
          optimistic.bookmarked && "border-teal/70 text-teal"
        )}
      >
        <Bookmark className={cn("h-4 w-4", optimistic.bookmarked && "fill-current")} />
        {optimistic.bookmarked ? "Saved" : "Save"}
      </button>
    </div>
  );
}
