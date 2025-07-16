import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsOverview from "@/components/dashboard/stats-overview";
import PriceChart from "@/components/dashboard/price-chart";
import OrderBookChart from "@/components/dashboard/order-book-chart";
import ArbitrageTable from "@/components/dashboard/arbitrage-table";
import MarketOverview from "@/components/dashboard/market-overview";
import OrderBookAnalytics from "@/components/dashboard/order-book-analytics";
import LiquidityMetrics from "@/components/dashboard/liquidity-metrics";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header />
        <div className="p-6 space-y-6">
          <StatsOverview />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PriceChart />
            <OrderBookChart />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ArbitrageTable />
            </div>
            <MarketOverview />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OrderBookAnalytics />
            <LiquidityMetrics />
          </div>
        </div>
      </main>
    </div>
  );
}
