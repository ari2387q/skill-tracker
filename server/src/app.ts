import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./modules/auth/auth.routes"
import skillsRoutes from "./modules/skills/skills.routes";
import  logsRoutes from "./modules/logs/logs.routes";
import aiRoutes from "./modules/ai/ai.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes"

const app = express();
const allowedOrigins = ["http://localhost:3000", process.env.CLIENT_URL].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      // and allow origins present in our allowed list
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));


app.use("/api/auth", authRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/dashboard", dashboardRoutes)
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK" });
});

export default app;
