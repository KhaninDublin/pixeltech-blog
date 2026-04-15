import { prisma } from "@/lib/db";
import { TagRow } from "./tag-row";
import { createTagAction } from "@/app/actions/admin";

export const metadata = { title: "Admin · Tags" };

export default async function AdminTagsPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Tags</h1>
        <p className="text-sm text-muted">{tags.length} total</p>
      </header>

      <form action={createTagAction} className="card flex flex-wrap items-end gap-3 p-5">
        <div className="flex-1 min-w-[200px]">
          <label className="label" htmlFor="name">New tag</label>
          <input id="name" name="name" required maxLength={40} className="input" placeholder="e.g. Kubernetes" />
        </div>
        <div>
          <label className="label" htmlFor="color">Color</label>
          <input id="color" name="color" type="color" defaultValue="#8B5CF6" className="h-10 w-20 rounded bg-surface2 border border-border" />
        </div>
        <button type="submit" className="btn-teal">Create</button>
      </form>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface2 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Slug</th>
              <th className="px-4 py-3 text-left">Color</th>
              <th className="px-4 py-3 text-right">Posts</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tags.map((t) => (
              <TagRow
                key={t.id}
                tag={{
                  id: t.id,
                  name: t.name,
                  slug: t.slug,
                  color: t.color,
                  count: t._count.posts,
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
