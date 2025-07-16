import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrderBookAnalytics } from "@shared/schema";

export default function OrderBookAnalytics() {
  const [selectedContract] = useState(1); // Default to first contract

  const { data: analytics, isLoading, error } = useQuery<OrderBookAnalytics>({
    queryKey: ["/api/contracts", selectedContract, "order-book-analytics"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  return (
    <Card className="trading-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-50">
          Order Book Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-slate-700 rounded-lg p-4">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-red-400">
            Failed to load order book analytics
          </div>
        ) : analytics ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="text-sm text-slate-400">Sweep Price (100 shares)</div>
                <div className="text-xl font-bold text-green-400">{analytics.sweepPrice100}</div>
                <div className="text-xs text-slate-400">
                  Bid: {analytics.bidPrice100} | Ask: {analytics.askPrice100}
                </div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="text-sm text-slate-400">Sweep Price (1000 shares)</div>
                <div className="text-xl font-bold text-red-400">{analytics.sweepPrice1000}</div>
                <div className="text-xs text-slate-400">
                  Bid: {analytics.bidPrice1000} | Ask: {analytics.askPrice1000}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-2">Discontinuity Analysis</h4>
              <div className="space-y-2">
                {analytics.gaps.map((gap, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-slate-50">{gap.range}</span>
                    <span className={`text-sm ${
                      gap.gap.includes('3') ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      Gap: {gap.gap}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400">
            No analytics data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
