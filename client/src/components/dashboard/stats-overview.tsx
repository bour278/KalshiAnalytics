import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, FileText, Scale, Droplets } from "lucide-react";
import type { DashboardStats } from "@shared/schema";

export default function StatsOverview() {
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="trading-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="trading-card">
          <CardContent className="p-6">
            <div className="text-center text-red-400">
              Failed to load dashboard stats
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statsData = [
    {
      title: "Total Volume",
      value: stats?.totalVolume || "$0",
      change: "+12.5% from yesterday",
      changeType: "positive" as const,
      icon: DollarSign,
      bgColor: "bg-blue-600/20",
      iconColor: "text-blue-400"
    },
    {
      title: "Active Contracts",
      value: stats?.activeContracts.toString() || "0",
      change: "+23 new today",
      changeType: "positive" as const,
      icon: FileText,
      bgColor: "bg-green-600/20",
      iconColor: "text-green-400"
    },
    {
      title: "Arbitrage Opportunities",
      value: stats?.arbitrageOpportunities.toString() || "0",
      change: "6 high confidence",
      changeType: "warning" as const,
      icon: Scale,
      bgColor: "bg-yellow-600/20",
      iconColor: "text-yellow-400"
    },
    {
      title: "Avg Liquidity",
      value: stats?.avgLiquidity || "0%",
      change: "-2.1% from yesterday",
      changeType: "negative" as const,
      icon: Droplets,
      bgColor: "bg-red-600/20",
      iconColor: "text-red-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="trading-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-50">{stat.value}</p>
                  <p className={`text-sm ${
                    stat.changeType === 'positive' ? 'text-green-400' :
                    stat.changeType === 'negative' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.bgColor} rounded-full p-3`}>
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
