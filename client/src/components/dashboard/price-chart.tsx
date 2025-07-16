import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import type { ChartDataPoint } from "@shared/schema";

export default function PriceChart() {
  const [timeframe, setTimeframe] = useState("1D");
  const [selectedContract] = useState(1); // Default to first contract

  const { data: chartData, isLoading, error } = useQuery<ChartDataPoint[]>({
    queryKey: ["/api/contracts", selectedContract, "chart-data"],
    queryFn: async () => {
      const response = await fetch(`/api/contracts/${selectedContract}/chart-data?timeframe=${timeframe}`);
      if (!response.ok) {
        throw new Error("Failed to fetch chart data");
      }
      return response.json();
    },
    refetchInterval: 30000,
  });

  const timeframes = [
    { label: "1D", value: "1D" },
    { label: "1W", value: "1W" },
    { label: "1M", value: "1M" },
  ];

  const formatData = (data: ChartDataPoint[]) => {
    return data.map(point => ({
      time: new Date(point.timestamp).toLocaleTimeString("en-US", { 
        hour: "2-digit", 
        minute: "2-digit" 
      }),
      vwap: point.price,
      twap: point.price * 0.98, // Mock TWAP slightly lower
      volume: point.volume || 0
    }));
  };

  return (
    <Card className="trading-card">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base sm:text-lg font-semibold text-slate-50">
            Price Movement (VWAP)
          </CardTitle>
          <div className="flex items-center space-x-1 sm:space-x-2">
            {timeframes.map((tf) => (
              <Button
                key={tf.value}
                variant={timeframe === tf.value ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe(tf.value)}
                className={`text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 ${
                  timeframe === tf.value ? 
                    "bg-blue-600/20 text-blue-400 border-blue-600" : 
                    "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600"
                }`}
              >
                {tf.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="h-48 sm:h-56 md:h-64">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center text-red-400 text-sm">
              Failed to load price data
            </div>
          ) : chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formatData(chartData)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis 
                  dataKey="time" 
                  stroke="#94A3B8"
                  fontSize={10}
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  stroke="#94A3B8"
                  fontSize={10}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '12px'
                  }}
                  formatter={(value: number, name: string) => [
                    `$${value.toFixed(2)}`, 
                    name === 'vwap' ? 'VWAP' : 'TWAP'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="vwap"
                  stroke="#0EA5E9"
                  fill="#0EA5E9"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  name="vwap"
                />
                <Area
                  type="monotone"
                  dataKey="twap"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  name="twap"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              No price data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
