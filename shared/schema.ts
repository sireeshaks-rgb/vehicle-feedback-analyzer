import { pgTable, text, integer, timestamp, varchar, date, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const feedback = pgTable("feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  reviewText: text("review_text").notNull(),
  rating: integer("rating").notNull(),
  travelDate: date("travel_date"),
  location: varchar("location"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertFeedbackSchema = createInsertSchema(feedback).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

export const authRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type AuthRequest = z.infer<typeof authRequestSchema>;

export const queryRequestSchema = z.object({
  question: z.string().min(1),
});

export type QueryRequest = z.infer<typeof queryRequestSchema>;

export const queryResponseSchema = z.object({
  summary: z.string(),
  top_issues: z.array(z.string()),
  sentiment_distribution: z.object({
    positive: z.number(),
    neutral: z.number(),
    negative: z.number(),
  }),
  recommendations: z.array(z.string()),
});

export type QueryResponse = z.infer<typeof queryResponseSchema>;

export * from "./models/chat";
