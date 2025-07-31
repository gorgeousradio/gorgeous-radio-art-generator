import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

// Disable database in development to prevent timeout issues
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  console.log("Development mode: Database disabled, using mock data");
}

export const connection = (!isDevelopment && process.env.DATABASE_URL) ? mysql.createPool(process.env.DATABASE_URL) : null;
export const db = connection ? drizzle(connection, { schema, mode: 'default' }) : null;