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
import { useIsMobile } from "@/hooks/use-mobile";

export default function Dashboard() {
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-50">
      <Sidebar />
      <main className={`flex-1 overflow-auto ${isMobile ? 'ml-0' : ''}`}>
        <Header />
        <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
          <StatsOverview />
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            <PriceChart />
            <OrderBookChart />
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
            <div className="xl:col-span-2">
              <ArbitrageTable />
            </div>
            <MarketOverview />
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            <OrderBookAnalytics />
            <LiquidityMetrics />
          </div>
        </div>
      </main>
    </div>
  );
}
