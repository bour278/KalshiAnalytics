import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown, Activity, Clock, DollarSign, BarChart3 } from "lucide-react";
import type { ChartDataPoint, Contract } from "@shared/schema";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Charts() {
  const isMobile = useIsMobile();
  const [selectedContract, setSelectedContract] = useState<number>(1);
  const [timeframe, setTimeframe] = useState<string>("1h");
  const [chartType, setChartType] = useState<string>("price");

  const { data: contracts } = useQuery<Contract[]>({
    queryKey: ["/api/contracts"],
  });

  const { data: chartData } = useQuery<ChartDataPoint[]>({
    queryKey: ["/api/contracts", selectedContract, "chart-data"],
    queryFn: () => fetch(`/api/contracts/${selectedContract}/chart-data?timeframe=${timeframe}`).then(res => res.json()),
  });

  const { data: priceHistory } = useQuery({
    queryKey: ["/api/contracts", selectedContract, "price-history"],
    queryFn: () => fetch(`/api/contracts/${selectedContract}/price-history?limit=50`).then(res => res.json()),
  });

  const currentContract = contracts?.find(c => c.id === selectedContract);

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatVolume = (volume: number) => `$${(volume / 1000).toFixed(0)}k`;

  // Calculate statistics safely
  const stats = (chartData && chartData.length > 0) ? {
    current: chartData[chartData.length - 1]?.price || 0,
    change: chartData.length > 1 ? chartData[chartData.length - 1].price - chartData[0].price : 0,
    high: Math.max(...chartData.map(d => d.price)),
    low: Math.min(...chartData.map(d => d.price)),
    volume: chartData.reduce((sum, d) => sum + (d.volume || 0), 0),
    avgPrice: chartData.reduce((sum, d) => sum + d.price, 0) / chartData.length,
  } : null;

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-50">
      <Sidebar />
      <main className={`flex-1 overflow-auto ${isMobile ? 'ml-0' : ''}`}>
        <Header />
        <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Price Charts</h1>
        <div className="flex items-center gap-4">
          <Select value={selectedContract.toString()} onValueChange={(value) => setSelectedContract(parseInt(value))}>
            <SelectTrigger className="w-[300px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {contracts?.map((contract) => (
                <SelectItem key={contract.id} value={contract.id.toString()}>
                  {contract.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 Hour</SelectItem>
              <SelectItem value="4h">4 Hours</SelectItem>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {currentContract && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{currentContract.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{currentContract.category}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={currentContract.platform === "Kalshi" ? "default" : "secondary"}>
                  {currentContract.platform}
                </Badge>
                <Badge variant="outline">{currentContract.status}</Badge>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Current</span>
              </div>
              <p className="text-2xl font-bold">{formatPrice(stats.current)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                {stats.change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm text-muted-foreground">Change</span>
              </div>
              <p className={`text-2xl font-bold ${stats.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats.change >= 0 ? '+' : ''}{formatPrice(stats.change)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">High</span>
              </div>
              <p className="text-2xl font-bold">{formatPrice(stats.high)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-sm text-muted-foreground">Low</span>
              </div>
              <p className="text-2xl font-bold">{formatPrice(stats.low)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-muted-foreground">Volume</span>
              </div>
              <p className="text-2xl font-bold">{formatVolume(stats.volume)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-muted-foreground">Avg Price</span>
              </div>
              <p className="text-2xl font-bold">{formatPrice(stats.avgPrice)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={chartType} onValueChange={setChartType}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="price">Price Chart</TabsTrigger>
          <TabsTrigger value="volume">Volume Chart</TabsTrigger>
          <TabsTrigger value="combined">Combined View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="price">
          <Card>
            <CardHeader>
              <CardTitle>Price Movement</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis tickFormatter={formatPrice} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number) => [formatPrice(value), 'Price']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="volume">
          <Card>
            <CardHeader>
              <CardTitle>Trading Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis tickFormatter={formatVolume} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number) => [formatVolume(value), 'Volume']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="combined">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Price Movement</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <YAxis tickFormatter={formatPrice} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                      formatter={(value: number) => [formatPrice(value), 'Price']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Trading Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <YAxis tickFormatter={formatVolume} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                      formatter={(value: number) => [formatVolume(value), 'Volume']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="volume" 
                      stroke="#8b5cf6" 
                      fill="#8b5cf6"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Price History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {priceHistory?.slice(0, 10).map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 rounded border">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{new Date(entry.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">{formatPrice(parseFloat(entry.price))}</span>
                  <span className="text-sm text-muted-foreground">{formatVolume(parseFloat(entry.volume || '0'))}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
        </div>
      </main>
    </div>
  );
}