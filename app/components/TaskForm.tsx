"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

type Priority = "low" | "medium" | "high";

export function TaskForm() {
  const createTask = useMutation(api.tasks.create);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await createTask({
        title: title.trim(),
        priority,
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
      });
      setTitle("");
      setPriority("medium");
      setDueDate("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card bg-base-200 shadow-sm">
      <div className="card-body">
        <h3 className="card-title text-lg">New Task</h3>
        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Title</span>
            </label>
            <input
              type="text"
              placeholder="What needs to be done?"
              className="input input-bordered w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Priority</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              disabled={loading}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Due Date</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !title.trim()}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Add Task"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
