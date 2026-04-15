import Link from "next/link";
import { prisma } from "@/lib/db";
import { UserRow } from "./user-row";

export const metadata = { title: "Admin · Users" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const users = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { username: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { posts: true, comments: true } } },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted">{users.length} shown</p>
        </div>
        <form action="/admin/users" className="w-64">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search name, username, email..."
            className="input"
          />
        </form>
      </header>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface2 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Posts / Comments</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <UserRow
                key={u.id}
                user={{
                  id: u.id,
                  name: u.name,
                  username: u.username,
                  email: u.email,
                  role: u.role,
                  banned: u.banned,
                  posts: u._count.posts,
                  comments: u._count.comments,
                }}
              />
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted">
        Tip: if no one else is an admin, don&apos;t demote yourself. You can always promote
        from <Link href="/admin/users" className="text-teal">this page</Link>.
      </p>
    </div>
  );
}
