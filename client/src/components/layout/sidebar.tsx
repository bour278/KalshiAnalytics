import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  BookOpen, 
  TrendingUp, 
  Gauge, 
  Globe, 
  Search, 
  Settings,
  Menu,
  X 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const navigation = [
  {
    name: "Trading",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Contracts", href: "/contracts", icon: BookOpen },
      { name: "Arbitrage", href: "/arbitrage", icon: ArrowLeftRight },
    ]
  },
  {
    name: "Analytics",
    items: [
      { name: "Advanced Analytics", href: "/analytics", icon: TrendingUp },
      { name: "Price Charts", href: "/charts", icon: TrendingUp },
      { name: "Market Overview", href: "/overview", icon: Globe },
    ]
  },
  {
    name: "Tools",
    items: [
      { name: "Trading Tools", href: "/tools", icon: Settings },
      { name: "Contract Matching", href: "/matching", icon: Search },
      { name: "Calculators", href: "/calculators", icon: Settings },
    ]
  }
];

export default function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isOpen) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isOpen]);

  // Close sidebar on route change for mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location, isMobile]);

  const SidebarContent = () => (
    <>
      <div className="p-4 md:p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-bold text-blue-400 flex items-center">
            <TrendingUp className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            <span className="hidden sm:inline">Kalshi Analytics</span>
            <span className="sm:hidden">KA</span>
          </h1>
          {isMobile && (
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-200 p-1"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 p-3 md:p-4 space-y-4 md:space-y-6 overflow-y-auto">
        {navigation.map((section) => (
          <div key={section.name}>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 md:mb-3 px-1">
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
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors md:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Mobile sidebar overlay */}
        {isOpen && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" />
        )}

        {/* Mobile sidebar */}
        <nav
          id="sidebar"
          className={cn(
            "fixed left-0 top-0 h-full w-64 bg-slate-800 border-r border-slate-700 flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:hidden",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <SidebarContent />
        </nav>
      </>
    );
  }

  // Desktop sidebar
  return (
    <nav className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
      <SidebarContent />
    </nav>
  );
}
