"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { NoteList } from "./NoteList";

type Task = {
  _id: Id<"tasks">;
  _creationTime: number;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: number;
};

type TaskItemProps = {
  task: Task;
};

const priorityBadgeClasses: Record<"low" | "medium" | "high", string> = {
  low: "badge-info",
  medium: "badge-warning",
  high: "badge-error",
};

function formatDueDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 0 && diffDays < 7) return date.toLocaleDateString(undefined, { weekday: "short" });
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

export function TaskItem({ task }: TaskItemProps) {
  const updateTask = useMutation(api.tasks.update);
  const removeTask = useMutation(api.tasks.remove);
  const [notesExpanded, setNotesExpanded] = useState(false);

  const handleToggleComplete = () => {
    updateTask({ taskId: task._id, completed: !task.completed });
  };

  const handleDelete = () => {
    removeTask({ taskId: task._id });
  };

  return (
    <div className="card bg-base-100 shadow-sm border border-base-300">
      <div className="card-body p-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            className="checkbox checkbox-primary mt-1"
            checked={task.completed}
            onChange={handleToggleComplete}
            aria-label="Toggle completion"
          />
          <div className="min-w-0 flex-1">
            <h4
              className={`font-medium ${
                task.completed ? "line-through text-base-content/60" : ""
              }`}
            >
              {task.title}
            </h4>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className={`badge badge-sm ${priorityBadgeClasses[task.priority]}`}>
                {task.priority}
              </span>
              {task.dueDate && (
                <span className="text-xs text-base-content/70">
                  Due: {formatDueDate(task.dueDate)}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-square btn-sm text-error"
            onClick={handleDelete}
            aria-label="Delete task"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>

        <div className="mt-3">
          <button
            type="button"
            className="btn btn-ghost btn-sm gap-1"
            onClick={() => setNotesExpanded(!notesExpanded)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-transform ${notesExpanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            Notes
          </button>
          {notesExpanded && (
            <div className="mt-2 pl-4 border-l-2 border-base-300">
              <NoteList taskId={task._id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
