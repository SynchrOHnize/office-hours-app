import "dotenv/config";
import { cleanEnv, host, port, str } from "envalid";
import postgres from "postgres";

const env = cleanEnv(process.env, {
  PGUSER: str({ desc: "Database username" }),
  PGPASSWORD: str({ desc: "Database password" }),
  PGHOST: host({ desc: "Database host" }),
  PGPORT: port({ desc: "Database port" }),
  PGDATABASE: str({ desc: "Database name" }),
});

export default postgres({
  user: env.PGUSER,
  password: env.PGPASSWORD,
  host: env.PGHOST,
  port: env.PGPORT,
  database: env.PGDATABASE,
  onnotice: () => {},
}) satisfies postgres.Sql;
