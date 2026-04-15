"use client";

import { useOptimistic, useTransition } from "react";
import { toggleFollow } from "@/app/actions/user-social";
import { cn } from "@/lib/utils";

export function FollowButton({
  userId,
  following,
  authed,
}: {
  userId: string;
  following: boolean;
  authed: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [opt, setOpt] = useOptimistic(following);

  function onClick() {
    if (!authed) {
      window.location.href = "/login?next=" + encodeURIComponent(location.pathname);
      return;
    }
    startTransition(async () => {
      setOpt(!opt);
      await toggleFollow(userId);
    });
  }

  return (
    <button
      onClick={onClick}
      disabled={isPending}
      className={cn(opt ? "btn-outline" : "btn-primary")}
      aria-pressed={opt}
    >
      {opt ? "Following" : "Follow"}
    </button>
  );
}
