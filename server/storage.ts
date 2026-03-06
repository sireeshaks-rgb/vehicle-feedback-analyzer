import { db } from "./db";
import {
  users, feedback, organizations, cohortInsights, auditLogs,
  type User, type InsertUser,
  type Feedback, type InsertFeedback,
  type Organization, type InsertOrganization,
  type CohortInsight, type InsertCohortInsight
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User Management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Organization Management
  getOrganization(id: string): Promise<Organization | undefined>;
  createOrganization(org: InsertOrganization): Promise<Organization>;
  getAllOrganizations(): Promise<Organization[]>;

  // Feedback Management (Org Scoped)
  createFeedback(data: InsertFeedback): Promise<Feedback>;
  getFeedbackByOrg(orgId: string): Promise<Feedback[]>;
  getFeedbackById(id: string): Promise<Feedback | undefined>;
  getAllFeedback(): Promise<Feedback[]>; // Super admin only

  // Cohort Insights
  createCohortInsight(insight: InsertCohortInsight): Promise<CohortInsight>;
  getCohortInsightsByOrg(orgId: string): Promise<CohortInsight[]>;

  // Audit Logs
  createAuditLog(log: any): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org;
  }

  async createOrganization(org: InsertOrganization): Promise<Organization> {
    const [newOrg] = await db.insert(organizations).values(org).returning();
    return newOrg;
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return await db.select().from(organizations);
  }

  async createFeedback(data: InsertFeedback): Promise<Feedback> {
    const [fb] = await db.insert(feedback).values(data).returning();
    return fb;
  }

  async getFeedbackByOrg(orgId: string): Promise<Feedback[]> {
    return await db.select().from(feedback).where(eq(feedback.organizationId, orgId));
  }

  async getFeedbackById(id: string): Promise<Feedback | undefined> {
    const [fb] = await db.select().from(feedback).where(eq(feedback.id, id));
    return fb;
  }

  async getAllFeedback(): Promise<Feedback[]> {
    return await db.select().from(feedback);
  }

  async createCohortInsight(insight: InsertCohortInsight): Promise<CohortInsight> {
    const [newInsight] = await db.insert(cohortInsights).values(insight).returning();
    return newInsight;
  }

  async getCohortInsightsByOrg(orgId: string): Promise<CohortInsight[]> {
    return await db.select().from(cohortInsights).where(eq(cohortInsights.organizationId, orgId));
  }

  async createAuditLog(log: any): Promise<void> {
    await db.insert(auditLogs).values(log);
  }
}

export const storage = new DatabaseStorage();
