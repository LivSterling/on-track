import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // Auth tables managed by Convex Auth (includes users, sessions, etc.)
  ...authTables,

  // Tasks table - stores user's to-do items
  tasks: defineTable({
    userId: v.id("users"),
    title: v.string(),
    completed: v.boolean(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    dueDate: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  // Notes table - stores notes attached to tasks
  notes: defineTable({
    taskId: v.id("tasks"),
    content: v.string(),
  }).index("by_task", ["taskId"]),
});
