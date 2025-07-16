import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { LiquidityMetrics } from "@shared/schema";

export default function LiquidityMetrics() {
  const { data: metrics, isLoading, error } = useQuery<LiquidityMetrics>({
    queryKey: ["/api/liquidity/metrics"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getMetricBadge = (value: string) => {
    switch (value.toLowerCase()) {
      case "high":
        return <Badge className="bg-green-600/20 text-green-400 border-green-600">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600">Medium</Badge>;
      case "low":
        return <Badge className="bg-red-600/20 text-red-400 border-red-600">Low</Badge>;
      default:
        return <Badge variant="outline">{value}</Badge>;
    }
  };

  return (
    <Card className="trading-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg font-semibold text-slate-50">
          Liquidity Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-slate-700 rounded-lg p-3 sm:p-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 text-sm">
            Failed to load liquidity metrics
          </div>
        ) : metrics ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-slate-700 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-slate-400">Avg Spread</div>
                <div className="text-lg sm:text-xl font-bold text-slate-50">{metrics.avgSpread}</div>
                <div className="text-xs text-green-400">-0.3¢ from yesterday</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-slate-400">Market Depth</div>
                <div className="text-lg sm:text-xl font-bold text-slate-50">{metrics.marketDepth}</div>
                <div className="text-xs text-green-400">+12% from yesterday</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-slate-400 mb-2">Information Flow</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-slate-50 truncate flex-1 mr-2">News Impact</span>
                  {getMetricBadge(metrics.newsImpact)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-slate-50 truncate flex-1 mr-2">Auto-correlation</span>
                  {getMetricBadge(metrics.autoCorrelation)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-slate-50 truncate flex-1 mr-2">Predictive Value</span>
                  {getMetricBadge(metrics.predictiveValue)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400 text-sm">
            No metrics data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
