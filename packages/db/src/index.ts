import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

// neon-serverless Pool — HTTP와 달리 트랜잭션 지원
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

/**
 * @description Neon PostgreSQL Drizzle ORM 인스턴스. 서버 사이드 전용
 */
export const db = drizzle(pool, { schema });

export * from "./schema";
