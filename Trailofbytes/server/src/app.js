import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import xss from "xss-clean";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import level2Routes from "./routes/level2Routes.js";
import errorHandler from "./middleware/errorHandler.js";
import { ipLimiter } from "./middleware/rateLimiter.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);
app.use(ipLimiter);
app.use(express.json());
app.use(cookieParser());
app.use(xss());
app.use(compression());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/level2", level2Routes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
});

app.use(errorHandler);

export default app;

