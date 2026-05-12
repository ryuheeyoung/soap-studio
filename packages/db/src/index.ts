import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);

/**
 * @description Neon PostgreSQL Drizzle ORM 인스턴스. 서버 사이드 전용
 */
export const db = drizzle(sql, { schema });

export * from "./schema";
