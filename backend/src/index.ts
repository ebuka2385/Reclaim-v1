// All code written in this file was created by Ethan Hunt and is completely original in terms of its use. I used several resources to help aid my coding process as I have never used Prisma or TypeScript before.

// All comments were created by AI after the code was written. The prompt was "Add comments to the index file"

import express from "express";
import cors from "cors";
import { config } from "dotenv";
import routes from "./routes";
import { prisma } from "./lib/prisma";

config();

// Validate required environment variables
if (!process.env.GOOGLE_CLIENT_ID) {
  console.warn("⚠️  WARNING: GOOGLE_CLIENT_ID is not set. Google Sign-In will not work.");
  console.warn("   Set GOOGLE_CLIENT_ID in your .env file to enable authentication.");
}

if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL is not set!");
  process.exit(1);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// CRITICAL: Health check FIRST, before any other routes
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});

// Connect to database (non-blocking)
prisma.$connect()
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("⚠️  Database connection warning:", err));

// Routes
app.use("/", routes);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = parseInt(process.env.PORT || "3000", 10);

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check available at http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("⚠️  SIGTERM received, shutting down gracefully...");
  server.close(async () => {
    await prisma.$disconnect();
    console.log("✅ Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("⚠️  SIGINT received, shutting down gracefully...");
  server.close(async () => {
    await prisma.$disconnect();
    console.log("✅ Server closed");
    process.exit(0);
  });
});

