//src/lib/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";
import { readConfig } from "../../config";

const config = readConfig();
const conn = postgres(config.dbUrl, {
  idle_timeout: 1,
  max_lifetime: 1,
});
export const db = drizzle(conn, { schema });
