import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * List all notes for a specific task, ordered by creation time (oldest first)
 */
export const list = query({
  args: {
    taskId: v.id("tasks"),
  },
  returns: v.array(
    v.object({
      _id: v.id("notes"),
      _creationTime: v.number(),
      taskId: v.id("tasks"),
      content: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    
    // Verify the task belongs to the user
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) {
      return [];
    }
    
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .order("asc")
      .collect();
    return notes;
  },
});

/**
 * Add a note to a task
 */
export const create = mutation({
  args: {
    taskId: v.id("tasks"),
    content: v.string(),
  },
  returns: v.id("notes"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    // Verify the task belongs to the user
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    if (task.userId !== userId) {
      throw new Error("Not authorized");
    }
    
    const noteId = await ctx.db.insert("notes", {
      taskId: args.taskId,
      content: args.content,
    });
    return noteId;
  },
});

/**
 * Delete a note
 */
export const remove = mutation({
  args: {
    noteId: v.id("notes"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const note = await ctx.db.get(args.noteId);
    if (!note) {
      throw new Error("Note not found");
    }
    
    // Verify the task belongs to the user
    const task = await ctx.db.get(note.taskId);
    if (!task || task.userId !== userId) {
      throw new Error("Not authorized");
    }
    
    await ctx.db.delete(args.noteId);
    return null;
  },
});
