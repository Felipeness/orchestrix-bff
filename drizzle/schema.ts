import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

// BFF cache table (optional - for caching aggregated data)
export const cache = pgTable('bff_cache', {
	id: uuid('id').primaryKey().defaultRandom(),
	key: varchar('key', { length: 255 }).notNull().unique(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at', { withTimezone: true }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// User preferences (stored in BFF for faster access)
export const userPreferences = pgTable('user_preferences', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id').notNull(),
	tenantId: uuid('tenant_id').notNull(),
	theme: varchar('theme', { length: 20 }).default('system'),
	language: varchar('language', { length: 10 }).default('en'),
	timezone: varchar('timezone', { length: 50 }).default('UTC'),
	notifications: text('notifications'), // JSON
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
