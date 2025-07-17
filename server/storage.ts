import { 
  users, 
  contracts, 
  priceHistory, 
  orderBookData, 
  arbitrageOpportunities,
  type User, 
  type InsertUser,
  type Contract,
  type InsertContract,
  type PriceHistory,
  type InsertPriceHistory,
  type OrderBookData,
  type InsertOrderBookData,
  type ArbitrageOpportunity,
  type InsertArbitrageOpportunity,
  type ArbitrageOpportunityWithContracts,
  type DashboardStats,
  type ChartDataPoint,
  type MarketOverview,
  type OrderBookAnalytics,
  type LiquidityMetrics
} from "@shared/schema";
import { kalshiService } from "./kalshi-service";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Contract operations
  getContracts(): Promise<Contract[]>;
  getContract(id: number): Promise<Contract | undefined>;
  getContractsByPlatform(platform: string): Promise<Contract[]>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: number, updates: Partial<Contract>): Promise<Contract | undefined>;
  
  // Price history operations
  getPriceHistory(contractId: number, limit?: number): Promise<PriceHistory[]>;
  createPriceHistory(priceHistory: InsertPriceHistory): Promise<PriceHistory>;
  
  // Order book operations
  getOrderBookData(contractId: number): Promise<OrderBookData[]>;
  createOrderBookData(orderBookData: InsertOrderBookData): Promise<OrderBookData>;
  
  // Arbitrage operations
  getArbitrageOpportunities(): Promise<ArbitrageOpportunityWithContracts[]>;
  createArbitrageOpportunity(opportunity: InsertArbitrageOpportunity): Promise<ArbitrageOpportunity>;
  
  // Dashboard operations
  getDashboardStats(): Promise<DashboardStats>;
  getChartData(contractId: number, timeframe: string): Promise<ChartDataPoint[]>;
  getMarketOverview(): Promise<MarketOverview>;
  getOrderBookAnalytics(contractId: number): Promise<OrderBookAnalytics>;
  getLiquidityMetrics(): Promise<LiquidityMetrics>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contracts: Map<number, Contract>;
  private priceHistory: Map<number, PriceHistory>;
  private orderBookData: Map<number, OrderBookData>;
  private arbitrageOpportunities: Map<number, ArbitrageOpportunity>;
  private currentUserId: number;
  private currentContractId: number;
  private currentPriceHistoryId: number;
  private currentOrderBookDataId: number;
  private currentArbitrageId: number;

  constructor() {
    this.users = new Map();
    this.contracts = new Map();
    this.priceHistory = new Map();
    this.orderBookData = new Map();
    this.arbitrageOpportunities = new Map();
    this.currentUserId = 1;
    this.currentContractId = 1;
    this.currentPriceHistoryId = 1;
    this.currentOrderBookDataId = 1;
    this.currentArbitrageId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample contracts
    const sampleContracts = [
      {
        title: "2024 Presidential Election Winner",
        description: "Will Donald Trump win the 2024 Presidential Election?",
        category: "Politics",
        platform: "kalshi",
        externalId: "PRES-2024-TRUMP",
        currentPrice: "0.52",
        volume: "2400000",
        liquidity: "85000",
        isActive: true
      },
      {
        title: "2024 Presidential Election Winner",
        description: "Will Donald Trump win the 2024 Presidential Election?",
        category: "Politics", 
        platform: "polymarket",
        externalId: "PRES-2024-TRUMP-PM",
        currentPrice: "0.48",
        volume: "1800000",
        liquidity: "72000",
        isActive: true
      },
      {
        title: "Fed Rate Decision Dec 2024",
        description: "Will the Fed cut rates by 0.25% in December 2024?",
        category: "Economics",
        platform: "kalshi",
        externalId: "FED-DEC-2024",
        currentPrice: "0.73",
        volume: "850000",
        liquidity: "45000",
        isActive: true
      },
      {
        title: "Q4 GDP Growth Rate",
        description: "Will Q4 2024 GDP growth exceed 2.5%?",
        category: "Economics",
        platform: "kalshi",
        externalId: "GDP-Q4-2024",
        currentPrice: "0.64",
        volume: "420000",
        liquidity: "28000",
        isActive: true
      },
      {
        title: "Bitcoin Price Target",
        description: "Will Bitcoin reach $100,000 by end of 2024?",
        category: "Crypto",
        platform: "polymarket",
        externalId: "BTC-100K-2024",
        currentPrice: "0.38",
        volume: "1200000",
        liquidity: "95000",
        isActive: true
      }
    ];

    // Add contracts to storage
    sampleContracts.forEach(contract => {
      const id = this.currentContractId++;
      const now = new Date();
      const fullContract: Contract = {
        ...contract,
        id,
        createdAt: now,
        updatedAt: now
      };
      this.contracts.set(id, fullContract);
    });

    // Create sample price history
    const baseTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    for (let contractId = 1; contractId <= 5; contractId++) {
      for (let i = 0; i < 50; i++) {
        const id = this.currentPriceHistoryId++;
        const timestamp = new Date(baseTime + (i * 30 * 60 * 1000)); // Every 30 minutes
        const basePrice = contractId === 1 ? 0.52 : contractId === 2 ? 0.48 : contractId === 3 ? 0.73 : contractId === 4 ? 0.64 : 0.38;
        const variance = (Math.random() - 0.5) * 0.1;
        const price = Math.max(0.01, Math.min(0.99, basePrice + variance));
        const volume = Math.floor(Math.random() * 50000) + 10000;
        
        this.priceHistory.set(id, {
          id,
          contractId,
          price: price.toFixed(4),
          volume: volume.toString(),
          timestamp
        });
      }
    }

    // Create sample order book data
    for (let contractId = 1; contractId <= 5; contractId++) {
      const contract = this.contracts.get(contractId);
      if (contract) {
        const currentPrice = parseFloat(contract.currentPrice || '0.5');
        
        // Create bid orders (below current price)
        for (let i = 0; i < 10; i++) {
          const id = this.currentOrderBookDataId++;
          const price = currentPrice - (i + 1) * 0.01;
          const size = Math.floor(Math.random() * 5000) + 1000;
          
          this.orderBookData.set(id, {
            id,
            contractId,
            price: price.toFixed(4),
            size: size.toString(),
            side: 'bid',
            timestamp: new Date()
          });
        }
        
        // Create ask orders (above current price)
        for (let i = 0; i < 10; i++) {
          const id = this.currentOrderBookDataId++;
          const price = currentPrice + (i + 1) * 0.01;
          const size = Math.floor(Math.random() * 5000) + 1000;
          
          this.orderBookData.set(id, {
            id,
            contractId,
            price: price.toFixed(4),
            size: size.toString(),
            side: 'ask',
            timestamp: new Date()
          });
        }
      }
    }

    // Create sample arbitrage opportunities
    const opportunities = [
      {
        kalshiContractId: 1,
        polymarketContractId: 2,
        kalshiPrice: "0.52",
        polymarketPrice: "0.48",
        spread: "7.7",
        confidence: "high",
        isActive: true
      },
      {
        kalshiContractId: 3,
        polymarketContractId: 5,
        kalshiPrice: "0.73",
        polymarketPrice: "0.71",
        spread: "2.8",
        confidence: "medium",
        isActive: true
      }
    ];

    opportunities.forEach(opp => {
      const id = this.currentArbitrageId++;
      this.arbitrageOpportunities.set(id, {
        ...opp,
        id,
        createdAt: new Date()
      });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getContracts(): Promise<Contract[]> {
    try {
      return await kalshiService.getMarkets({ limit: 100 });
    } catch (error) {
      console.error('Failed to fetch contracts from Kalshi service:', error);
      // Fallback to local data
      return Array.from(this.contracts.values());
    }
  }

  async getContract(id: number): Promise<Contract | undefined> {
    return this.contracts.get(id);
  }

  async getContractsByPlatform(platform: string): Promise<Contract[]> {
    return Array.from(this.contracts.values()).filter(
      (contract) => contract.platform === platform
    );
  }

  async createContract(insertContract: InsertContract): Promise<Contract> {
    const id = this.currentContractId++;
    const now = new Date();
    const contract: Contract = { 
      ...insertContract, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.contracts.set(id, contract);
    return contract;
  }

  async updateContract(id: number, updates: Partial<Contract>): Promise<Contract | undefined> {
    const contract = this.contracts.get(id);
    if (!contract) return undefined;
    
    const updatedContract = { ...contract, ...updates, updatedAt: new Date() };
    this.contracts.set(id, updatedContract);
    return updatedContract;
  }

  async getPriceHistory(contractId: number, limit?: number): Promise<PriceHistory[]> {
    const history = Array.from(this.priceHistory.values())
      .filter(ph => ph.contractId === contractId)
      .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());
    
    return limit ? history.slice(0, limit) : history;
  }

  async createPriceHistory(insertPriceHistory: InsertPriceHistory): Promise<PriceHistory> {
    const id = this.currentPriceHistoryId++;
    const priceHistory: PriceHistory = { 
      ...insertPriceHistory, 
      id, 
      timestamp: new Date() 
    };
    this.priceHistory.set(id, priceHistory);
    return priceHistory;
  }

  async getOrderBookData(contractId: number): Promise<OrderBookData[]> {
    return Array.from(this.orderBookData.values())
      .filter(obd => obd.contractId === contractId)
      .sort((a, b) => parseFloat(a.price || '0') - parseFloat(b.price || '0'));
  }

  async createOrderBookData(insertOrderBookData: InsertOrderBookData): Promise<OrderBookData> {
    const id = this.currentOrderBookDataId++;
    const orderBookData: OrderBookData = { 
      ...insertOrderBookData, 
      id, 
      timestamp: new Date() 
    };
    this.orderBookData.set(id, orderBookData);
    return orderBookData;
  }

  async getArbitrageOpportunities(): Promise<ArbitrageOpportunityWithContracts[]> {
    try {
      return await kalshiService.getArbitrageOpportunities();
    } catch (error) {
      console.error('Failed to fetch arbitrage opportunities from Kalshi service:', error);
      // Fallback to local data
      const opportunities = Array.from(this.arbitrageOpportunities.values())
        .filter(opp => opp.isActive);
      
      const result: ArbitrageOpportunityWithContracts[] = [];
      
      for (const opp of opportunities) {
        const kalshiContract = this.contracts.get(opp.kalshiContractId!);
        const polymarketContract = this.contracts.get(opp.polymarketContractId!);
        
        if (kalshiContract && polymarketContract) {
          result.push({
            ...opp,
            kalshiContract,
            polymarketContract
          });
        }
      }
      
      return result;
    }
  }

  async createArbitrageOpportunity(insertOpportunity: InsertArbitrageOpportunity): Promise<ArbitrageOpportunity> {
    const id = this.currentArbitrageId++;
    const opportunity: ArbitrageOpportunity = { 
      ...insertOpportunity, 
      id, 
      createdAt: new Date() 
    };
    this.arbitrageOpportunities.set(id, opportunity);
    return opportunity;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      return await kalshiService.getDashboardStats();
    } catch (error) {
      console.error('Failed to fetch dashboard stats from Kalshi service:', error);
      // Fallback to local data
      const contracts = Array.from(this.contracts.values());
      const opportunities = Array.from(this.arbitrageOpportunities.values()).filter(opp => opp.isActive);
      
      const totalVolume = contracts.reduce((sum, contract) => 
        sum + parseFloat(contract.volume || '0'), 0);
      
      const totalLiquidity = contracts.reduce((sum, contract) => 
        sum + parseFloat(contract.liquidity || '0'), 0);
      
      const avgLiquidity = contracts.length > 0 ? totalLiquidity / contracts.length : 0;
      
      return {
        totalVolume: `$${(totalVolume / 1000000).toFixed(1)}M`,
        activeContracts: contracts.filter(c => c.isActive).length,
        arbitrageOpportunities: opportunities.length,
        avgLiquidity: `${avgLiquidity.toFixed(1)}%`
      };
    }
  }

  async getChartData(contractId: number, timeframe: string): Promise<ChartDataPoint[]> {
    const history = await this.getPriceHistory(contractId, 50);
    
    return history.map(ph => ({
      timestamp: new Date(ph.timestamp!).toISOString(),
      price: parseFloat(ph.price || '0'),
      volume: parseFloat(ph.volume || '0')
    })).reverse();
  }

  async getMarketOverview(): Promise<MarketOverview> {
    const contracts = Array.from(this.contracts.values());
    const sectorCounts = contracts.reduce((acc, contract) => {
      acc[contract.category] = (acc[contract.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const totalContracts = contracts.length;
    const sectorBreakdown = Object.entries(sectorCounts).map(([sector, count]) => ({
      sector,
      percentage: Math.round((count / totalContracts) * 100)
    }));
    
    // Get top performers based on actual contract data
    const topPerformers = contracts
      .sort((a, b) => parseInt(b.volume || "0") - parseInt(a.volume || "0"))
      .slice(0, 4)
      .map(contract => {
        const priceFloat = parseFloat(contract.currentPrice || "0.5");
        const change = ((priceFloat - 0.5) * 100).toFixed(1);
        return {
          name: contract.title.length > 20 ? contract.title.substring(0, 20) + "..." : contract.title,
          change: change.startsWith('-') ? change + "%" : "+" + change + "%"
        };
      });
    
    return {
      sectorBreakdown,
      topPerformers
    };
  }

  async getOrderBookAnalytics(contractId: number): Promise<OrderBookAnalytics> {
    const orderBook = await this.getOrderBookData(contractId);
    
    // Calculate sweep prices (simplified)
    const bids = orderBook.filter(ob => ob.side === 'bid');
    const asks = orderBook.filter(ob => ob.side === 'ask');
    
    const sweepPrice100 = asks.length > 0 ? asks[0].price : '0';
    const sweepPrice1000 = asks.length > 2 ? asks[2].price : '0';
    
    return {
      sweepPrice100: `$${parseFloat(sweepPrice100 || '0').toFixed(2)}`,
      sweepPrice1000: `$${parseFloat(sweepPrice1000 || '0').toFixed(2)}`,
      bidPrice100: bids.length > 0 ? `$${parseFloat(bids[0].price || '0').toFixed(2)}` : '$0.00',
      askPrice100: asks.length > 0 ? `$${parseFloat(asks[0].price || '0').toFixed(2)}` : '$0.00',
      bidPrice1000: bids.length > 2 ? `$${parseFloat(bids[2].price || '0').toFixed(2)}` : '$0.00',
      askPrice1000: asks.length > 2 ? `$${parseFloat(asks[2].price || '0').toFixed(2)}` : '$0.00',
      gaps: [
        { range: '$0.65 - $0.67', gap: '2¢' },
        { range: '$0.69 - $0.72', gap: '3¢' }
      ]
    };
  }

  async getLiquidityMetrics(): Promise<LiquidityMetrics> {
    return {
      avgSpread: '2.1¢',
      marketDepth: '$45.2K',
      newsImpact: 'High',
      autoCorrelation: 'Medium',
      predictiveValue: 'High'
    };
  }
}

export const storage = new MemStorage();
