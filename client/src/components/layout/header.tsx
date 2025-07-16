import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

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
      second: "2-digit",
      hour12: true,
      timeZoneName: "short"
    });
  };

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-50">Trading Dashboard</h2>
          <p className="text-slate-400">Real-time analytics and market insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="bg-slate-700 border-slate-600">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            Live
          </Badge>
          <div className="text-right">
            <div className="text-sm text-slate-400">Last Updated</div>
            <div className="text-sm font-medium text-slate-200">
              {formatTime(currentTime)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
