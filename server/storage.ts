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
    return Array.from(this.contracts.values());
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
    
    // Get recent price changes (mock for now)
    const topPerformers = [
      { name: 'Election Winner', change: '+8.2%' },
      { name: 'Fed Rate Cut', change: '+5.7%' },
      { name: 'GDP Growth', change: '-2.1%' }
    ];
    
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
