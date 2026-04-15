"use client";

import { useState } from "react";
import { Markdown } from "@/components/markdown";
import { cn } from "@/lib/utils";

export function MarkdownEditor({
  name,
  defaultValue = "",
  placeholder = "Start writing in Markdown...",
  minRows = 20,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  minRows?: number;
}) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="card overflow-hidden">
      <div className="flex border-b border-border bg-surface2">
        {(["write", "preview"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-sm font-medium capitalize",
              tab === t
                ? "bg-bg text-accent border-b-2 border-accent"
                : "text-muted hover:text-white"
            )}
          >
            {t}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3 pr-3 text-xs text-muted">
          Markdown + GFM supported
        </div>
      </div>
      {tab === "write" ? (
        <textarea
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          rows={minRows}
          className="w-full resize-y bg-bg p-5 font-mono text-sm text-text placeholder:text-muted focus:outline-none"
        />
      ) : (
        <div className="min-h-[400px] p-6">
          {value.trim() ? (
            <Markdown>{value}</Markdown>
          ) : (
            <p className="text-muted">Nothing to preview yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
