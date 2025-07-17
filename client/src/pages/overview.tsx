import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Users, 
  Clock,
  Globe,
  BarChart3,
  PieChart as PieChartIcon,
  Target
} from "lucide-react";
import type { MarketOverview, DashboardStats, Contract } from "@shared/schema";

export default function Overview() {
  const { data: marketOverview } = useQuery<MarketOverview>({
    queryKey: ["/api/market/overview"],
  });

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: contracts } = useQuery<Contract[]>({
    queryKey: ["/api/contracts"],
  });

  const COLORS = ['#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981'];

  // Calculate additional market metrics
  const marketMetrics = contracts ? {
    totalContracts: contracts.length,
    activeContracts: contracts.filter(c => c.status === 'active').length,
    avgPrice: contracts.reduce((sum, c) => sum + parseFloat(c.currentPrice || '0'), 0) / contracts.length,
    totalVolume: contracts.reduce((sum, c) => sum + parseInt(c.volume || '0'), 0),
    highestVolume: Math.max(...contracts.map(c => parseInt(c.volume || '0'))),
    platformDistribution: contracts.reduce((acc, c) => {
      acc[c.platform] = (acc[c.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  } : null;

  const platformData = marketMetrics ? 
    Object.entries(marketMetrics.platformDistribution).map(([platform, count]) => ({
      name: platform,
      value: count
    })) : [];

  const volumeData = contracts?.slice(0, 10).map(contract => ({
    name: contract.title.length > 15 ? contract.title.substring(0, 15) + '...' : contract.title,
    volume: parseInt(contract.volume || '0'),
    price: parseFloat(contract.currentPrice || '0')
  })) || [];

  const timeSeriesData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    volume: Math.floor(Math.random() * 1000000) + 500000,
    trades: Math.floor(Math.random() * 500) + 100,
    price: 0.45 + Math.random() * 0.1
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Market Overview</h1>
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-muted-foreground">Live Market Data</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Total Volume</span>
            </div>
            <p className="text-2xl font-bold">{stats?.totalVolume || '$0'}</p>
            <p className="text-xs text-green-500">+12.5% vs yesterday</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Active Contracts</span>
            </div>
            <p className="text-2xl font-bold">{marketMetrics?.activeContracts || 0}</p>
            <p className="text-xs text-blue-500">+{marketMetrics?.totalContracts || 0} total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Avg Price</span>
            </div>
            <p className="text-2xl font-bold">${(marketMetrics?.avgPrice || 0).toFixed(2)}</p>
            <p className="text-xs text-purple-500">Market average</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Peak Volume</span>
            </div>
            <p className="text-2xl font-bold">${((marketMetrics?.highestVolume || 0) / 1000).toFixed(0)}k</p>
            <p className="text-xs text-orange-500">Single contract</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Sector Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={marketOverview?.sectorBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ sector, percentage }) => `${sector} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="percentage"
                >
                  {marketOverview?.sectorBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Platform Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}`, 'Contracts']} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketOverview?.topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">{performer.name}</p>
                  <p className="text-sm text-muted-foreground">Performance</p>
                </div>
                <div className="flex items-center gap-2">
                  {performer.change.startsWith('+') ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`font-bold ${performer.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {performer.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contract Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Contract Volume Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={volumeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value: number) => [`$${(value / 1000).toFixed(0)}k`, 'Volume']}
                labelFormatter={(label) => `Contract: ${label}`}
              />
              <Bar dataKey="volume" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 24-Hour Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            24-Hour Trading Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tickFormatter={(value) => `${value}:00`} />
              <YAxis yAxisId="left" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                labelFormatter={(value) => `${value}:00`}
                formatter={(value: number, name: string) => {
                  if (name === 'volume') return [`$${(value / 1000).toFixed(0)}k`, 'Volume'];
                  if (name === 'trades') return [`${value}`, 'Trades'];
                  return [`$${value.toFixed(2)}`, 'Avg Price'];
                }}
              />
              <Line yAxisId="left" type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="trades" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Market Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Market Liquidity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>High Liquidity</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Medium Liquidity</span>
                  <span>20%</span>
                </div>
                <Progress value={20} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Low Liquidity</span>
                  <span>5%</span>
                </div>
                <Progress value={5} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Price Volatility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Low Volatility</span>
                  <span>60%</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Medium Volatility</span>
                  <span>30%</span>
                </div>
                <Progress value={30} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>High Volatility</span>
                  <span>10%</span>
                </div>
                <Progress value={10} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trading Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Traders</span>
                <Badge variant="secondary">2,341</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Daily Trades</span>
                <Badge variant="secondary">8,752</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg Trade Size</span>
                <Badge variant="secondary">$127</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}