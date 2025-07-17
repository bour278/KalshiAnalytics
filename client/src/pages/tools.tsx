import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Calculator, Settings, Bell, Download, Upload, RefreshCw, Target, TrendingUp } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

export default function Tools() {
  const [riskTolerance, setRiskTolerance] = useState([50]);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [contractPrice1, setContractPrice1] = useState("");
  const [contractPrice2, setContractPrice2] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [probabilityThreshold, setProbabilityThreshold] = useState([75]);

  const calculateArbitrage = () => {
    const price1 = parseFloat(contractPrice1);
    const price2 = parseFloat(contractPrice2);
    const stake = parseFloat(stakeAmount);
    
    if (isNaN(price1) || isNaN(price2) || isNaN(stake)) {
      return { spread: 0, profit: 0, roi: 0 };
    }
    
    const spread = Math.abs(price1 - price2);
    const profit = spread * stake;
    const roi = (profit / stake) * 100;
    
    return { spread, profit, roi };
  };

  const arbitrageResult = calculateArbitrage();

  const calculateSweepPrice = (orderBook: any[], targetShares: number) => {
    // Mock calculation for sweep price
    const basePrice = 0.52;
    const impact = (targetShares / 1000) * 0.02;
    return basePrice + impact;
  };

  const tools = [
    {
      icon: Calculator,
      title: "Arbitrage Calculator",
      description: "Calculate potential profit from price differences",
      category: "analysis"
    },
    {
      icon: Target,
      title: "Sweep Price Calculator",
      description: "Calculate sweep prices for large orders",
      category: "analysis"
    },
    {
      icon: TrendingUp,
      title: "Probability Estimator",
      description: "Estimate outcome probabilities from market data",
      category: "prediction"
    },
    {
      icon: Bell,
      title: "Price Alerts",
      description: "Set up custom price movement alerts",
      category: "monitoring"
    },
    {
      icon: Download,
      title: "Data Export",
      description: "Export market data and analytics",
      category: "data"
    },
    {
      icon: Upload,
      title: "Strategy Import",
      description: "Import and backtest trading strategies",
      category: "strategy"
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header />
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-50">
                    Trading Tools
                  </h1>
                  <p className="text-slate-400 mt-1">
                    Calculators, utilities, and analysis tools
                  </p>
                </div>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool, index) => (
                  <Card key={index} className="trading-card hover:bg-slate-700/50 transition-colors cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-2 bg-blue-600 rounded-lg">
                          <tool.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-50">{tool.title}</h3>
                          <Badge variant="outline" className="text-xs mt-1">
                            {tool.category}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400">{tool.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Featured Tools */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Arbitrage Calculator */}
                <Card className="trading-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-50">
                      <Calculator className="h-5 w-5" />
                      Arbitrage Calculator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price1" className="text-slate-400">Kalshi Price</Label>
                        <Input
                          id="price1"
                          type="number"
                          placeholder="0.52"
                          value={contractPrice1}
                          onChange={(e) => setContractPrice1(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-slate-50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="price2" className="text-slate-400">Polymarket Price</Label>
                        <Input
                          id="price2"
                          type="number"
                          placeholder="0.48"
                          value={contractPrice2}
                          onChange={(e) => setContractPrice2(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-slate-50"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="stake" className="text-slate-400">Stake Amount ($)</Label>
                      <Input
                        id="stake"
                        type="number"
                        placeholder="1000"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-slate-50"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4 p-4 bg-slate-700 rounded-lg">
                      <div className="text-center">
                        <div className="text-sm text-slate-400">Spread</div>
                        <div className="text-lg font-bold text-yellow-400">
                          {(arbitrageResult.spread * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-slate-400">Profit</div>
                        <div className="text-lg font-bold text-green-400">
                          ${arbitrageResult.profit.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-slate-400">ROI</div>
                        <div className="text-lg font-bold text-blue-400">
                          {arbitrageResult.roi.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sweep Price Calculator */}
                <Card className="trading-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-50">
                      <Target className="h-5 w-5" />
                      Sweep Price Calculator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-slate-400">Order Size (shares)</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-slate-600 text-slate-50"
                          onClick={() => {}}
                        >
                          100
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-slate-600 text-slate-50"
                          onClick={() => {}}
                        >
                          1,000
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-slate-600 text-slate-50"
                          onClick={() => {}}
                        >
                          10,000
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <span className="text-sm text-slate-400">100 shares</span>
                        <span className="font-bold text-green-400">
                          ${calculateSweepPrice([], 100).toFixed(3)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <span className="text-sm text-slate-400">1,000 shares</span>
                        <span className="font-bold text-yellow-400">
                          ${calculateSweepPrice([], 1000).toFixed(3)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <span className="text-sm text-slate-400">10,000 shares</span>
                        <span className="font-bold text-red-400">
                          ${calculateSweepPrice([], 10000).toFixed(3)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Settings and Preferences */}
              <Card className="trading-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-50">
                    <Settings className="h-5 w-5" />
                    Settings & Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-slate-400">Risk Tolerance</Label>
                        <div className="mt-2">
                          <Slider
                            value={riskTolerance}
                            onValueChange={setRiskTolerance}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>Conservative</span>
                            <span>{riskTolerance[0]}%</span>
                            <span>Aggressive</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-slate-400">Probability Threshold</Label>
                        <div className="mt-2">
                          <Slider
                            value={probabilityThreshold}
                            onValueChange={setProbabilityThreshold}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>0%</span>
                            <span>{probabilityThreshold[0]}%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-slate-50">Price Alerts</Label>
                          <p className="text-xs text-slate-400">Get notified of price movements</p>
                        </div>
                        <Switch
                          checked={alertsEnabled}
                          onCheckedChange={setAlertsEnabled}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-slate-50">Auto Refresh</Label>
                          <p className="text-xs text-slate-400">Automatically refresh market data</p>
                        </div>
                        <Switch
                          checked={autoRefresh}
                          onCheckedChange={setAutoRefresh}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Export */}
              <Card className="trading-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-50">
                    <Download className="h-5 w-5" />
                    Data Export
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Download className="h-4 w-4 mr-2" />
                      Export Price Data
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <Download className="h-4 w-4 mr-2" />
                      Export Arbitrage Data
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                      <Download className="h-4 w-4 mr-2" />
                      Export Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
}