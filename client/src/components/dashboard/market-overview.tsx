import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { MarketOverview } from "@shared/schema";

export default function MarketOverview() {
  const { data: overview, isLoading, error } = useQuery<MarketOverview>({
    queryKey: ["/api/market/overview"],
    refetchInterval: 60000, // Refresh every minute
  });

  return (
    <Card className="trading-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg font-semibold text-slate-50">
          Market Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 text-sm">
            Failed to load market overview
          </div>
        ) : overview ? (
          <>
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-slate-400 mb-2 sm:mb-3">By Sector</h4>
              <div className="space-y-2 sm:space-y-3">
                {overview.sectorBreakdown.map((sector, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-slate-50 truncate flex-1 mr-2">{sector.sector}</span>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Progress 
                        value={sector.percentage} 
                        className="w-12 sm:w-16 h-2"
                        style={{
                          backgroundColor: '#475569'
                        }}
                      />
                      <span className="text-xs sm:text-sm text-slate-400 w-6 sm:w-8">
                        {sector.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-slate-400 mb-2 sm:mb-3">Top Performers</h4>
              <div className="space-y-2">
                {overview.topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-slate-50 truncate flex-1 mr-2">{performer.name}</span>
                    <span className={`text-xs sm:text-sm flex-shrink-0 ${
                      performer.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {performer.change}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-slate-400 text-sm">
            No market data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
