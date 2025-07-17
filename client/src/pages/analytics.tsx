import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity, Calendar, Download } from "lucide-react";
import { ChartDataPoint, LiquidityMetrics, MarketOverview, OrderBookAnalytics } from "@/shared/schema";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

export default function Analytics() {
  const [selectedContract, setSelectedContract] = useState(1);
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h");

  const { data: chartData } = useQuery<ChartDataPoint[]>({
    queryKey: ["/api/contracts", selectedContract, "chart-data"],
    refetchInterval: 30000,
  });

  const { data: liquidityMetrics } = useQuery<LiquidityMetrics>({
    queryKey: ["/api/liquidity/metrics"],
    refetchInterval: 60000,
  });

  const { data: marketOverview } = useQuery<MarketOverview>({
    queryKey: ["/api/market/overview"],
    refetchInterval: 60000,
  });

  const { data: orderBookAnalytics } = useQuery<OrderBookAnalytics>({
    queryKey: ["/api/contracts", selectedContract, "order-book-analytics"],
    refetchInterval: 10000,
  });

  // Mock data for enhanced analytics
  const priceDistribution = [
    { range: "0.00-0.10", count: 12, percentage: 15 },
    { range: "0.10-0.30", count: 18, percentage: 22 },
    { range: "0.30-0.50", count: 25, percentage: 31 },
    { range: "0.50-0.70", count: 16, percentage: 20 },
    { range: "0.70-0.90", count: 8, percentage: 10 },
    { range: "0.90-1.00", count: 2, percentage: 2 },
  ];

  const volumeByCategory = [
    { category: "Politics", volume: 2400000, percentage: 45 },
    { category: "Economics", volume: 1500000, percentage: 28 },
    { category: "Sports", volume: 850000, percentage: 16 },
    { category: "Crypto", volume: 600000, percentage: 11 },
  ];

  const platformComparison = [
    { platform: "Kalshi", volume: 3200000, contracts: 45, avgSpread: 2.1 },
    { platform: "Polymarket", volume: 2150000, contracts: 38, avgSpread: 2.8 },
  ];

  const informationFlow = [
    { time: "00:00", newsImpact: 0.12, autoCorrelation: 0.85, predictiveValue: 0.67 },
    { time: "04:00", newsImpact: 0.08, autoCorrelation: 0.82, predictiveValue: 0.71 },
    { time: "08:00", newsImpact: 0.25, autoCorrelation: 0.75, predictiveValue: 0.78 },
    { time: "12:00", newsImpact: 0.32, autoCorrelation: 0.68, predictiveValue: 0.82 },
    { time: "16:00", newsImpact: 0.28, autoCorrelation: 0.72, predictiveValue: 0.76 },
    { time: "20:00", newsImpact: 0.15, autoCorrelation: 0.79, predictiveValue: 0.69 },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(0)}K`;
    return `$${volume}`;
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-50">
                    Advanced Analytics
                  </h1>
                  <p className="text-slate-400 mt-1">
                    Deep market analysis and probability modeling
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                    <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-slate-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="24h">24 Hours</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Analytics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="trading-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Avg Information Flow</p>
                        <p className="text-2xl font-bold text-blue-400">
                          {liquidityMetrics?.newsImpact || "N/A"}
                        </p>
                      </div>
                      <Activity className="h-8 w-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="trading-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Market Efficiency</p>
                        <p className="text-2xl font-bold text-green-400">87.3%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="trading-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Price Volatility</p>
                        <p className="text-2xl font-bold text-yellow-400">12.4%</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="trading-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Prediction Accuracy</p>
                        <p className="text-2xl font-bold text-purple-400">73.1%</p>
                      </div>
                      <PieChartIcon className="h-8 w-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analytics Tabs */}
              <Tabs defaultValue="probability" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-slate-800">
                  <TabsTrigger value="probability" className="text-slate-300">
                    Probability Modeling
                  </TabsTrigger>
                  <TabsTrigger value="distribution" className="text-slate-300">
                    Price Distribution
                  </TabsTrigger>
                  <TabsTrigger value="volume" className="text-slate-300">
                    Volume Analysis
                  </TabsTrigger>
                  <TabsTrigger value="information" className="text-slate-300">
                    Information Flow
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="probability" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="trading-card">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-50">
                          Price Movement Probability
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis 
                                dataKey="timestamp" 
                                stroke="#9CA3AF"
                                fontSize={12}
                                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                              />
                              <YAxis stroke="#9CA3AF" fontSize={12} />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#1F2937', 
                                  border: '1px solid #374151',
                                  borderRadius: '8px',
                                  color: '#F9FAFB'
                                }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="price" 
                                stroke="#3B82F6" 
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="trading-card">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-50">
                          Discontinuity Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {orderBookAnalytics?.gaps?.map((gap, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                              <div>
                                <div className="text-sm font-medium text-slate-50">{gap.range}</div>
                                <div className="text-xs text-slate-400">Price Range</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-red-400">{gap.gap}</div>
                                <div className="text-xs text-slate-400">Gap Size</div>
                              </div>
                            </div>
                          )) || (
                            <div className="text-center text-slate-400 py-8">
                              No discontinuities detected
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="distribution" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="trading-card">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-50">
                          Price Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={priceDistribution}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis dataKey="range" stroke="#9CA3AF" fontSize={12} />
                              <YAxis stroke="#9CA3AF" fontSize={12} />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#1F2937', 
                                  border: '1px solid #374151',
                                  borderRadius: '8px',
                                  color: '#F9FAFB'
                                }}
                              />
                              <Bar dataKey="count" fill="#3B82F6" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="trading-card">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-50">
                          Platform Comparison
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {platformComparison.map((platform, index) => (
                            <div key={index} className="border border-slate-700 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <Badge variant={platform.platform === "Kalshi" ? "default" : "secondary"}>
                                  {platform.platform}
                                </Badge>
                                <div className="text-sm text-slate-400">
                                  {platform.contracts} contracts
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-sm text-slate-400">Volume</div>
                                  <div className="text-lg font-bold text-slate-50">
                                    {formatVolume(platform.volume)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-slate-400">Avg Spread</div>
                                  <div className="text-lg font-bold text-slate-50">
                                    {platform.avgSpread}¢
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="volume" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="trading-card">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-50">
                          Volume by Category
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={volumeByCategory}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ category, percentage }) => `${category}: ${percentage}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="volume"
                              >
                                {volumeByCategory.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#1F2937', 
                                  border: '1px solid #374151',
                                  borderRadius: '8px',
                                  color: '#F9FAFB'
                                }}
                                formatter={(value) => formatVolume(value as number)}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="trading-card">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-50">
                          Trading Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {volumeByCategory.map((category, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-50">{category.category}</span>
                                <span className="text-sm text-slate-400">
                                  {formatVolume(category.volume)}
                                </span>
                              </div>
                              <div className="w-full bg-slate-700 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full"
                                  style={{ 
                                    width: `${category.percentage}%`,
                                    backgroundColor: COLORS[index % COLORS.length]
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="information" className="space-y-4">
                  <Card className="trading-card">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-slate-50">
                        Information Flow Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={informationFlow}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                            <YAxis stroke="#9CA3AF" fontSize={12} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1F2937', 
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#F9FAFB'
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="newsImpact" 
                              stroke="#3B82F6" 
                              strokeWidth={2}
                              name="News Impact"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="autoCorrelation" 
                              stroke="#10B981" 
                              strokeWidth={2}
                              name="Auto-correlation"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="predictiveValue" 
                              stroke="#F59E0B" 
                              strokeWidth={2}
                              name="Predictive Value"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="trading-card">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">
                            {liquidityMetrics?.newsImpact || "N/A"}
                          </div>
                          <div className="text-sm text-slate-400">News Impact</div>
                          <div className="text-xs text-slate-500 mt-1">
                            Current information flow from news sources
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="trading-card">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">
                            {liquidityMetrics?.autoCorrelation || "N/A"}
                          </div>
                          <div className="text-sm text-slate-400">Auto-correlation</div>
                          <div className="text-xs text-slate-500 mt-1">
                            Price movement correlation over time
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="trading-card">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-400">
                            {liquidityMetrics?.predictiveValue || "N/A"}
                          </div>
                          <div className="text-sm text-slate-400">Predictive Value</div>
                          <div className="text-xs text-slate-500 mt-1">
                            Useful prediction information quality
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}