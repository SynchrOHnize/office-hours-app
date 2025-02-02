import final from "@/middleware/final";
import rateLimiter from "@/middleware/rate-limiter";
import env from "@/utils/env";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pino } from "pino";

import llmRouter from "@/api/llm/llm-router";
import okRouter from "@/api/ok/ok-router";
import searchRouter from "@/api/search/search-router";
import userRouter from "@/api/user/user-router";

const logger = pino({ level: env.OHSYNC_LOG_LEVEL });
const app = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(helmet());
app.use(rateLimiter);

const apiRouter = express.Router();

// Routes
apiRouter.use("/health", okRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/search", searchRouter);
apiRouter.use("/llm", llmRouter);
app.use("/api", apiRouter);

// Final handler
app.use(final);

export { app, logger };
