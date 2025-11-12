import express from "express";
import cors from "cors";
import { config } from "dotenv";
import routes from "./routes";

config();

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

