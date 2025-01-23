import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";

import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import { userRouter } from "@/api/user/userRouter";
import { canvasRouter } from "./api/canvas/canvasRouter";
import errorHandler from "@/common/middleware/errorHandler";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "@/common/utils/envConfig";
import { searchRouter } from "./api/search/searchRouter";
import { llmRouter } from "./api/llm/llmRouter";

const logger = pino({ name: 'server', level: env.OHSYNC_LOG_LEVEL });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

const apiRouter = express.Router();

// Routes
apiRouter.use("/health", healthCheckRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/canvas", canvasRouter);
apiRouter.use("/search", searchRouter);
apiRouter.use("/llm", llmRouter);

app.use("/api", apiRouter);
// Error handlers
app.use(errorHandler());

export { app, logger };
