import { drizzle } from "drizzle-orm/netlify-db";
import { getDatabase } from "@netlify/database";
import * as schema from "./schema.js";

// Initialize inside the request so Netlify supplies the correct database branch.
export function getDb() {
  return drizzle({ client: getDatabase(), schema });
}
