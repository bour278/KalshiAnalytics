import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { OrderBookData } from "@shared/schema";

export default function OrderBookChart() {
  const [selectedContract, setSelectedContract] = useState("1");

  const { data: orderBookData, isLoading, error } = useQuery<OrderBookData[]>({
    queryKey: ["/api/contracts", selectedContract, "order-book"],
    queryFn: async () => {
      const response = await fetch(`/api/contracts/${selectedContract}/order-book`);
      if (!response.ok) {
        throw new Error("Failed to fetch order book data");
      }
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds for real-time feel
  });

  const formatOrderBookData = (data: OrderBookData[]) => {
    const priceMap = new Map<string, { price: string; bids: number; asks: number }>();
    
    data.forEach(order => {
      const price = parseFloat(order.price || '0').toFixed(2);
      const size = parseFloat(order.size || '0');
      
      if (!priceMap.has(price)) {
        priceMap.set(price, { price, bids: 0, asks: 0 });
      }
      
      const entry = priceMap.get(price)!;
      if (order.side === 'bid') {
        entry.bids += size;
      } else {
        entry.asks += size;
      }
    });
    
    return Array.from(priceMap.values())
      .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
      .map(entry => ({
        price: `$${entry.price}`,
        bids: entry.bids,
        asks: entry.asks
      }));
  };

  const contracts = [
    { value: "1", label: "2024 Election Winner" },
    { value: "2", label: "Fed Rate Dec 2024" },
    { value: "3", label: "GDP Growth Q4" },
  ];

  return (
    <Card className="trading-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-50">
            Order Book Depth
          </CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-400">Contract:</span>
            <Select value={selectedContract} onValueChange={setSelectedContract}>
              <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {contracts.map((contract) => (
                  <SelectItem 
                    key={contract.value} 
                    value={contract.value}
                    className="text-slate-300 focus:bg-slate-700"
                  >
                    {contract.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center text-red-400">
              Failed to load order book data
            </div>
          ) : orderBookData && orderBookData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formatOrderBookData(orderBookData)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis 
                  dataKey="price" 
                  stroke="#94A3B8"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#94A3B8"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#F8FAFC'
                  }}
                />
                <Bar 
                  dataKey="bids" 
                  fill="#10B981" 
                  fillOpacity={0.7}
                  name="Bids"
                />
                <Bar 
                  dataKey="asks" 
                  fill="#EF4444" 
                  fillOpacity={0.7}
                  name="Asks"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              No order book data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
