"use client";

import { useActionState } from "react";
import { updatePostAction } from "@/app/actions/posts";
import { MarkdownEditor } from "@/components/markdown-editor";

export function EditForm({
  postId,
  defaults,
}: {
  postId: string;
  defaults: { title: string; content: string; coverUrl: string; tags: string; published: boolean };
}) {
  const [state, action, pending] = useActionState(
    updatePostAction.bind(null, postId),
    undefined
  );
  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="label" htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          required
          minLength={6}
          maxLength={140}
          defaultValue={defaults.title}
          className="input text-lg"
        />
      </div>

      <div>
        <label className="label" htmlFor="coverUrl">Cover image URL</label>
        <input
          id="coverUrl"
          name="coverUrl"
          type="url"
          defaultValue={defaults.coverUrl}
          className="input"
        />
      </div>

      <div>
        <label className="label" htmlFor="tags">Tags</label>
        <input
          id="tags"
          name="tags"
          defaultValue={defaults.tags}
          className="input"
          placeholder="comma-separated"
        />
      </div>

      <div>
        <label className="label">Content</label>
        <MarkdownEditor name="content" defaultValue={defaults.content} />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="published"
          name="published"
          type="checkbox"
          defaultChecked={defaults.published}
          className="h-4 w-4 rounded border-border bg-surface2 accent-accent"
        />
        <label htmlFor="published" className="text-sm">Published</label>
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <div className="flex items-center justify-end gap-3">
        <button type="submit" disabled={pending} className="btn-teal">
          {pending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
