import { pgTable, text, integer, timestamp, varchar, date, uuid, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { enum: ["SUPER_ADMIN", "ORG_ADMIN", "MANAGER", "ANALYST", "VIEWER", "PASSENGER", "ADMIN"] }).notNull().default("PASSENGER"),
  organizationId: uuid("organization_id").references(() => organizations.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const feedback = pgTable("feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  transportMode: varchar("transport_mode", { enum: ["Bus", "Train", "Airplane"] }).notNull(),
  reviewText: text("review_text").notNull(),
  rating: integer("rating").notNull(),
  sentimentScore: real("sentiment_score"),
  issueCategory: varchar("issue_category"),
  embedding: real("embedding").array(),
  route: varchar("route"),
  passengerType: varchar("passenger_type", { enum: ["FIRST_TIME", "REGULAR"] }),
  tripTimeCategory: varchar("trip_time_category", { enum: ["PEAK", "OFF_PEAK"] }),
  dayType: varchar("day_type", { enum: ["WEEKDAY", "WEEKEND"] }),
  location: varchar("location"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  travelDate: date("travel_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cohortInsights = pgTable("cohort_insights", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  cohortType: varchar("cohort_type", { enum: ["FIRST_TIME_VS_REGULAR", "WEEKDAY_VS_WEEKEND", "PEAK_VS_OFFPEAK"] }).notNull(),
  insights: jsonb("insights").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  userId: uuid("user_id").references(() => users.id),
  action: text("action").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertFeedbackSchema = createInsertSchema(feedback).omit({ id: true, createdAt: true });
export const insertCohortInsightSchema = createInsertSchema(cohortInsights).omit({ id: true, createdAt: true });

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

export type CohortInsight = typeof cohortInsights.$inferSelect;
export type InsertCohortInsight = z.infer<typeof insertCohortInsightSchema>;

export const authRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["PASSENGER", "ADMIN"]).optional(),
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
