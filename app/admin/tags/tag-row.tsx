"use client";

import { useTransition, useState } from "react";
import { deleteTagAction, updateTagAction } from "@/app/actions/admin";

export function TagRow({
  tag,
}: {
  tag: { id: string; name: string; slug: string; color: string; count: number };
}) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <tr>
        <td colSpan={5} className="px-4 py-3">
          <form
            action={(fd) => startTransition(() => updateTagAction(fd).then(() => setEditing(false)))}
            className="flex flex-wrap items-end gap-3"
          >
            <input type="hidden" name="id" value={tag.id} />
            <div className="flex-1 min-w-[200px]">
              <label className="label">Name</label>
              <input name="name" defaultValue={tag.name} required maxLength={40} className="input" />
            </div>
            <div>
              <label className="label">Color</label>
              <input
                name="color"
                type="color"
                defaultValue={tag.color}
                className="h-10 w-20 rounded bg-surface2 border border-border"
              />
            </div>
            <button type="submit" className="btn-teal" disabled={isPending}>Save</button>
            <button type="button" onClick={() => setEditing(false)} className="btn-ghost">Cancel</button>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td className="px-4 py-3 font-semibold">{tag.name}</td>
      <td className="px-4 py-3 font-mono text-xs text-muted">{tag.slug}</td>
      <td className="px-4 py-3">
        <span
          className="inline-block h-6 w-6 rounded border border-border align-middle"
          style={{ backgroundColor: tag.color }}
          aria-label={`color ${tag.color}`}
        />
        <span className="ml-2 font-mono text-xs text-muted">{tag.color}</span>
      </td>
      <td className="px-4 py-3 text-right text-muted">{tag.count}</td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          <button className="btn-outline" onClick={() => setEditing(true)}>Edit</button>
          <button
            onClick={() => {
              if (!confirm(`Delete tag "${tag.name}"? Posts will no longer be tagged.`)) return;
              startTransition(() => deleteTagAction(tag.id));
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
