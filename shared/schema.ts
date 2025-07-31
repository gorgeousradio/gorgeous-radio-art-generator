import { sql } from "drizzle-orm";
import { mysqlTable, text, varchar, boolean, int, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Presenters table for dynamic presenter management
export const presenters = mysqlTable("presenters", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  bannerImageUrl: varchar("banner_image_url", { length: 500 }),
  isActive: boolean("is_active").default(true),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPresenterSchema = createInsertSchema(presenters).pick({
  name: true,
  displayName: true,
  profileImageUrl: true,
  bannerImageUrl: true,
  isActive: true,
  sortOrder: true,
});

export type Presenter = typeof presenters.$inferSelect;
export type InsertPresenter = z.infer<typeof insertPresenterSchema>;
