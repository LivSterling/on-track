"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

type NoteListProps = {
  taskId: Id<"tasks">;
};

export function NoteList({ taskId }: NoteListProps) {
  const notes = useQuery(api.notes.list, { taskId });
  const createNote = useMutation(api.notes.create);
  const removeNote = useMutation(api.notes.remove);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      await createNote({ taskId, content: content.trim() });
      setContent("");
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (notes === undefined) {
    return (
      <div className="flex justify-center py-4">
        <span className="loading loading-spinner loading-sm text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Add a note..."
          className="input input-bordered input-sm flex-1"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={loading || !content.trim()}
        >
          {loading ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            "Add"
          )}
        </button>
      </form>

      {notes.length === 0 ? (
        <p className="text-sm text-base-content/60">No notes yet</p>
      ) : (
        <ul className="space-y-2">
          {notes.map((note) => (
            <li
              key={note._id}
              className="flex items-start justify-between gap-2 rounded-lg bg-base-200/50 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm">{note.content}</p>
                <span className="text-xs text-base-content/50">
                  {formatTimestamp(note._creationTime)}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-square text-error"
                onClick={() => removeNote({ noteId: note._id })}
                aria-label="Delete note"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
