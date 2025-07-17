import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap,
  BarChart3,
  ArrowLeftRight,
  Info,
  AlertTriangle
} from "lucide-react";

interface ArbitrageResult {
  profit: number;
  profitPercent: number;
  totalInvestment: number;
  kalshiInvestment: number;
  polymarketInvestment: number;
  breakeven: number;
  riskLevel: string;
}

interface SweepResult {
  totalCost: number;
  averagePrice: number;
  priceImpact: number;
  liquidity: string;
  recommendation: string;
}

interface PositionResult {
  maxProfit: number;
  maxLoss: number;
  breakeven: number;
  returnOnInvestment: number;
  riskReward: number;
  recommendation: string;
}

export default function Calculators() {
  // Arbitrage Calculator State
  const [kalshiPrice, setKalshiPrice] = useState<string>("0.65");
  const [polymarketPrice, setPolymarketPrice] = useState<string>("0.58");
  const [investment, setInvestment] = useState<string>("1000");
  const [arbitrageResult, setArbitrageResult] = useState<ArbitrageResult | null>(null);

  // Sweep Price Calculator State
  const [sweepAmount, setSweepAmount] = useState<string>("10000");
  const [currentPrice, setCurrentPrice] = useState<string>("0.62");
  const [marketDepth, setMarketDepth] = useState<string>("high");
  const [sweepResult, setSweepResult] = useState<SweepResult | null>(null);

  // Position Size Calculator State
  const [entryPrice, setEntryPrice] = useState<string>("0.45");
  const [targetPrice, setTargetPrice] = useState<string>("0.75");
  const [positionSize, setPositionSize] = useState<string>("500");
  const [confidence, setConfidence] = useState<string>("70");
  const [positionResult, setPositionResult] = useState<PositionResult | null>(null);

  // Arbitrage Calculator Logic
  const calculateArbitrage = () => {
    const kalshi = parseFloat(kalshiPrice);
    const polymarket = parseFloat(polymarketPrice);
    const amount = parseFloat(investment);

    if (kalshi <= 0 || polymarket <= 0 || amount <= 0) return;

    const priceDiff = Math.abs(kalshi - polymarket);
    const profit = amount * priceDiff;
    const profitPercent = (priceDiff / Math.min(kalshi, polymarket)) * 100;
    const totalInvestment = amount;
    const kalshiInvestment = kalshi > polymarket ? amount * (polymarket / (kalshi + polymarket)) : amount * (kalshi / (kalshi + polymarket));
    const polymarketInvestment = totalInvestment - kalshiInvestment;
    const breakeven = Math.min(kalshi, polymarket);
    
    let riskLevel = "Low";
    if (profitPercent > 10) riskLevel = "High";
    else if (profitPercent > 5) riskLevel = "Medium";

    setArbitrageResult({
      profit,
      profitPercent,
      totalInvestment,
      kalshiInvestment,
      polymarketInvestment,
      breakeven,
      riskLevel
    });
  };

  // Sweep Price Calculator Logic
  const calculateSweepPrice = () => {
    const amount = parseFloat(sweepAmount);
    const price = parseFloat(currentPrice);

    if (amount <= 0 || price <= 0) return;

    const depthMultiplier = marketDepth === "high" ? 1.02 : marketDepth === "medium" ? 1.05 : 1.1;
    const averagePrice = price * depthMultiplier;
    const totalCost = amount * averagePrice;
    const priceImpact = ((averagePrice - price) / price) * 100;
    
    let liquidity = "Good";
    let recommendation = "Execute";
    
    if (priceImpact > 5) {
      liquidity = "Poor";
      recommendation = "Split order";
    } else if (priceImpact > 2) {
      liquidity = "Fair";
      recommendation = "Consider splitting";
    }

    setSweepResult({
      totalCost,
      averagePrice,
      priceImpact,
      liquidity,
      recommendation
    });
  };

  // Position Size Calculator Logic
  const calculatePositionSize = () => {
    const entry = parseFloat(entryPrice);
    const target = parseFloat(targetPrice);
    const size = parseFloat(positionSize);
    const conf = parseFloat(confidence);

    if (entry <= 0 || target <= 0 || size <= 0 || conf <= 0) return;

    const maxProfit = (target - entry) * size;
    const maxLoss = entry * size;
    const breakeven = entry;
    const returnOnInvestment = ((target - entry) / entry) * 100;
    const riskReward = maxProfit / maxLoss;
    
    let recommendation = "Hold";
    if (returnOnInvestment > 50 && conf > 70) recommendation = "Strong Buy";
    else if (returnOnInvestment > 25 && conf > 60) recommendation = "Buy";
    else if (returnOnInvestment < 10 || conf < 50) recommendation = "Avoid";

    setPositionResult({
      maxProfit,
      maxLoss,
      breakeven,
      returnOnInvestment,
      riskReward,
      recommendation
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Trading Calculators</h1>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-muted-foreground">Financial Tools</span>
        </div>
      </div>

      <Tabs defaultValue="arbitrage">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="arbitrage">Arbitrage Calculator</TabsTrigger>
          <TabsTrigger value="sweep">Sweep Price Calculator</TabsTrigger>
          <TabsTrigger value="position">Position Size Calculator</TabsTrigger>
        </TabsList>

        {/* Arbitrage Calculator */}
        <TabsContent value="arbitrage">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowLeftRight className="h-5 w-5" />
                  Arbitrage Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kalshi-price">Kalshi Price</Label>
                    <Input
                      id="kalshi-price"
                      type="number"
                      step="0.01"
                      value={kalshiPrice}
                      onChange={(e) => setKalshiPrice(e.target.value)}
                      placeholder="0.65"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="polymarket-price">Polymarket Price</Label>
                    <Input
                      id="polymarket-price"
                      type="number"
                      step="0.01"
                      value={polymarketPrice}
                      onChange={(e) => setPolymarketPrice(e.target.value)}
                      placeholder="0.58"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="investment">Investment Amount ($)</Label>
                  <Input
                    id="investment"
                    type="number"
                    value={investment}
                    onChange={(e) => setInvestment(e.target.value)}
                    placeholder="1000"
                  />
                </div>
                
                <Button onClick={calculateArbitrage} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Arbitrage
                </Button>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This calculator assumes you can execute trades simultaneously on both platforms
                    and does not account for trading fees or slippage.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Arbitrage Results</CardTitle>
              </CardHeader>
              <CardContent>
                {arbitrageResult ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                        <p className="text-sm text-muted-foreground">Potential Profit</p>
                        <p className="text-xl font-bold text-green-600">
                          ${arbitrageResult.profit.toFixed(2)}
                        </p>
                        <p className="text-sm text-green-600">
                          {arbitrageResult.profitPercent.toFixed(2)}% return
                        </p>
                      </div>
                      
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <p className="text-sm text-muted-foreground">Total Investment</p>
                        <p className="text-xl font-bold text-blue-600">
                          ${arbitrageResult.totalInvestment.toFixed(2)}
                        </p>
                        <Badge variant={arbitrageResult.riskLevel === "Low" ? "default" : "destructive"}>
                          {arbitrageResult.riskLevel} Risk
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Kalshi Investment:</span>
                        <span className="font-medium">${arbitrageResult.kalshiInvestment.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Polymarket Investment:</span>
                        <span className="font-medium">${arbitrageResult.polymarketInvestment.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Breakeven Price:</span>
                        <span className="font-medium">${arbitrageResult.breakeven.toFixed(3)}</span>
                      </div>
                    </div>
                    
                    {arbitrageResult.profitPercent > 5 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          High profit margins may indicate execution risk or market inefficiencies.
                          Verify prices and consider transaction costs.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Enter values and click calculate to see results
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sweep Price Calculator */}
        <TabsContent value="sweep">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Sweep Price Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sweep-amount">Order Amount ($)</Label>
                  <Input
                    id="sweep-amount"
                    type="number"
                    value={sweepAmount}
                    onChange={(e) => setSweepAmount(e.target.value)}
                    placeholder="10000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="current-price">Current Market Price</Label>
                  <Input
                    id="current-price"
                    type="number"
                    step="0.01"
                    value={currentPrice}
                    onChange={(e) => setCurrentPrice(e.target.value)}
                    placeholder="0.62"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="market-depth">Market Depth</Label>
                  <Select value={marketDepth} onValueChange={setMarketDepth}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High Liquidity</SelectItem>
                      <SelectItem value="medium">Medium Liquidity</SelectItem>
                      <SelectItem value="low">Low Liquidity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={calculateSweepPrice} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Sweep Price
                </Button>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Sweep pricing estimates the average price for large orders that move through
                    multiple price levels in the order book.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sweep Results</CardTitle>
              </CardHeader>
              <CardContent>
                {sweepResult ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <p className="text-sm text-muted-foreground">Total Cost</p>
                        <p className="text-xl font-bold text-blue-600">
                          ${sweepResult.totalCost.toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                        <p className="text-sm text-muted-foreground">Average Price</p>
                        <p className="text-xl font-bold text-purple-600">
                          ${sweepResult.averagePrice.toFixed(3)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Price Impact:</span>
                        <span className={`font-medium ${sweepResult.priceImpact > 5 ? 'text-red-500' : 'text-green-500'}`}>
                          {sweepResult.priceImpact.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Liquidity:</span>
                        <Badge variant={sweepResult.liquidity === "Good" ? "default" : "secondary"}>
                          {sweepResult.liquidity}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Recommendation:</span>
                        <span className="font-medium">{sweepResult.recommendation}</span>
                      </div>
                    </div>
                    
                    {sweepResult.priceImpact > 5 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          High price impact detected. Consider splitting your order into smaller pieces
                          or using limit orders to reduce market impact.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Enter values and click calculate to see results
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Position Size Calculator */}
        <TabsContent value="position">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Position Size Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entry-price">Entry Price</Label>
                    <Input
                      id="entry-price"
                      type="number"
                      step="0.01"
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(e.target.value)}
                      placeholder="0.45"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target-price">Target Price</Label>
                    <Input
                      id="target-price"
                      type="number"
                      step="0.01"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      placeholder="0.75"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="position-size">Position Size ($)</Label>
                  <Input
                    id="position-size"
                    type="number"
                    value={positionSize}
                    onChange={(e) => setPositionSize(e.target.value)}
                    placeholder="500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confidence">Confidence Level (%)</Label>
                  <Input
                    id="confidence"
                    type="number"
                    min="0"
                    max="100"
                    value={confidence}
                    onChange={(e) => setConfidence(e.target.value)}
                    placeholder="70"
                  />
                </div>
                
                <Button onClick={calculatePositionSize} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Position
                </Button>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Position sizing helps determine optimal investment amounts based on your
                    risk tolerance and confidence level.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Position Results</CardTitle>
              </CardHeader>
              <CardContent>
                {positionResult ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                        <p className="text-sm text-muted-foreground">Max Profit</p>
                        <p className="text-xl font-bold text-green-600">
                          ${positionResult.maxProfit.toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded">
                        <p className="text-sm text-muted-foreground">Max Loss</p>
                        <p className="text-xl font-bold text-red-600">
                          ${positionResult.maxLoss.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Return on Investment:</span>
                        <span className={`font-medium ${positionResult.returnOnInvestment > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {positionResult.returnOnInvestment.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Risk/Reward Ratio:</span>
                        <span className="font-medium">{positionResult.riskReward.toFixed(2)}:1</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Breakeven Price:</span>
                        <span className="font-medium">${positionResult.breakeven.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Recommendation:</span>
                        <Badge variant={
                          positionResult.recommendation === "Strong Buy" ? "default" :
                          positionResult.recommendation === "Buy" ? "secondary" :
                          "destructive"
                        }>
                          {positionResult.recommendation}
                        </Badge>
                      </div>
                    </div>
                    
                    {positionResult.riskReward < 2 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Low risk/reward ratio. Consider adjusting your target price or position size
                          to improve the risk/reward profile.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Enter values and click calculate to see results
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}