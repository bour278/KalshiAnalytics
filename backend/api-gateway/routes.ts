import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertContractSchema, 
  insertPriceHistorySchema, 
  insertOrderBookDataSchema, 
  insertArbitrageOpportunitySchema 
} from "@shared/schema";
import { z } from "zod";
import type { IStorage } from "./storage";

export async function registerRoutes(app: Express, storage: IStorage): Promise<Server> {
  
  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Contracts
  app.get("/api/contracts", async (req, res) => {
    try {
      const contracts = await storage.getContracts();
      res.json(contracts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  app.get("/api/contracts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contract = await storage.getContract(id);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      res.json(contract);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contract" });
    }
  });

  app.post("/api/contracts", async (req, res) => {
    try {
      const contract = insertContractSchema.parse(req.body);
      const newContract = await storage.createContract(contract);
      res.status(201).json(newContract);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contract data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create contract" });
    }
  });

  // Price history
  app.get("/api/contracts/:id/price-history", async (req, res) => {
    try {
      const contractId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const history = await storage.getPriceHistory(contractId, limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch price history" });
    }
  });

  app.post("/api/contracts/:id/price-history", async (req, res) => {
    try {
      const contractId = parseInt(req.params.id);
      const priceHistory = insertPriceHistorySchema.parse({
        ...req.body,
        contractId
      });
      const newPriceHistory = await storage.createPriceHistory(priceHistory);
      res.status(201).json(newPriceHistory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid price history data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create price history" });
    }
  });

  // Order book data
  app.get("/api/contracts/:id/order-book", async (req, res) => {
    try {
      const contractId = parseInt(req.params.id);
      const orderBook = await storage.getOrderBookData(contractId);
      res.json(orderBook);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order book data" });
    }
  });

  app.post("/api/contracts/:id/order-book", async (req, res) => {
    try {
      const contractId = parseInt(req.params.id);
      const orderBookData = insertOrderBookDataSchema.parse({
        ...req.body,
        contractId
      });
      const newOrderBookData = await storage.createOrderBookData(orderBookData);
      res.status(201).json(newOrderBookData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order book data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order book data" });
    }
  });

  // Arbitrage opportunities
  app.get("/api/arbitrage/opportunities", async (req, res) => {
    try {
      const opportunities = await storage.getArbitrageOpportunities();
      res.json(opportunities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch arbitrage opportunities" });
    }
  });

  app.post("/api/arbitrage/opportunities", async (req, res) => {
    try {
      const opportunity = insertArbitrageOpportunitySchema.parse(req.body);
      const newOpportunity = await storage.createArbitrageOpportunity(opportunity);
      res.status(201).json(newOpportunity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid arbitrage opportunity data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create arbitrage opportunity" });
    }
  });

  // Chart data
  app.get("/api/contracts/:id/chart-data", async (req, res) => {
    try {
      const contractId = parseInt(req.params.id);
      const timeframe = req.query.timeframe as string || '1D';
      const chartData = await storage.getChartData(contractId, timeframe);
      res.json(chartData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chart data" });
    }
  });

  // Market overview
  app.get("/api/market/overview", async (req, res) => {
    try {
      const overview = await storage.getMarketOverview();
      res.json(overview);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market overview" });
    }
  });

  // Order book analytics
  app.get("/api/contracts/:id/order-book-analytics", async (req, res) => {
    try {
      const contractId = parseInt(req.params.id);
      const analytics = await storage.getOrderBookAnalytics(contractId);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order book analytics" });
    }
  });

  // Liquidity metrics
  app.get("/api/liquidity/metrics", async (req, res) => {
    try {
      const metrics = await storage.getLiquidityMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch liquidity metrics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
