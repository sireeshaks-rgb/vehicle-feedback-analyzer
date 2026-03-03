import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import jwt from "jsonwebtoken";
import multer from "multer";
import { parse } from "csv-parse/sync";
import { openai } from "./replit_integrations/audio"; // reusing the setup from audio integration

const JWT_SECRET = process.env.SESSION_SECRET || "fallback_secret";

// Simple auth middleware
const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const { email, password } = api.auth.register.input.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists", field: "email" });
      }

      // In a real app, hash the password. Here keeping it simple for MVP.
      const user = await storage.createUser({ email, passwordHash: password });
      
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "24h" });
      res.status(201).json({ token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { email, password } = api.auth.login.input.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.passwordHash !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "24h" });
      res.json({ token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.feedback.upload.path, authMiddleware, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileContent = req.file.buffer.toString("utf-8");
      const records = parse(fileContent, { columns: true, skip_empty_lines: true });

      let count = 0;
      for (const record of records) {
        // Assume CSV has columns: review_text, rating, travel_date, location
        if (record.review_text && record.rating) {
           await storage.createFeedback({
             reviewText: record.review_text,
             rating: parseInt(record.rating, 10),
             travelDate: record.travel_date ? new Date(record.travel_date) : null,
             location: record.location || null
           });
           count++;
        }
      }

      res.json({ message: "Upload successful", count });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to process CSV" });
    }
  });

  app.post(api.rag.query.path, async (req, res) => {
    try {
      const { question } = api.rag.query.input.parse(req.body);

      // Simple implementation: fetch all feedback and use it as context (in-memory for MVP instead of vector DB)
      const allFeedback = await storage.getAllFeedback();
      const feedbackText = allFeedback.map(f => `Review: ${f.reviewText} (Rating: ${f.rating}, Location: ${f.location})`).join("\\n");

      const prompt = `
      You are a transport service analytics expert. Based on the following passenger feedback, answer the user's question.
      User Question: ${question}

      Feedback Context:
      ${feedbackText}

      Generate a JSON response with the following structure:
      {
        "summary": "Overall trend summary",
        "top_issues": ["Issue 1", "Issue 2", "Issue 3"],
        "sentiment_distribution": {
          "positive": 40,
          "neutral": 30,
          "negative": 30
        },
        "recommendations": ["Recommendation 1", "Recommendation 2"]
      }
      Return ONLY valid JSON.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const resultText = response.choices[0]?.message?.content;
      if (!resultText) {
        throw new Error("No response from AI");
      }

      const jsonResult = JSON.parse(resultText);
      res.json(jsonResult);
      
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ message: "Failed to analyze feedback" });
    }
  });

  return httpServer;
}
