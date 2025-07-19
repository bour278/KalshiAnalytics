from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import os
from dotenv import load_dotenv
from loguru import logger

from kalshi_client import KalshiClient
from models import (
    MarketResponse, 
    OrderBookResponse, 
    AnalyticsResponse, 
    ArbitrageResponse,
    DashboardStatsResponse
)
from analytics import AnalyticsEngine

# Load environment variables
load_dotenv()

# Global client instance
kalshi_client = None
analytics_engine = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global kalshi_client, analytics_engine
    
    # Initialize Kalshi client
    kalshi_client = KalshiClient(
        base_url=os.getenv("KALSHI_BASE_URL"),
        api_key=os.getenv("KALSHI_API_KEY")
    )
    
    # Initialize analytics engine
    analytics_engine = AnalyticsEngine()
    
    # Try to authenticate with Kalshi (make it optional for development)
    try:
        await kalshi_client.authenticate()
        logger.info("Successfully authenticated with Kalshi API")
    except Exception as e:
        logger.warning(f"Failed to authenticate with Kalshi API: {e}")
        logger.info("Continuing without authentication for development")
    
    yield
    
    # Cleanup
    await kalshi_client.close()

app = FastAPI(
    title="Kalshi Analytics API",
    description="Python service for Kalshi market data and analytics",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_kalshi_client():
    if kalshi_client is None:
        raise HTTPException(status_code=500, detail="Kalshi client not initialized")
    return kalshi_client

def get_analytics_engine():
    if analytics_engine is None:
        raise HTTPException(status_code=500, detail="Analytics engine not initialized")
    return analytics_engine

@app.get("/")
async def root():
    return {"message": "Kalshi Analytics API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "kalshi-analytics"}

@app.get("/markets", response_model=MarketResponse)
async def get_markets(
    limit: int = 100,
    cursor: str = None,
    event_ticker: str = None,
    series_ticker: str = None,
    client: KalshiClient = Depends(get_kalshi_client)
):
    """Get markets from Kalshi API"""
    try:
        markets = await client.get_markets(
            limit=limit,
            cursor=cursor,
            event_ticker=event_ticker,
            series_ticker=series_ticker
        )
        return MarketResponse(markets=markets)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/markets/{market_ticker}/orderbook", response_model=OrderBookResponse)
async def get_market_orderbook(
    market_ticker: str,
    client: KalshiClient = Depends(get_kalshi_client)
):
    """Get order book for a specific market"""
    try:
        orderbook = await client.get_market_orderbook(market_ticker)
        return OrderBookResponse(orderbook=orderbook)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/markets/{market_ticker}/analytics", response_model=AnalyticsResponse)
async def get_market_analytics(
    market_ticker: str,
    client: KalshiClient = Depends(get_kalshi_client),
    analytics: AnalyticsEngine = Depends(get_analytics_engine)
):
    """Get analytics for a specific market"""
    try:
        # Get market data
        market = await client.get_market(market_ticker)
        orderbook = await client.get_market_orderbook(market_ticker)
        trades = await client.get_market_trades(market_ticker)
        
        # Calculate analytics
        analytics_data = await analytics.calculate_market_analytics(
            market, orderbook, trades
        )
        
        return AnalyticsResponse(analytics=analytics_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/arbitrage", response_model=ArbitrageResponse)
async def get_arbitrage_opportunities(
    client: KalshiClient = Depends(get_kalshi_client),
    analytics: AnalyticsEngine = Depends(get_analytics_engine)
):
    """Find arbitrage opportunities"""
    try:
        opportunities = await analytics.find_arbitrage_opportunities(client)
        return ArbitrageResponse(opportunities=opportunities)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    client: KalshiClient = Depends(get_kalshi_client),
    analytics: AnalyticsEngine = Depends(get_analytics_engine)
):
    """Get dashboard statistics"""
    try:
        stats = await analytics.get_dashboard_stats(client)
        return DashboardStatsResponse(stats=stats)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    ) 