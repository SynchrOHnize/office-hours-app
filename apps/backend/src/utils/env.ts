import "dotenv/config";
import { cleanEnv, host, port, str } from "envalid";

export default cleanEnv(process.env, {
  NODE_ENV: str({ choices: ["development", "production", "test"] }),
  OHSYNC_LOG_LEVEL: str({ choices: ["fatal", "error", "warn", "info", "debug", "trace", "silent"], default: "info" }),
  OHSYNC_HOST: host({ default: "127.0.0.1", desc: "Listen on specified host" }),
  OHSYNC_PORT: port({ default: 8080, desc: "Listen on specified port" }),
  OPENAI_API_KEY: str(),
  SENDGRID_API_KEY: str(),
});
