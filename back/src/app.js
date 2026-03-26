import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import { env } from "./config/env.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.frontendOrigin }));
  app.use(express.json());
  app.use("/api", authRoutes);

  return app;
}
