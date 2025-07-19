import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  yesSubTitle: text("yes_sub_title"),
  description: text("description"),
  category: text("category").notNull(),
  platform: text("platform").notNull(), // 'kalshi' or 'polymarket'
  externalId: text("external_id").notNull(),
  currentPrice: decimal("current_price", { precision: 10, scale: 4 }),
  volume: decimal("volume", { precision: 15, scale: 2 }),
  liquidity: decimal("liquidity", { precision: 15, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const priceHistory = pgTable("price_history", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").references(() => contracts.id),
  price: decimal("price", { precision: 10, scale: 4 }).notNull(),
  volume: decimal("volume", { precision: 15, scale: 2 }),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const orderBookData = pgTable("order_book_data", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").references(() => contracts.id),
  price: decimal("price", { precision: 10, scale: 4 }).notNull(),
  size: decimal("size", { precision: 15, scale: 2 }).notNull(),
  side: text("side").notNull(), // 'bid' or 'ask'
  timestamp: timestamp("timestamp").defaultNow(),
});

export const arbitrageOpportunities = pgTable("arbitrage_opportunities", {
  id: serial("id").primaryKey(),
  kalshiContractId: integer("kalshi_contract_id").references(() => contracts.id),
  polymarketContractId: integer("polymarket_contract_id").references(() => contracts.id),
  kalshiPrice: decimal("kalshi_price", { precision: 10, scale: 4 }),
  polymarketPrice: decimal("polymarket_price", { precision: 10, scale: 4 }),
  spread: decimal("spread", { precision: 10, scale: 4 }),
  confidence: text("confidence").notNull(), // 'high', 'medium', 'low'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPriceHistorySchema = createInsertSchema(priceHistory).omit({
  id: true,
  timestamp: true,
});

export const insertOrderBookDataSchema = createInsertSchema(orderBookData).omit({
  id: true,
  timestamp: true,
});

export const insertArbitrageOpportunitySchema = createInsertSchema(arbitrageOpportunities).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contracts.$inferSelect;

export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;
export type PriceHistory = typeof priceHistory.$inferSelect;

export type InsertOrderBookData = z.infer<typeof insertOrderBookDataSchema>;
export type OrderBookData = typeof orderBookData.$inferSelect;

export type InsertArbitrageOpportunity = z.infer<typeof insertArbitrageOpportunitySchema>;
export type ArbitrageOpportunity = typeof arbitrageOpportunities.$inferSelect;

// Dashboard data types
export interface DashboardStats {
  totalVolume: string;
  activeContracts: number;
  arbitrageOpportunities: number;
  avgLiquidity: string;
}

export interface ChartDataPoint {
  timestamp: string;
  price: number;
  volume?: number;
}

export interface ArbitrageOpportunityWithContracts extends ArbitrageOpportunity {
  kalshiContract: Contract;
  polymarketContract: Contract;
}

export interface MarketOverview {
  sectorBreakdown: { sector: string; percentage: number; }[];
  topPerformers: { name: string; change: string; }[];
}

export interface OrderBookAnalytics {
  sweepPrice100: string;
  sweepPrice1000: string;
  bidPrice100: string;
  askPrice100: string;
  bidPrice1000: string;
  askPrice1000: string;
  gaps: { range: string; gap: string; }[];
}

export interface LiquidityMetrics {
  avgSpread: string;
  marketDepth: string;
  newsImpact: string;
  autoCorrelation: string;
  predictiveValue: string;
}
