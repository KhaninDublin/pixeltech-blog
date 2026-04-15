"use client";

import { useActionState } from "react";
import { createPostAction } from "@/app/actions/posts";
import { MarkdownEditor } from "@/components/markdown-editor";

export function WriteForm({
  defaults,
}: {
  defaults?: { title?: string; content?: string; coverUrl?: string; tags?: string; published?: boolean };
}) {
  const [state, action, pending] = useActionState(createPostAction, undefined);
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
          defaultValue={defaults?.title}
          className="input text-lg"
          placeholder="How I shipped production Postgres at 10x scale"
        />
      </div>

      <div>
        <label className="label" htmlFor="coverUrl">Cover image URL <span className="text-muted font-normal">(optional)</span></label>
        <input
          id="coverUrl"
          name="coverUrl"
          type="url"
          defaultValue={defaults?.coverUrl}
          className="input"
          placeholder="https://images.unsplash.com/..."
        />
      </div>

      <div>
        <label className="label" htmlFor="tags">Tags</label>
        <input
          id="tags"
          name="tags"
          defaultValue={defaults?.tags}
          className="input"
          placeholder="Next.js, Postgres, Performance (comma-separated, up to 5)"
        />
      </div>

      <div>
        <label className="label">Content</label>
        <MarkdownEditor name="content" defaultValue={defaults?.content ?? ""} />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="published"
          name="published"
          type="checkbox"
          defaultChecked={defaults?.published ?? true}
          className="h-4 w-4 rounded border-border bg-surface2 accent-accent"
        />
        <label htmlFor="published" className="text-sm">Publish immediately</label>
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <div className="flex items-center justify-end gap-3">
        <button type="submit" disabled={pending} className="btn-teal">
          {pending ? "Saving..." : "Save post"}
        </button>
      </div>
    </form>
  );
}
