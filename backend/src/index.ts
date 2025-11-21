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

app.listen(PORT, () => {
  console.log("🚀 Server running at http://localhost:${PORT}");
});

