import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * List all tasks for the authenticated user, ordered by creation time (newest first)
 */
export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("tasks"),
      _creationTime: v.number(),
      userId: v.id("users"),
      title: v.string(),
      completed: v.boolean(),
      priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
      dueDate: v.optional(v.number()),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    return tasks;
  },
});

/**
 * Create a new task for the authenticated user
 */
export const create = mutation({
  args: {
    title: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    dueDate: v.optional(v.number()),
  },
  returns: v.id("tasks"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const taskId = await ctx.db.insert("tasks", {
      userId,
      title: args.title,
      completed: false,
      priority: args.priority,
      dueDate: args.dueDate,
    });
    return taskId;
  },
});

/**
 * Update an existing task (title, completed, priority, dueDate)
 */
export const update = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    completed: v.optional(v.boolean()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    dueDate: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    if (task.userId !== userId) {
      throw new Error("Not authorized");
    }
    
    const updates: Partial<{
      title: string;
      completed: boolean;
      priority: "low" | "medium" | "high";
      dueDate: number;
    }> = {};
    
    if (args.title !== undefined) updates.title = args.title;
    if (args.completed !== undefined) updates.completed = args.completed;
    if (args.priority !== undefined) updates.priority = args.priority;
    if (args.dueDate !== undefined) updates.dueDate = args.dueDate;
    
    await ctx.db.patch(args.taskId, updates);
    return null;
  },
});

/**
 * Delete a task and all its associated notes
 */
export const remove = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    if (task.userId !== userId) {
      throw new Error("Not authorized");
    }
    
    // Delete all notes associated with this task
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
    
    for (const note of notes) {
      await ctx.db.delete(note._id);
    }
    
    // Delete the task
    await ctx.db.delete(args.taskId);
    return null;
  },
});
