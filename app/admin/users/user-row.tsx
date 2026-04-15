"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  setUserRoleAction,
  setUserBannedAction,
  deleteUserAction,
} from "@/app/actions/admin";

type Row = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "USER" | "AUTHOR" | "ADMIN";
  banned: boolean;
  posts: number;
  comments: number;
};

export function UserRow({ user }: { user: Row }) {
  const [isPending, startTransition] = useTransition();
  return (
    <tr>
      <td className="px-4 py-3">
        <Link href={`/u/${user.username}`} className="font-semibold hover:text-accent">
          {user.name}
        </Link>
        <div className="text-xs text-muted">@{user.username}</div>
      </td>
      <td className="px-4 py-3 text-muted">{user.email}</td>
      <td className="px-4 py-3">
        <select
          value={user.role}
          onChange={(e) =>
            startTransition(() =>
              setUserRoleAction(user.id, e.target.value as typeof user.role)
            )
          }
          disabled={isPending}
          className="input py-1"
        >
          <option value="USER">USER</option>
          <option value="AUTHOR">AUTHOR</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </td>
      <td className="px-4 py-3">
        <span className={user.banned ? "pill border-danger/70 text-danger" : "pill-teal"}>
          {user.banned ? "Banned" : "Active"}
        </span>
      </td>
      <td className="px-4 py-3 text-right text-muted">
        {user.posts} / {user.comments}
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          <button
            onClick={() =>
              startTransition(() => setUserBannedAction(user.id, !user.banned))
            }
            className={user.banned ? "btn-outline" : "btn-outline border-danger/50 text-danger hover:bg-danger/10"}
            disabled={isPending}
          >
            {user.banned ? "Unban" : "Ban"}
          </button>
          <button
            onClick={() => {
              if (!confirm(`Delete ${user.username}? This cannot be undone.`)) return;
              startTransition(() => deleteUserAction(user.id));
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
