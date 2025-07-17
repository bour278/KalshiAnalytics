import httpx
import asyncio
import time
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from loguru import logger
import json

from models import (
    KalshiMarket, KalshiOrderBook, KalshiTrade, KalshiCandlestick,
    KalshiOrderBookLevel, MarketStatus, OrderSide
)

class RateLimiter:
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.requests = []
    
    async def wait_if_needed(self):
        now = time.time()
        # Remove requests older than 1 minute
        self.requests = [req_time for req_time in self.requests if now - req_time < 60]
        
        if len(self.requests) >= self.requests_per_minute:
            # Need to wait
            oldest_request = min(self.requests)
            wait_time = 60 - (now - oldest_request)
            if wait_time > 0:
                logger.info(f"Rate limit reached, waiting {wait_time:.2f} seconds")
                await asyncio.sleep(wait_time)
        
        self.requests.append(now)

class KalshiClient:
    def __init__(self, base_url: str, email: str, password: str, 
                 rate_limit_requests_per_minute: int = 60):
        self.base_url = base_url.rstrip('/')
        self.email = email
        self.password = password
        self.rate_limiter = RateLimiter(rate_limit_requests_per_minute)
        self.session: Optional[httpx.AsyncClient] = None
        self.auth_token: Optional[str] = None
        self.token_expires_at: Optional[datetime] = None
        
    async def _get_session(self) -> httpx.AsyncClient:
        if self.session is None:
            self.session = httpx.AsyncClient(
                timeout=30.0,
                headers={"User-Agent": "KalshiAnalytics/1.0"}
            )
        return self.session
    
    async def close(self):
        if self.session:
            await self.session.aclose()
            self.session = None
    
    async def _make_request(self, method: str, endpoint: str, 
                           params: Optional[Dict] = None, 
                           json_data: Optional[Dict] = None,
                           requires_auth: bool = True) -> Dict[str, Any]:
        """Make HTTP request with rate limiting and error handling"""
        await self.rate_limiter.wait_if_needed()
        
        if requires_auth and not await self._is_authenticated():
            await self.authenticate()
        
        session = await self._get_session()
        url = f"{self.base_url}{endpoint}"
        
        headers = {}
        if requires_auth and self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        
        try:
            logger.debug(f"Making {method} request to {url}")
            response = await session.request(
                method=method,
                url=url,
                params=params,
                json=json_data,
                headers=headers
            )
            response.raise_for_status()
            return response.json()
        
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error {e.response.status_code} for {url}: {e.response.text}")
            raise Exception(f"API request failed: {e.response.status_code} - {e.response.text}")
        except httpx.RequestError as e:
            logger.error(f"Request error for {url}: {str(e)}")
            raise Exception(f"Request failed: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error for {url}: {str(e)}")
            raise Exception(f"Unexpected error: {str(e)}")
    
    async def _is_authenticated(self) -> bool:
        """Check if we have a valid authentication token"""
        if not self.auth_token:
            return False
        
        if self.token_expires_at and datetime.utcnow() >= self.token_expires_at:
            return False
        
        return True
    
    async def authenticate(self):
        """Authenticate with Kalshi API"""
        logger.info("Authenticating with Kalshi API")
        
        login_data = {
            "email": self.email,
            "password": self.password
        }
        
        try:
            response = await self._make_request(
                "POST", 
                "/login", 
                json_data=login_data, 
                requires_auth=False
            )
            
            self.auth_token = response.get("token")
            if not self.auth_token:
                raise Exception("No auth token received from login")
            
            # Assume token expires in 1 hour (adjust based on Kalshi's actual expiry)
            self.token_expires_at = datetime.utcnow() + timedelta(hours=1)
            
            logger.info("Successfully authenticated with Kalshi API")
            
        except Exception as e:
            logger.error(f"Authentication failed: {str(e)}")
            raise Exception(f"Failed to authenticate: {str(e)}")
    
    async def get_markets(self, limit: int = 100, cursor: Optional[str] = None,
                         event_ticker: Optional[str] = None,
                         series_ticker: Optional[str] = None) -> List[KalshiMarket]:
        """Get markets from Kalshi API"""
        params = {"limit": limit}
        
        if cursor:
            params["cursor"] = cursor
        if event_ticker:
            params["event_ticker"] = event_ticker
        if series_ticker:
            params["series_ticker"] = series_ticker
        
        response = await self._make_request("GET", "/markets", params=params)
        
        markets = []
        for market_data in response.get("markets", []):
            try:
                market = self._parse_market(market_data)
                markets.append(market)
            except Exception as e:
                logger.warning(f"Failed to parse market {market_data.get('ticker', 'unknown')}: {e}")
                continue
        
        return markets
    
    async def get_market(self, market_ticker: str) -> KalshiMarket:
        """Get a specific market"""
        response = await self._make_request("GET", f"/markets/{market_ticker}")
        return self._parse_market(response.get("market", {}))
    
    async def get_market_orderbook(self, market_ticker: str) -> KalshiOrderBook:
        """Get order book for a market"""
        response = await self._make_request("GET", f"/markets/{market_ticker}/orderbook")
        return self._parse_orderbook(market_ticker, response.get("orderbook", {}))
    
    async def get_market_trades(self, market_ticker: str, limit: int = 100) -> List[KalshiTrade]:
        """Get recent trades for a market"""
        params = {"limit": limit}
        response = await self._make_request("GET", f"/markets/{market_ticker}/trades", params=params)
        
        trades = []
        for trade_data in response.get("trades", []):
            try:
                trade = self._parse_trade(market_ticker, trade_data)
                trades.append(trade)
            except Exception as e:
                logger.warning(f"Failed to parse trade: {e}")
                continue
        
        return trades
    
    async def get_market_candlesticks(self, market_ticker: str, 
                                    start_ts: Optional[int] = None,
                                    end_ts: Optional[int] = None,
                                    period_interval: int = 1,
                                    period_unit: str = "h") -> List[KalshiCandlestick]:
        """Get candlestick data for a market"""
        params = {
            "period_interval": period_interval,
            "period_unit": period_unit
        }
        
        if start_ts:
            params["start_ts"] = start_ts
        if end_ts:
            params["end_ts"] = end_ts
        
        response = await self._make_request(
            "GET", 
            f"/markets/{market_ticker}/candlesticks", 
            params=params
        )
        
        candlesticks = []
        for candle_data in response.get("candlesticks", []):
            try:
                candlestick = self._parse_candlestick(market_ticker, candle_data)
                candlesticks.append(candlestick)
            except Exception as e:
                logger.warning(f"Failed to parse candlestick: {e}")
                continue
        
        return candlesticks
    
    async def get_events(self, limit: int = 100, cursor: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get events from Kalshi API"""
        params = {"limit": limit}
        if cursor:
            params["cursor"] = cursor
        
        response = await self._make_request("GET", "/events", params=params)
        return response.get("events", [])
    
    async def get_series(self, limit: int = 100, cursor: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get series from Kalshi API"""
        params = {"limit": limit}
        if cursor:
            params["cursor"] = cursor
        
        response = await self._make_request("GET", "/series", params=params)
        return response.get("series", [])
    
    def _parse_market(self, market_data: Dict[str, Any]) -> KalshiMarket:
        """Parse market data from API response"""
        return KalshiMarket(
            ticker=market_data["ticker"],
            title=market_data.get("title", ""),
            subtitle=market_data.get("subtitle"),
            event_ticker=market_data.get("event_ticker", ""),
            series_ticker=market_data.get("series_ticker", ""),
            status=MarketStatus(market_data.get("status", "open")),
            yes_price=market_data.get("yes_price"),
            no_price=market_data.get("no_price"),
            last_price=market_data.get("last_price"),
            volume=market_data.get("volume", 0),
            open_interest=market_data.get("open_interest", 0),
            expiry_date=self._parse_datetime(market_data.get("expiry_date")),
            close_date=self._parse_datetime(market_data.get("close_date")),
            strike_price=market_data.get("strike_price"),
            category=market_data.get("category"),
            can_close_early=market_data.get("can_close_early", False),
            floor_price=market_data.get("floor_price"),
            cap_price=market_data.get("cap_price")
        )
    
    def _parse_orderbook(self, market_ticker: str, orderbook_data: Dict[str, Any]) -> KalshiOrderBook:
        """Parse order book data from API response"""
        yes_bids = [
            KalshiOrderBookLevel(price=level[0], size=level[1])
            for level in orderbook_data.get("yes", {}).get("bids", [])
        ]
        yes_asks = [
            KalshiOrderBookLevel(price=level[0], size=level[1])
            for level in orderbook_data.get("yes", {}).get("asks", [])
        ]
        no_bids = [
            KalshiOrderBookLevel(price=level[0], size=level[1])
            for level in orderbook_data.get("no", {}).get("bids", [])
        ]
        no_asks = [
            KalshiOrderBookLevel(price=level[0], size=level[1])
            for level in orderbook_data.get("no", {}).get("asks", [])
        ]
        
        return KalshiOrderBook(
            market_ticker=market_ticker,
            yes_bids=yes_bids,
            yes_asks=yes_asks,
            no_bids=no_bids,
            no_asks=no_asks,
            timestamp=datetime.utcnow()
        )
    
    def _parse_trade(self, market_ticker: str, trade_data: Dict[str, Any]) -> KalshiTrade:
        """Parse trade data from API response"""
        return KalshiTrade(
            market_ticker=market_ticker,
            trade_id=trade_data.get("trade_id", ""),
            price=trade_data.get("price", 0.0),
            size=trade_data.get("size", 0),
            side=OrderSide(trade_data.get("side", "bid")),
            timestamp=self._parse_datetime(trade_data.get("timestamp")) or datetime.utcnow(),
            yes_no=trade_data.get("yes_no", "yes")
        )
    
    def _parse_candlestick(self, market_ticker: str, candle_data: Dict[str, Any]) -> KalshiCandlestick:
        """Parse candlestick data from API response"""
        return KalshiCandlestick(
            market_ticker=market_ticker,
            open_price=candle_data.get("open", 0.0),
            high_price=candle_data.get("high", 0.0),
            low_price=candle_data.get("low", 0.0),
            close_price=candle_data.get("close", 0.0),
            volume=candle_data.get("volume", 0),
            timestamp=self._parse_datetime(candle_data.get("timestamp")) or datetime.utcnow()
        )
    
    def _parse_datetime(self, date_str: Optional[str]) -> Optional[datetime]:
        """Parse datetime string from API response"""
        if not date_str:
            return None
        
        try:
            # Try different datetime formats
            for fmt in [
                "%Y-%m-%dT%H:%M:%S.%fZ",
                "%Y-%m-%dT%H:%M:%SZ",
                "%Y-%m-%dT%H:%M:%S",
                "%Y-%m-%d %H:%M:%S"
            ]:
                try:
                    return datetime.strptime(date_str, fmt)
                except ValueError:
                    continue
            
            # If no format works, try parsing as timestamp
            if isinstance(date_str, (int, float)):
                return datetime.fromtimestamp(date_str)
            
            logger.warning(f"Could not parse datetime: {date_str}")
            return None
            
        except Exception as e:
            logger.warning(f"Error parsing datetime {date_str}: {e}")
            return None 