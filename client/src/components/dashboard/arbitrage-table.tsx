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
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-50">
            Arbitrage Opportunities
          </CardTitle>
          <Button
            onClick={handleRefresh}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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
          <div className="text-center text-red-400 py-8">
            Failed to load arbitrage opportunities
          </div>
        ) : opportunities && opportunities.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-sm font-medium text-slate-400">Contract</th>
                  <th className="text-left py-2 text-sm font-medium text-slate-400">Kalshi</th>
                  <th className="text-left py-2 text-sm font-medium text-slate-400">Polymarket</th>
                  <th className="text-left py-2 text-sm font-medium text-slate-400">Spread</th>
                  <th className="text-left py-2 text-sm font-medium text-slate-400">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {opportunities.map((opportunity) => (
                  <tr key={opportunity.id} className="hover:bg-slate-700/50">
                    <td className="py-3 text-sm">
                      <div className="font-medium text-slate-50">
                        {opportunity.kalshiContract.title}
                      </div>
                      <div className="text-slate-400 text-xs">
                        {opportunity.kalshiContract.description}
                      </div>
                    </td>
                    <td className="py-3 text-sm">
                      <span className="text-green-400">
                        {formatPrice(opportunity.kalshiPrice)}
                      </span>
                    </td>
                    <td className="py-3 text-sm">
                      <span className="text-red-400">
                        {formatPrice(opportunity.polymarketPrice)}
                      </span>
                    </td>
                    <td className="py-3 text-sm">
                      <span className="text-yellow-400 font-medium">
                        {formatSpread(opportunity.spread)}
                      </span>
                    </td>
                    <td className="py-3 text-sm">
                      {getConfidenceBadge(opportunity.confidence)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-slate-400 py-8">
            No arbitrage opportunities available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
