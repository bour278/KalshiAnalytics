from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from enum import Enum

class OrderSide(str, Enum):
    BID = "bid"
    ASK = "ask"

class MarketStatus(str, Enum):
    OPEN = "open"
    CLOSED = "closed"
    SETTLED = "settled"

class ConfidenceLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

# Kalshi API Models
class KalshiMarket(BaseModel):
    ticker: str
    title: str
    subtitle: Optional[str] = None
    event_ticker: str
    series_ticker: str
    status: MarketStatus
    yes_price: Optional[float] = None
    no_price: Optional[float] = None
    last_price: Optional[float] = None
    volume: Optional[int] = 0
    open_interest: Optional[int] = 0
    expiry_date: Optional[datetime] = None
    close_date: Optional[datetime] = None
    strike_price: Optional[float] = None
    category: Optional[str] = None
    can_close_early: Optional[bool] = False
    floor_price: Optional[float] = None
    cap_price: Optional[float] = None

class KalshiOrderBookLevel(BaseModel):
    price: float
    size: int

class KalshiOrderBook(BaseModel):
    market_ticker: str
    yes_bids: List[KalshiOrderBookLevel] = []
    yes_asks: List[KalshiOrderBookLevel] = []
    no_bids: List[KalshiOrderBookLevel] = []
    no_asks: List[KalshiOrderBookLevel] = []
    timestamp: datetime

class KalshiTrade(BaseModel):
    market_ticker: str
    trade_id: str
    price: float
    size: int
    side: OrderSide
    timestamp: datetime
    yes_no: str  # "yes" or "no"

class KalshiCandlestick(BaseModel):
    market_ticker: str
    open_price: float
    high_price: float
    low_price: float
    close_price: float
    volume: int
    timestamp: datetime

# Analytics Models
class LiquidityMetrics(BaseModel):
    avg_spread: float
    market_depth: float
    bid_ask_spread: float
    volume_weighted_spread: float
    price_impact_100: float
    price_impact_1000: float

class OrderBookAnalytics(BaseModel):
    market_ticker: str
    sweep_price_100: float
    sweep_price_1000: float
    bid_price_100: float
    ask_price_100: float
    bid_price_1000: float
    ask_price_1000: float
    total_bid_volume: int
    total_ask_volume: int
    spread_percentage: float
    mid_price: float
    gaps: List[Dict[str, Union[str, float]]] = []

class ArbitrageOpportunity(BaseModel):
    market_ticker_1: str
    market_ticker_2: str
    platform_1: str = "kalshi"
    platform_2: str = "kalshi"
    price_1: float
    price_2: float
    spread: float
    spread_percentage: float
    confidence: ConfidenceLevel
    potential_profit: float
    market_1_title: str
    market_2_title: str
    expiry_date: Optional[datetime] = None
    volume_1: Optional[int] = 0
    volume_2: Optional[int] = 0

class DashboardStats(BaseModel):
    total_volume: str
    active_contracts: int
    arbitrage_opportunities: int
    avg_liquidity: str
    total_markets: int
    total_events: int
    avg_spread: float
    top_volume_markets: List[Dict[str, Any]] = []

class MarketAnalytics(BaseModel):
    market_ticker: str
    volatility: float
    momentum: float
    volume_trend: float
    price_efficiency: float
    liquidity_score: float
    risk_score: float
    orderbook_analytics: OrderBookAnalytics
    liquidity_metrics: LiquidityMetrics
    recent_trades: List[KalshiTrade] = []
    price_history: List[KalshiCandlestick] = []

class ChartDataPoint(BaseModel):
    timestamp: datetime
    price: float
    volume: Optional[int] = 0
    open_price: Optional[float] = None
    high_price: Optional[float] = None
    low_price: Optional[float] = None
    close_price: Optional[float] = None

# Response Models
class MarketResponse(BaseModel):
    markets: List[KalshiMarket]
    cursor: Optional[str] = None
    count: int = 0

class OrderBookResponse(BaseModel):
    orderbook: KalshiOrderBook

class AnalyticsResponse(BaseModel):
    analytics: MarketAnalytics

class ArbitrageResponse(BaseModel):
    opportunities: List[ArbitrageOpportunity]
    count: int = 0

class DashboardStatsResponse(BaseModel):
    stats: DashboardStats

class ChartDataResponse(BaseModel):
    data: List[ChartDataPoint]
    market_ticker: str
    timeframe: str

# Request Models
class MarketRequest(BaseModel):
    limit: Optional[int] = 100
    cursor: Optional[str] = None
    event_ticker: Optional[str] = None
    series_ticker: Optional[str] = None
    status: Optional[MarketStatus] = None

class OrderBookRequest(BaseModel):
    market_ticker: str
    depth: Optional[int] = 100

class AnalyticsRequest(BaseModel):
    market_ticker: str
    timeframe: Optional[str] = "1d"
    include_orderbook: Optional[bool] = True
    include_trades: Optional[bool] = True

# Error Models
class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Configuration Models
class KalshiConfig(BaseModel):
    base_url: str
    email: str
    password: str
    rate_limit_requests_per_minute: int = 60
    timeout_seconds: int = 30
    retry_attempts: int = 3 