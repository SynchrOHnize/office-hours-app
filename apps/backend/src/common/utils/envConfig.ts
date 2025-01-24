import dotenv from "dotenv";
import { cleanEnv, host, port, str } from "envalid";

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({choices: ["development", "production", "test"] }),
  MYSQL_USER: str(), // No default here since it's required
  MYSQL_PASSWORD: str(), // Password is required
  MYSQL_HOST: host(), // Host validation for the database
  MYSQL_PORT: port(), // MySQL port as a number
  MYSQL_DATABASE: str(),
  OHSYNC_LOG_LEVEL: str({ choices: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'], default: 'info' }),
  OPENAI_API_KEY: str(),
  SENDGRID_API_KEY: str(),
});
