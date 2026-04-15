import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, FileText, MessageSquare, Tag, LogOut } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/tags", label: "Tags", icon: Tag },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login?next=/admin");
  }
  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl grid-cols-[220px_1fr] gap-0">
      <aside className="border-r border-border bg-surface">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4 font-mono text-sm font-bold uppercase tracking-wider text-accent">
          Admin
        </div>
        <nav className="p-2 text-sm">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-text/80 hover:bg-surface2 hover:text-white"
              )}
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-border p-3">
          <form action={signOutAction}>
            <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted hover:bg-surface2 hover:text-white">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </div>
      </aside>
      <section className="p-6">{children}</section>
    </div>
  );
}
