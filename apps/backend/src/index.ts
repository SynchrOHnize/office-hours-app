import { app, logger } from "@/server";
import env from "@/utils/env";

const host = env.OHSYNC_HOST;
const port = env.OHSYNC_PORT;

const server = app.listen(port, host, () => {
  logger.info(`Server (${env.NODE_ENV}) listening on http://${host}:${port}`);
});

function shutdown() {
  logger.info("shutting down");
  server.close(() => {
    logger.info("server closed");
    process.exit();
  });
  setTimeout(() => process.exit(1), 30000).unref(); // Force shutdown after 30s
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
