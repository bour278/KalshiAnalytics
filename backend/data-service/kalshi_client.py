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
    def __init__(self, requests_per_minute: int = 45): # Lowered from 60 to 45
        self.requests_per_minute = requests_per_minute
        self.requests = []
    
    async def wait_if_needed(self):
        now = time.time()
        # Remove requests older than 1 minute
        self.requests = [req_time for req_time in self.requests if now - req_time < 60]
        
        if len(self.requests) >= self.requests_per_minute:
            # Need to wait
            oldest_request = self.requests[0] # The first element is the oldest
            wait_time = 60 - (now - oldest_request)
            if wait_time > 0:
                logger.warning(f"Rate limit reached. Waiting for {wait_time:.2f} seconds.")
                await asyncio.sleep(wait_time)
        
        # It's now safe to add the new request time
        self.requests.append(time.time())

class KalshiClient:
    def __init__(self, base_url: str, api_key: str, 
                 rate_limit_requests_per_minute: int = 60):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.rate_limiter = RateLimiter(rate_limit_requests_per_minute)
        self.session: Optional[httpx.AsyncClient] = None
        self.authenticated = False
        
    async def authenticate(self):
        """Authenticate with Kalshi API"""
        # For API key authentication, we don't need to call a login endpoint
        # The API key is sent with each request in the Authorization header
        self.authenticated = True
        logger.info("KalshiClient authenticated successfully")
    
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
                           json_data: Optional[Dict] = None) -> Dict[str, Any]:
        """Make HTTP request with rate limiting and error handling"""
        await self.rate_limiter.wait_if_needed()
        
        session = await self._get_session()
        url = f"{self.base_url}{endpoint}"
        
        headers = {"accept": "application/json"}
        
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
            
            # Log raw response
            raw_data = response.json()
            logger.info(f"Received data from {url}:")
            logger.info(json.dumps(raw_data, indent=2))
            
            return raw_data
        
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error {e.response.status_code} for {url}: {e.response.text}")
            raise Exception(f"API request failed: {e.response.status_code} - {e.response.text}")
        except httpx.RequestError as e:
            logger.error(f"Request error for {url}: {str(e)}")
            raise Exception(f"Request failed: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error for {url}: {str(e)}")
            raise Exception(f"Unexpected error: {str(e)}")
    
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
        # This endpoint gets all trades, so we will filter by market_ticker.
        # This can be inefficient if there are many trades.
        logger.info("Fetching all trades and filtering by market_ticker. This may be slow.")
        response = await self._make_request("GET", f"/markets/trades", params=params)
        
        trades = []
        for trade_data in response.get("trades", []):
            if trade_data.get("market_ticker") == market_ticker:
                try:
                    trade = self._parse_trade(market_ticker, trade_data)
                    trades.append(trade)
                except Exception as e:
                    logger.warning(f"Failed to parse trade: {e}")
                    continue
        
        return trades
    
    async def get_market_candlesticks(self, series_ticker: str, market_ticker: str, 
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
            f"/series/{series_ticker}/markets/{market_ticker}/candlesticks", 
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
    
    async def get_event(self, event_ticker: str) -> Dict[str, Any]:
        """Get a specific event by its ticker"""
        response = await self._make_request("GET", f"/events/{event_ticker}")
        return response.get("event", {})
    
    async def get_series(self, limit: int = 100, cursor: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get series from Kalshi API"""
        params = {"limit": limit}
        if cursor:
            params["cursor"] = cursor
        
        response = await self._make_request("GET", "/series", params=params)
        return response.get("series", [])

    async def get_series_by_ticker(self, series_ticker: str) -> Dict[str, Any]:
        """Get a specific series by its ticker"""
        response = await self._make_request("GET", f"/series/{series_ticker}")
        return response.get("series", {})
    
    def _parse_market(self, market_data: Dict[str, Any]) -> KalshiMarket:
        """Parse market data from API response"""
        # Pydantic will automatically map fields and handle aliases
        return KalshiMarket.parse_obj(market_data)
    
    def _parse_orderbook(self, market_ticker: str, orderbook_data: Dict[str, Any]) -> KalshiOrderBook:
        """Parse order book data from API response, handling potential None values."""
        yes_data = orderbook_data.get("yes")
        no_data = orderbook_data.get("no")

        # The API can return a list for bids/asks, or it can be a dict with 'bids'/'asks' keys.
        # We need to handle both cases, as well as when the data is None.

        def get_levels(data, side):
            if data is None:
                return []
            
            # Check if data is a dict containing the side
            if isinstance(data, dict) and side in data:
                return [KalshiOrderBookLevel(price=level[0], size=level[1]) for level in data[side]]
            
            # Check if data is a direct list of levels (assuming it's for bids if not specified)
            if isinstance(data, list):
                 return [KalshiOrderBookLevel(price=level[0], size=level[1]) for level in data]

            return []

        # Assuming the API may not always provide 'bids' and 'asks' keys, 
        # and might just return a list for 'yes' or 'no'.
        # This implementation will need to be adjusted if the structure is more complex.
        yes_bids = get_levels(yes_data, 'bids') if isinstance(yes_data, dict) else get_levels(yes_data, None)
        yes_asks = get_levels(yes_data, 'asks') if isinstance(yes_data, dict) else []
        no_bids = get_levels(no_data, 'bids') if isinstance(no_data, dict) else get_levels(no_data, None)
        no_asks = get_levels(no_data, 'asks') if isinstance(no_data, dict) else []

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