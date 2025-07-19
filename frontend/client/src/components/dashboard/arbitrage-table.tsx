import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import type { ArbitrageOpportunityWithContracts } from "@shared/schema";

export default function ArbitrageTable() {
  const { data: opportunities, isLoading, error } = useQuery<ArbitrageOpportunityWithContracts[]>({
    queryKey: ["/api/arbitrage/opportunities"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/arbitrage/opportunities"] });
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "high":
        return <Badge className="bg-green-600/20 text-green-400 border-green-600">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600">Medium</Badge>;
      case "low":
        return <Badge className="bg-slate-600/20 text-slate-300 border-slate-600">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatPrice = (price: string | null) => {
    if (!price) return "$0.00";
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const formatSpread = (spread: string | null) => {
    if (!spread) return "0%";
    return `${parseFloat(spread).toFixed(1)}%`;
  };

  return (
    <Card className="trading-card">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base sm:text-lg font-semibold text-slate-50">
            Arbitrage Opportunities
          </CardTitle>
          <Button
            onClick={handleRefresh}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm self-start sm:self-auto"
          >
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-3 border-b border-slate-700 last:border-b-0">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-400 py-8 text-sm">
            Failed to load arbitrage opportunities
          </div>
        ) : opportunities && opportunities.length > 0 ? (
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <table className="w-full min-w-[600px] sm:min-w-0">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-3 sm:px-0 text-xs sm:text-sm font-medium text-slate-400">Contract</th>
                  <th className="text-left py-2 px-3 sm:px-0 text-xs sm:text-sm font-medium text-slate-400">Kalshi</th>
                  <th className="text-left py-2 px-3 sm:px-0 text-xs sm:text-sm font-medium text-slate-400">Polymarket</th>
                  <th className="text-left py-2 px-3 sm:px-0 text-xs sm:text-sm font-medium text-slate-400">Spread</th>
                  <th className="text-left py-2 px-3 sm:px-0 text-xs sm:text-sm font-medium text-slate-400">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {opportunities.map((opportunity) => (
                  <tr key={opportunity.id} className="hover:bg-slate-700/50">
                    <td className="py-3 px-3 sm:px-0 text-xs sm:text-sm">
                      <div className="font-medium text-slate-50 truncate max-w-[150px] sm:max-w-none">
                        {opportunity.kalshiContract.title}
                      </div>
                      <div className="text-slate-400 text-xs hidden sm:block">
                        {opportunity.kalshiContract.description}
                      </div>
                    </td>
                    <td className="py-3 px-3 sm:px-0 text-xs sm:text-sm">
                      <span className="text-green-400">
                        {formatPrice(opportunity.kalshiPrice)}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-0 text-xs sm:text-sm">
                      <span className="text-red-400">
                        {formatPrice(opportunity.polymarketPrice)}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-0 text-xs sm:text-sm">
                      <span className="text-yellow-400 font-medium">
                        {formatSpread(opportunity.spread)}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-0 text-xs sm:text-sm">
                      {getConfidenceBadge(opportunity.confidence)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-slate-400 py-8 text-sm">
            No arbitrage opportunities available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
