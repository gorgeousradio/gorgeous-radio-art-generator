import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Disable database in development to prevent timeout issues
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  console.log("Development mode: Database disabled, using mock data");
}

export const connection = (!isDevelopment && process.env.DATABASE_URL) ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;
export const db = connection ? drizzle(connection, { schema }) : null;