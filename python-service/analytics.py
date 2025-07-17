import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from loguru import logger
import asyncio

from models import (
    KalshiMarket, KalshiOrderBook, KalshiTrade, KalshiCandlestick,
    MarketAnalytics, OrderBookAnalytics, LiquidityMetrics,
    ArbitrageOpportunity, DashboardStats, ConfidenceLevel,
    ChartDataPoint
)
from kalshi_client import KalshiClient

class AnalyticsEngine:
    def __init__(self):
        self.cache_ttl = 300  # 5 minutes cache TTL
        self.analytics_cache = {}
    
    async def calculate_market_analytics(self, market: KalshiMarket, 
                                       orderbook: KalshiOrderBook,
                                       trades: List[KalshiTrade]) -> MarketAnalytics:
        """Calculate comprehensive analytics for a market"""
        
        # Calculate order book analytics
        orderbook_analytics = self._calculate_orderbook_analytics(orderbook)
        
        # Calculate liquidity metrics
        liquidity_metrics = self._calculate_liquidity_metrics(orderbook, trades)
        
        # Calculate market metrics
        volatility = self._calculate_volatility(trades)
        momentum = self._calculate_momentum(trades)
        volume_trend = self._calculate_volume_trend(trades)
        price_efficiency = self._calculate_price_efficiency(trades)
        liquidity_score = self._calculate_liquidity_score(orderbook)
        risk_score = self._calculate_risk_score(market, orderbook, trades)
        
        return MarketAnalytics(
            market_ticker=market.ticker,
            volatility=volatility,
            momentum=momentum,
            volume_trend=volume_trend,
            price_efficiency=price_efficiency,
            liquidity_score=liquidity_score,
            risk_score=risk_score,
            orderbook_analytics=orderbook_analytics,
            liquidity_metrics=liquidity_metrics,
            recent_trades=trades[-50:],  # Last 50 trades
            price_history=[]  # This would be populated from candlestick data
        )
    
    def _calculate_orderbook_analytics(self, orderbook: KalshiOrderBook) -> OrderBookAnalytics:
        """Calculate order book analytics"""
        
        # Calculate mid price
        best_bid = max([bid.price for bid in orderbook.yes_bids], default=0)
        best_ask = min([ask.price for ask in orderbook.yes_asks], default=1)
        mid_price = (best_bid + best_ask) / 2 if best_bid > 0 and best_ask < 1 else 0.5
        
        # Calculate spread
        spread = best_ask - best_bid if best_bid > 0 and best_ask < 1 else 0
        spread_percentage = (spread / mid_price * 100) if mid_price > 0 else 0
        
        # Calculate volume-weighted prices for different sizes
        sweep_price_100 = self._calculate_sweep_price(orderbook.yes_asks, 100)
        sweep_price_1000 = self._calculate_sweep_price(orderbook.yes_asks, 1000)
        bid_price_100 = self._calculate_bid_price(orderbook.yes_bids, 100)
        ask_price_100 = self._calculate_ask_price(orderbook.yes_asks, 100)
        bid_price_1000 = self._calculate_bid_price(orderbook.yes_bids, 1000)
        ask_price_1000 = self._calculate_ask_price(orderbook.yes_asks, 1000)
        
        # Calculate total volumes
        total_bid_volume = sum([bid.size for bid in orderbook.yes_bids])
        total_ask_volume = sum([ask.size for ask in orderbook.yes_asks])
        
        # Detect price gaps
        gaps = self._detect_price_gaps(orderbook)
        
        return OrderBookAnalytics(
            market_ticker=orderbook.market_ticker,
            sweep_price_100=sweep_price_100,
            sweep_price_1000=sweep_price_1000,
            bid_price_100=bid_price_100,
            ask_price_100=ask_price_100,
            bid_price_1000=bid_price_1000,
            ask_price_1000=ask_price_1000,
            total_bid_volume=total_bid_volume,
            total_ask_volume=total_ask_volume,
            spread_percentage=spread_percentage,
            mid_price=mid_price,
            gaps=gaps
        )
    
    def _calculate_liquidity_metrics(self, orderbook: KalshiOrderBook, 
                                   trades: List[KalshiTrade]) -> LiquidityMetrics:
        """Calculate liquidity metrics"""
        
        # Calculate bid-ask spread
        best_bid = max([bid.price for bid in orderbook.yes_bids], default=0)
        best_ask = min([ask.price for ask in orderbook.yes_asks], default=1)
        bid_ask_spread = best_ask - best_bid if best_bid > 0 and best_ask < 1 else 0
        
        # Calculate average spread over recent trades
        recent_spreads = []
        for trade in trades[-20:]:  # Last 20 trades
            # Estimate spread based on trade price deviation
            spread_estimate = abs(trade.price - 0.5) * 2  # Simple estimate
            recent_spreads.append(spread_estimate)
        
        avg_spread = np.mean(recent_spreads) if recent_spreads else bid_ask_spread
        
        # Calculate market depth (total volume at best prices)
        best_bid_volume = sum([bid.size for bid in orderbook.yes_bids 
                              if abs(bid.price - best_bid) < 0.01])
        best_ask_volume = sum([ask.size for ask in orderbook.yes_asks 
                              if abs(ask.price - best_ask) < 0.01])
        market_depth = (best_bid_volume + best_ask_volume) / 2
        
        # Calculate volume-weighted spread
        total_volume = sum([trade.size for trade in trades[-50:]])
        if total_volume > 0:
            weighted_spreads = [trade.size * avg_spread for trade in trades[-50:]]
            volume_weighted_spread = sum(weighted_spreads) / total_volume
        else:
            volume_weighted_spread = avg_spread
        
        # Calculate price impact for different order sizes
        price_impact_100 = self._calculate_price_impact(orderbook, 100)
        price_impact_1000 = self._calculate_price_impact(orderbook, 1000)
        
        return LiquidityMetrics(
            avg_spread=avg_spread,
            market_depth=market_depth,
            bid_ask_spread=bid_ask_spread,
            volume_weighted_spread=volume_weighted_spread,
            price_impact_100=price_impact_100,
            price_impact_1000=price_impact_1000
        )
    
    def _calculate_volatility(self, trades: List[KalshiTrade]) -> float:
        """Calculate price volatility from recent trades"""
        if len(trades) < 2:
            return 0.0
        
        prices = [trade.price for trade in trades[-50:]]
        if len(prices) < 2:
            return 0.0
        
        returns = []
        for i in range(1, len(prices)):
            if prices[i-1] > 0:
                ret = (prices[i] - prices[i-1]) / prices[i-1]
                returns.append(ret)
        
        return float(np.std(returns)) if returns else 0.0
    
    def _calculate_momentum(self, trades: List[KalshiTrade]) -> float:
        """Calculate price momentum from recent trades"""
        if len(trades) < 2:
            return 0.0
        
        recent_trades = trades[-10:]
        older_trades = trades[-20:-10] if len(trades) >= 20 else []
        
        recent_avg = np.mean([trade.price for trade in recent_trades])
        older_avg = np.mean([trade.price for trade in older_trades]) if older_trades else recent_avg
        
        if older_avg > 0:
            momentum = (recent_avg - older_avg) / older_avg
        else:
            momentum = 0.0
        
        return float(momentum)
    
    def _calculate_volume_trend(self, trades: List[KalshiTrade]) -> float:
        """Calculate volume trend from recent trades"""
        if len(trades) < 2:
            return 0.0
        
        recent_trades = trades[-10:]
        older_trades = trades[-20:-10] if len(trades) >= 20 else []
        
        recent_volume = sum([trade.size for trade in recent_trades])
        older_volume = sum([trade.size for trade in older_trades]) if older_trades else recent_volume
        
        if older_volume > 0:
            volume_trend = (recent_volume - older_volume) / older_volume
        else:
            volume_trend = 0.0
        
        return float(volume_trend)
    
    def _calculate_price_efficiency(self, trades: List[KalshiTrade]) -> float:
        """Calculate price efficiency (how quickly prices adjust to new information)"""
        if len(trades) < 5:
            return 0.5  # Neutral efficiency
        
        # Calculate autocorrelation of price changes
        prices = [trade.price for trade in trades[-50:]]
        if len(prices) < 5:
            return 0.5
        
        price_changes = []
        for i in range(1, len(prices)):
            change = prices[i] - prices[i-1]
            price_changes.append(change)
        
        if len(price_changes) < 2:
            return 0.5
        
        # Calculate autocorrelation with lag 1
        autocorr = np.corrcoef(price_changes[:-1], price_changes[1:])[0, 1]
        
        # Convert to efficiency score (lower autocorrelation = higher efficiency)
        efficiency = 1 - abs(autocorr) if not np.isnan(autocorr) else 0.5
        
        return float(np.clip(efficiency, 0, 1))
    
    def _calculate_liquidity_score(self, orderbook: KalshiOrderBook) -> float:
        """Calculate overall liquidity score"""
        
        # Factors: spread, depth, volume distribution
        best_bid = max([bid.price for bid in orderbook.yes_bids], default=0)
        best_ask = min([ask.price for ask in orderbook.yes_asks], default=1)
        spread = best_ask - best_bid if best_bid > 0 and best_ask < 1 else 1
        
        # Smaller spread = higher liquidity
        spread_score = max(0, 1 - spread * 10)  # Normalize spread
        
        # Total volume = higher liquidity
        total_volume = sum([bid.size for bid in orderbook.yes_bids]) + \
                      sum([ask.size for ask in orderbook.yes_asks])
        volume_score = min(1, total_volume / 1000)  # Normalize volume
        
        # Number of price levels = higher liquidity
        num_levels = len(orderbook.yes_bids) + len(orderbook.yes_asks)
        levels_score = min(1, num_levels / 20)  # Normalize levels
        
        # Weighted combination
        liquidity_score = (spread_score * 0.4 + volume_score * 0.4 + levels_score * 0.2)
        
        return float(np.clip(liquidity_score, 0, 1))
    
    def _calculate_risk_score(self, market: KalshiMarket, orderbook: KalshiOrderBook, 
                            trades: List[KalshiTrade]) -> float:
        """Calculate overall risk score for the market"""
        
        # Factors: volatility, liquidity, time to expiry, volume
        volatility = self._calculate_volatility(trades)
        liquidity_score = self._calculate_liquidity_score(orderbook)
        
        # Time to expiry risk
        time_risk = 0.5  # Default neutral
        if market.expiry_date:
            days_to_expiry = (market.expiry_date - datetime.utcnow()).days
            time_risk = min(1, max(0, 1 - days_to_expiry / 30))  # Higher risk closer to expiry
        
        # Volume risk (low volume = higher risk)
        volume_risk = max(0, 1 - (market.volume or 0) / 10000)
        
        # Weighted combination
        risk_score = (volatility * 0.3 + (1 - liquidity_score) * 0.3 + 
                     time_risk * 0.2 + volume_risk * 0.2)
        
        return float(np.clip(risk_score, 0, 1))
    
    def _calculate_sweep_price(self, asks: List, target_size: int) -> float:
        """Calculate price to sweep target size from order book"""
        if not asks:
            return 1.0
        
        sorted_asks = sorted(asks, key=lambda x: x.price)
        total_size = 0
        total_cost = 0
        
        for ask in sorted_asks:
            if total_size >= target_size:
                break
            
            size_to_take = min(ask.size, target_size - total_size)
            total_cost += size_to_take * ask.price
            total_size += size_to_take
        
        return total_cost / total_size if total_size > 0 else 1.0
    
    def _calculate_bid_price(self, bids: List, target_size: int) -> float:
        """Calculate price to sell target size to order book"""
        if not bids:
            return 0.0
        
        sorted_bids = sorted(bids, key=lambda x: x.price, reverse=True)
        total_size = 0
        total_value = 0
        
        for bid in sorted_bids:
            if total_size >= target_size:
                break
            
            size_to_sell = min(bid.size, target_size - total_size)
            total_value += size_to_sell * bid.price
            total_size += size_to_sell
        
        return total_value / total_size if total_size > 0 else 0.0
    
    def _calculate_ask_price(self, asks: List, target_size: int) -> float:
        """Calculate average ask price for target size"""
        return self._calculate_sweep_price(asks, target_size)
    
    def _calculate_price_impact(self, orderbook: KalshiOrderBook, order_size: int) -> float:
        """Calculate price impact for a given order size"""
        
        # Get current mid price
        best_bid = max([bid.price for bid in orderbook.yes_bids], default=0)
        best_ask = min([ask.price for ask in orderbook.yes_asks], default=1)
        mid_price = (best_bid + best_ask) / 2 if best_bid > 0 and best_ask < 1 else 0.5
        
        # Calculate execution price for buy order
        execution_price = self._calculate_sweep_price(orderbook.yes_asks, order_size)
        
        # Price impact as percentage
        price_impact = abs(execution_price - mid_price) / mid_price if mid_price > 0 else 0
        
        return float(price_impact)
    
    def _detect_price_gaps(self, orderbook: KalshiOrderBook) -> List[Dict[str, Any]]:
        """Detect significant price gaps in the order book"""
        gaps = []
        
        # Combine and sort all price levels
        all_levels = []
        for bid in orderbook.yes_bids:
            all_levels.append(('bid', bid.price, bid.size))
        for ask in orderbook.yes_asks:
            all_levels.append(('ask', ask.price, ask.size))
        
        all_levels.sort(key=lambda x: x[1])  # Sort by price
        
        # Find gaps larger than 1 cent
        for i in range(1, len(all_levels)):
            price_diff = all_levels[i][1] - all_levels[i-1][1]
            if price_diff > 0.01:  # Gap larger than 1 cent
                gaps.append({
                    "range": f"${all_levels[i-1][1]:.2f} - ${all_levels[i][1]:.2f}",
                    "gap": f"{price_diff:.3f}"
                })
        
        return gaps
    
    async def find_arbitrage_opportunities(self, client: KalshiClient) -> List[ArbitrageOpportunity]:
        """Find arbitrage opportunities across markets"""
        opportunities = []
        
        try:
            # Get all active markets
            markets = await client.get_markets(limit=500)
            
            # Group markets by similar events/topics for comparison
            market_groups = self._group_similar_markets(markets)
            
            # Look for arbitrage within each group
            for group in market_groups:
                group_opportunities = await self._find_group_arbitrage(client, group)
                opportunities.extend(group_opportunities)
            
            # Sort by potential profit
            opportunities.sort(key=lambda x: x.potential_profit, reverse=True)
            
            return opportunities[:50]  # Return top 50 opportunities
            
        except Exception as e:
            logger.error(f"Error finding arbitrage opportunities: {e}")
            return []
    
    def _group_similar_markets(self, markets: List[KalshiMarket]) -> List[List[KalshiMarket]]:
        """Group markets by similar events or series"""
        groups = {}
        
        for market in markets:
            # Group by series ticker
            series_key = market.series_ticker
            if series_key not in groups:
                groups[series_key] = []
            groups[series_key].append(market)
        
        # Only return groups with multiple markets
        return [group for group in groups.values() if len(group) > 1]
    
    async def _find_group_arbitrage(self, client: KalshiClient, 
                                  group: List[KalshiMarket]) -> List[ArbitrageOpportunity]:
        """Find arbitrage opportunities within a group of related markets"""
        opportunities = []
        
        try:
            # Get order books for all markets in the group
            orderbooks = {}
            for market in group:
                try:
                    orderbook = await client.get_market_orderbook(market.ticker)
                    orderbooks[market.ticker] = orderbook
                except Exception as e:
                    logger.warning(f"Failed to get orderbook for {market.ticker}: {e}")
                    continue
            
            # Compare prices between markets
            for i, market1 in enumerate(group):
                for market2 in group[i+1:]:
                    if market1.ticker in orderbooks and market2.ticker in orderbooks:
                        opportunity = self._analyze_pair_arbitrage(
                            market1, market2, 
                            orderbooks[market1.ticker], 
                            orderbooks[market2.ticker]
                        )
                        if opportunity:
                            opportunities.append(opportunity)
            
            return opportunities
            
        except Exception as e:
            logger.error(f"Error finding group arbitrage: {e}")
            return []
    
    def _analyze_pair_arbitrage(self, market1: KalshiMarket, market2: KalshiMarket,
                              orderbook1: KalshiOrderBook, 
                              orderbook2: KalshiOrderBook) -> Optional[ArbitrageOpportunity]:
        """Analyze arbitrage opportunity between two markets"""
        
        # Get best prices
        best_bid1 = max([bid.price for bid in orderbook1.yes_bids], default=0)
        best_ask1 = min([ask.price for ask in orderbook1.yes_asks], default=1)
        best_bid2 = max([bid.price for bid in orderbook2.yes_bids], default=0)
        best_ask2 = min([ask.price for ask in orderbook2.yes_asks], default=1)
        
        # Check for arbitrage opportunities
        # Buy market1, sell market2
        if best_ask1 < best_bid2:
            spread = best_bid2 - best_ask1
            spread_percentage = (spread / best_ask1) * 100 if best_ask1 > 0 else 0
            
            if spread_percentage > 1:  # Only consider spreads > 1%
                confidence = self._assess_arbitrage_confidence(spread_percentage, market1, market2)
                potential_profit = spread * 1000  # Assume $1000 investment
                
                return ArbitrageOpportunity(
                    market_ticker_1=market1.ticker,
                    market_ticker_2=market2.ticker,
                    price_1=best_ask1,
                    price_2=best_bid2,
                    spread=spread,
                    spread_percentage=spread_percentage,
                    confidence=confidence,
                    potential_profit=potential_profit,
                    market_1_title=market1.title,
                    market_2_title=market2.title,
                    expiry_date=market1.expiry_date,
                    volume_1=market1.volume,
                    volume_2=market2.volume
                )
        
        # Buy market2, sell market1
        if best_ask2 < best_bid1:
            spread = best_bid1 - best_ask2
            spread_percentage = (spread / best_ask2) * 100 if best_ask2 > 0 else 0
            
            if spread_percentage > 1:  # Only consider spreads > 1%
                confidence = self._assess_arbitrage_confidence(spread_percentage, market2, market1)
                potential_profit = spread * 1000  # Assume $1000 investment
                
                return ArbitrageOpportunity(
                    market_ticker_1=market2.ticker,
                    market_ticker_2=market1.ticker,
                    price_1=best_ask2,
                    price_2=best_bid1,
                    spread=spread,
                    spread_percentage=spread_percentage,
                    confidence=confidence,
                    potential_profit=potential_profit,
                    market_1_title=market2.title,
                    market_2_title=market1.title,
                    expiry_date=market2.expiry_date,
                    volume_1=market2.volume,
                    volume_2=market1.volume
                )
        
        return None
    
    def _assess_arbitrage_confidence(self, spread_percentage: float, 
                                   market1: KalshiMarket, market2: KalshiMarket) -> ConfidenceLevel:
        """Assess confidence level for arbitrage opportunity"""
        
        # Factors: spread size, volume, time to expiry
        confidence_score = 0
        
        # Spread size (larger spread = higher confidence)
        if spread_percentage > 5:
            confidence_score += 3
        elif spread_percentage > 2:
            confidence_score += 2
        else:
            confidence_score += 1
        
        # Volume (higher volume = higher confidence)
        avg_volume = ((market1.volume or 0) + (market2.volume or 0)) / 2
        if avg_volume > 10000:
            confidence_score += 2
        elif avg_volume > 1000:
            confidence_score += 1
        
        # Time to expiry (more time = higher confidence)
        if market1.expiry_date:
            days_to_expiry = (market1.expiry_date - datetime.utcnow()).days
            if days_to_expiry > 7:
                confidence_score += 1
        
        # Convert score to confidence level
        if confidence_score >= 5:
            return ConfidenceLevel.HIGH
        elif confidence_score >= 3:
            return ConfidenceLevel.MEDIUM
        else:
            return ConfidenceLevel.LOW
    
    async def get_dashboard_stats(self, client: KalshiClient) -> DashboardStats:
        """Get comprehensive dashboard statistics"""
        
        try:
            # Get all markets
            markets = await client.get_markets(limit=1000)
            
            # Calculate basic stats
            active_markets = [m for m in markets if m.status.value == "open"]
            total_volume = sum([m.volume or 0 for m in markets])
            
            # Get arbitrage opportunities
            arbitrage_opportunities = await self.find_arbitrage_opportunities(client)
            
            # Calculate average liquidity (simplified)
            total_liquidity = 0
            liquidity_count = 0
            
            for market in active_markets[:50]:  # Sample first 50 for performance
                try:
                    orderbook = await client.get_market_orderbook(market.ticker)
                    liquidity_score = self._calculate_liquidity_score(orderbook)
                    total_liquidity += liquidity_score
                    liquidity_count += 1
                except:
                    continue
            
            avg_liquidity = (total_liquidity / liquidity_count) if liquidity_count > 0 else 0
            
            # Get top volume markets
            top_volume_markets = sorted(markets, key=lambda x: x.volume or 0, reverse=True)[:10]
            top_markets_data = [
                {
                    "ticker": market.ticker,
                    "title": market.title,
                    "volume": market.volume or 0,
                    "price": market.last_price or 0
                }
                for market in top_volume_markets
            ]
            
            # Get all events and series for counts
            events = await client.get_events(limit=1000)
            
            return DashboardStats(
                total_volume=f"${total_volume/1000000:.1f}M",
                active_contracts=len(active_markets),
                arbitrage_opportunities=len(arbitrage_opportunities),
                avg_liquidity=f"{avg_liquidity*100:.1f}%",
                total_markets=len(markets),
                total_events=len(events),
                avg_spread=0.02,  # Placeholder - would calculate from sample
                top_volume_markets=top_markets_data
            )
            
        except Exception as e:
            logger.error(f"Error calculating dashboard stats: {e}")
            # Return default stats on error
            return DashboardStats(
                total_volume="$0M",
                active_contracts=0,
                arbitrage_opportunities=0,
                avg_liquidity="0%",
                total_markets=0,
                total_events=0,
                avg_spread=0.0,
                top_volume_markets=[]
            ) 