"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { signOutAction } from "@/app/actions/auth";
import { ChevronDown, LogOut, Shield, User, Bookmark, Settings } from "lucide-react";

export function UserMenu({
  user,
}: {
  user: { name: string; username: string; image: string | null; role: "USER" | "AUTHOR" | "ADMIN" };
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1 text-sm hover:border-accent/60"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt=""
            width={28}
            height={28}
            className="rounded-full bg-surface2"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
            {user.name.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="hidden sm:inline">{user.username}</span>
        <ChevronDown className="h-4 w-4 text-muted" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-surface shadow-xl"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="font-semibold">{user.name}</p>
            <p className="text-xs text-muted">@{user.username}</p>
          </div>
          <Link
            href={`/u/${user.username}`}
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-surface2"
          >
            <User className="h-4 w-4" /> Profile
          </Link>
          <Link
            href="/bookmarks"
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-surface2"
          >
            <Bookmark className="h-4 w-4" /> Bookmarks
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-surface2"
          >
            <Settings className="h-4 w-4" /> Settings
          </Link>
          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="flex items-center gap-2 border-t border-border px-4 py-2 text-sm text-accent hover:bg-surface2"
            >
              <Shield className="h-4 w-4" /> Admin
            </Link>
          )}
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 border-t border-border px-4 py-2 text-left text-sm hover:bg-surface2"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
