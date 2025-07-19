import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Contracts from "@/pages/contracts";
import Arbitrage from "@/pages/arbitrage";
import Analytics from "@/pages/analytics";
import Tools from "@/pages/tools";
import Charts from "@/pages/charts";
import Overview from "@/pages/overview";
import Matching from "@/pages/matching";
import Calculators from "@/pages/calculators";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/contracts" component={Contracts} />
      <Route path="/arbitrage" component={Arbitrage} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/tools" component={Tools} />
      <Route path="/charts" component={Charts} />
      <Route path="/overview" component={Overview} />
      <Route path="/matching" component={Matching} />
      <Route path="/calculators" component={Calculators} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark min-h-screen bg-slate-900">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
