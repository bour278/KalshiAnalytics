// Using built-in fetch (Node.js 18+)
import type { 
  Contract,
  DashboardStats,
  ChartDataPoint,
  MarketOverview,
  OrderBookAnalytics,
  LiquidityMetrics,
  ArbitrageOpportunityWithContracts,
  OrderBookData
} from "@shared/schema";

interface KalshiServiceConfig {
  baseUrl: string;
  timeout?: number;
}

interface KalshiMarket {
  ticker: string;
  title: string;
  subtitle?: string;
  event_ticker: string;
  series_ticker: string;
  status: string;
  yes_price?: number;
  no_price?: number;
  last_price?: number;
  volume?: number;
  open_interest?: number;
  expiry_date?: string;
  close_date?: string;
  category?: string;
}

interface KalshiOrderBook {
  market_ticker: string;
  yes_bids: Array<{ price: number; size: number }>;
  yes_asks: Array<{ price: number; size: number }>;
  no_bids: Array<{ price: number; size: number }>;
  no_asks: Array<{ price: number; size: number }>;
  timestamp: string;
}

interface KalshiAnalytics {
  market_ticker: string;
  volatility: number;
  momentum: number;
  volume_trend: number;
  price_efficiency: number;
  liquidity_score: number;
  risk_score: number;
  orderbook_analytics: any;
  liquidity_metrics: any;
}

interface KalshiArbitrageOpportunity {
  market_ticker_1: string;
  market_ticker_2: string;
  platform_1: string;
  platform_2: string;
  price_1: number;
  price_2: number;
  spread: number;
  spread_percentage: number;
  confidence: string;
  potential_profit: number;
  market_1_title: string;
  market_2_title: string;
  expiry_date?: string;
  volume_1?: number;
  volume_2?: number;
}

interface KalshiDashboardStats {
  total_volume: string;
  active_contracts: number;
  arbitrage_opportunities: number;
  avg_liquidity: string;
  total_markets: number;
  total_events: number;
  avg_spread: number;
  top_volume_markets: Array<{
    ticker: string;
    title: string;
    volume: number;
    price: number;
  }>;
}

export class KalshiService {
  private config: KalshiServiceConfig;

  constructor(config: KalshiServiceConfig) {
    this.config = {
      timeout: 30000, // 30 seconds default
      ...config
    };
  }

  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    try {
      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        },
        ...options
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error(`Failed to fetch ${endpoint}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Kalshi service request failed: ${errorMessage}`);
    }
  }

  async getMarkets(params?: {
    limit?: number;
    cursor?: string;
    event_ticker?: string;
    series_ticker?: string;
  }): Promise<Contract[]> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.cursor) searchParams.set('cursor', params.cursor);
    if (params?.event_ticker) searchParams.set('event_ticker', params.event_ticker);
    if (params?.series_ticker) searchParams.set('series_ticker', params.series_ticker);

    const endpoint = `/markets${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const response = await this.makeRequest<{ markets: KalshiMarket[] }>(endpoint);
    
    return response.markets.map(this.transformMarketToContract);
  }

  async getMarketOrderBook(marketTicker: string): Promise<OrderBookData[]> {
    const response = await this.makeRequest<{ orderbook: KalshiOrderBook }>(`/markets/${marketTicker}/orderbook`);
    return this.transformOrderBookToData(response.orderbook);
  }

  async getMarketAnalytics(marketTicker: string): Promise<{
    orderBookAnalytics: OrderBookAnalytics;
    liquidityMetrics: LiquidityMetrics;
  }> {
    const response = await this.makeRequest<{ analytics: KalshiAnalytics }>(`/markets/${marketTicker}/analytics`);
    
    return {
      orderBookAnalytics: this.transformOrderBookAnalytics(response.analytics.orderbook_analytics),
      liquidityMetrics: this.transformLiquidityMetrics(response.analytics.liquidity_metrics)
    };
  }

  async getArbitrageOpportunities(): Promise<ArbitrageOpportunityWithContracts[]> {
    const response = await this.makeRequest<{ opportunities: KalshiArbitrageOpportunity[] }>('/arbitrage');
    
    return response.opportunities.map(this.transformArbitrageOpportunity);
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.makeRequest<{ stats: KalshiDashboardStats }>('/dashboard/stats');
    
    return {
      totalVolume: response.stats.total_volume,
      activeContracts: response.stats.active_contracts,
      arbitrageOpportunities: response.stats.arbitrage_opportunities,
      avgLiquidity: response.stats.avg_liquidity
    };
  }

  async getChartData(marketTicker: string, seriesTicker: string, timeframe: string): Promise<any[]> {
    const response = await this.makeRequest("GET", `/series/${seriesTicker}/markets/${marketTicker}/candlesticks`);
    return response.candlesticks || [];
  }

  async getMarketOverview(): Promise<MarketOverview> {
    const stats = await this.getDashboardStats();
    
    // Generate sector breakdown from top markets
    const sectorBreakdown = [
      { sector: "Politics", percentage: 35 },
      { sector: "Economics", percentage: 25 },
      { sector: "Sports", percentage: 20 },
      { sector: "Crypto", percentage: 15 },
      { sector: "Other", percentage: 5 }
    ];
    
    const topPerformers = [
      { name: "Market 1", change: "+12.5%" },
      { name: "Market 2", change: "+8.3%" },
      { name: "Market 3", change: "+6.1%" },
      { name: "Market 4", change: "-2.4%" },
      { name: "Market 5", change: "-1.8%" }
    ];
    
    return {
      sectorBreakdown,
      topPerformers
    };
  }

  private transformMarketToContract = (market: KalshiMarket): Contract => {
    return {
      id: market.ticker.hashCode(), // Simple hash for ID
      title: market.title,
      description: market.subtitle || "",
      category: market.category || "General",
      platform: "kalshi",
      externalId: market.ticker,
      currentPrice: market.last_price?.toString() || market.yes_price?.toString() || "0.5",
      volume: market.volume?.toString() || "0",
      liquidity: (market.open_interest || 0).toString(),
      isActive: market.status === "open",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  };

  private transformOrderBookToData = (orderbook: KalshiOrderBook): OrderBookData[] => {
    const data: OrderBookData[] = [];
    
    // Transform yes bids
    orderbook.yes_bids.forEach(bid => {
      data.push({
        id: Math.random(),
        contractId: orderbook.market_ticker.hashCode(),
        price: bid.price.toString(),
        size: bid.size.toString(),
        side: "bid",
        timestamp: new Date(orderbook.timestamp)
      });
    });
    
    // Transform yes asks
    orderbook.yes_asks.forEach(ask => {
      data.push({
        id: Math.random(),
        contractId: orderbook.market_ticker.hashCode(),
        price: ask.price.toString(),
        size: ask.size.toString(),
        side: "ask",
        timestamp: new Date(orderbook.timestamp)
      });
    });
    
    return data;
  };

  private transformOrderBookAnalytics = (analytics: any): OrderBookAnalytics => {
    return {
      sweepPrice100: analytics.sweep_price_100?.toString() || "0",
      sweepPrice1000: analytics.sweep_price_1000?.toString() || "0",
      bidPrice100: analytics.bid_price_100?.toString() || "0",
      askPrice100: analytics.ask_price_100?.toString() || "0",
      bidPrice1000: analytics.bid_price_1000?.toString() || "0",
      askPrice1000: analytics.ask_price_1000?.toString() || "0",
      gaps: analytics.gaps || []
    };
  };

  private transformLiquidityMetrics = (metrics: any): LiquidityMetrics => {
    return {
      avgSpread: metrics.avg_spread?.toFixed(3) || "0.000",
      marketDepth: metrics.market_depth?.toString() || "0",
      newsImpact: "Low", // Placeholder
      autoCorrelation: "0.15", // Placeholder
      predictiveValue: "Medium" // Placeholder
    };
  };

  private transformArbitrageOpportunity = (opp: KalshiArbitrageOpportunity): ArbitrageOpportunityWithContracts => {
    // Create mock contract objects for the arbitrage opportunity
    const kalshiContract: Contract = {
      id: opp.market_ticker_1.hashCode(),
      title: opp.market_1_title,
      description: "",
      category: "General",
      platform: "kalshi",
      externalId: opp.market_ticker_1,
      currentPrice: opp.price_1.toString(),
      volume: (opp.volume_1 || 0).toString(),
      liquidity: "0",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const polymarketContract: Contract = {
      id: opp.market_ticker_2.hashCode(),
      title: opp.market_2_title,
      description: "",
      category: "General", 
      platform: opp.platform_2,
      externalId: opp.market_ticker_2,
      currentPrice: opp.price_2.toString(),
      volume: (opp.volume_2 || 0).toString(),
      liquidity: "0",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return {
      id: Math.random(),
      kalshiContractId: kalshiContract.id,
      polymarketContractId: polymarketContract.id,
      kalshiPrice: opp.price_1.toString(),
      polymarketPrice: opp.price_2.toString(),
      spread: opp.spread.toString(),
      confidence: opp.confidence,
      isActive: true,
      createdAt: new Date(),
      kalshiContract,
      polymarketContract
    };
  };
}

// Utility function for simple string hashing
String.prototype.hashCode = function() {
  let hash = 0;
  if (this.length === 0) return hash;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

declare global {
  interface String {
    hashCode(): number;
  }
}

// Default instance for the application
export const kalshiService = new KalshiService({
  baseUrl: process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'
}); 