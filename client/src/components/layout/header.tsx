import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const isMobile = useIsMobile();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: isMobile ? undefined : "2-digit",
      hour12: true,
      timeZoneName: isMobile ? undefined : "short"
    });
  };

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg md:text-2xl font-bold text-slate-50 truncate">
            {isMobile ? "Dashboard" : "Trading Dashboard"}
          </h2>
          <p className="text-slate-400 text-sm md:text-base hidden sm:block">
            Real-time analytics and market insights
          </p>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
          <Badge variant="outline" className="bg-slate-700 border-slate-600 text-xs md:text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-1 md:mr-2"></div>
            Live
          </Badge>
          <div className="text-right hidden sm:block">
            <div className="text-xs md:text-sm text-slate-400">Last Updated</div>
            <div className="text-xs md:text-sm font-medium text-slate-200">
              {formatTime(currentTime)}
            </div>
          </div>
          <div className="text-right sm:hidden">
            <div className="text-xs font-medium text-slate-200">
              {formatTime(currentTime)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
