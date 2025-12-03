// All code written in this file was created by Ethan Hunt and is completely original in terms of its use. I used several resources to help aid my coding process as I have never used Prisma or TypeScript before.

// All comments were created by AI after the code was written. The prompt was "Add comments to the index file"

import express from "express";
import cors from "cors";
import { config } from "dotenv";
import routes from "./routes";

config();

// Validate required environment variables
if (!process.env.GOOGLE_CLIENT_ID) {
  console.warn("⚠️  WARNING: GOOGLE_CLIENT_ID is not set. Google Sign-In will not work.");
  console.warn("   Set GOOGLE_CLIENT_ID in your .env file to enable authentication.");
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/", routes);

const PORT = parseInt(process.env.PORT || "3000", 10);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

