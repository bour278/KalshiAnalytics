import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  BookOpen, 
  TrendingUp, 
  Gauge, 
  Globe, 
  Search, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Trading",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Arbitrage", href: "/arbitrage", icon: ArrowLeftRight },
      { name: "Order Books", href: "/order-books", icon: BookOpen },
    ]
  },
  {
    name: "Analytics",
    items: [
      { name: "Price Charts", href: "/charts", icon: TrendingUp },
      { name: "Metrics", href: "/metrics", icon: Gauge },
      { name: "Market Overview", href: "/overview", icon: Globe },
    ]
  },
  {
    name: "Tools",
    items: [
      { name: "Contract Matching", href: "/matching", icon: Search },
      { name: "Settings", href: "/settings", icon: Settings },
    ]
  }
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <nav className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-blue-400 flex items-center">
          <TrendingUp className="mr-2 h-5 w-5" />
          Kalshi Analytics
        </h1>
      </div>
      
      <div className="flex-1 p-4 space-y-6">
        {navigation.map((section) => (
          <div key={section.name}>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              {section.name}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-600/20 text-blue-400"
                        : "text-slate-300 hover:bg-slate-700 hover:text-slate-200"
                    )}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
