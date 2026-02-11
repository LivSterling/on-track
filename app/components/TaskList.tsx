"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useMemo, useState } from "react";
import { TaskItem } from "./TaskItem";
import { TaskForm } from "./TaskForm";

type SortOption = "priority" | "dueDate" | "created";
type FilterOption = "all" | "active" | "completed";

export function TaskList() {
  const tasks = useQuery(api.tasks.list);
  const [sortBy, setSortBy] = useState<SortOption>("created");
  const [filter, setFilter] = useState<FilterOption>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const filteredAndSortedTasks = useMemo(() => {
    if (!tasks) return undefined;

    let result = [...tasks];

    // Filter by completion status
    if (filter === "active") {
      result = result.filter((t) => !t.completed);
    } else if (filter === "completed") {
      result = result.filter((t) => t.completed);
    }

    // Filter by priority
    if (priorityFilter !== "all") {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    // Sort
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    switch (sortBy) {
      case "priority":
        result.sort(
          (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
        );
        break;
      case "dueDate":
        result.sort((a, b) => {
          const aDate = a.dueDate ?? Infinity;
          const bDate = b.dueDate ?? Infinity;
          return aDate - bDate;
        });
        break;
      case "created":
      default:
        result.sort((a, b) => b._creationTime - a._creationTime);
        break;
    }

    return result;
  }, [tasks, sortBy, filter, priorityFilter]);

  if (tasks === undefined) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TaskForm />

      <div className="flex flex-wrap gap-2 items-center">
        <select
          className="select select-bordered select-sm"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
        >
          <option value="created">Sort by: Newest</option>
          <option value="priority">Sort by: Priority</option>
          <option value="dueDate">Sort by: Due Date</option>
        </select>
        <select
          className="select select-bordered select-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterOption)}
        >
          <option value="all">All tasks</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
        <select
          className="select select-bordered select-sm"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="all">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredAndSortedTasks!.length === 0 ? (
          <div className="rounded-lg border border-dashed border-base-300 bg-base-200/30 py-12 text-center">
            <p className="text-base-content/70">
              {tasks.length === 0
                ? "No tasks yet. Add one above!"
                : "No tasks match your filters."}
            </p>
          </div>
        ) : (
          filteredAndSortedTasks!.map((task) => (
            <TaskItem key={task._id} task={task} />
          ))
        )}
      </div>
    </div>
  );
}
