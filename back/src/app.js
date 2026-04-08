import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import funcionarioRoutes from "./routes/funcionarioRoutes.js";
import { env } from "./config/env.js";

function origemLocalPermitida(origin) {
  return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
}

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || origin === env.frontendOrigin || origemLocalPermitida(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Origem nao permitida pelo CORS"));
      },
    })
  );
  app.use(express.json({ limit: "10mb" }));
  app.use("/api", authRoutes);
  app.use("/api", funcionarioRoutes);

  return app;
}
