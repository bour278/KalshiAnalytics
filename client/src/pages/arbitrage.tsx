import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRightLeft, TrendingUp, AlertCircle, Calculator, RefreshCw } from "lucide-react";
import { ArbitrageOpportunityWithContracts } from "@/shared/schema";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

export default function Arbitrage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h");

  const { data: opportunities, isLoading, error, refetch } = useQuery<ArbitrageOpportunityWithContracts[]>({
    queryKey: ["/api/arbitrage/opportunities"],
    refetchInterval: 15000,
  });

  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const formatSpread = (spread: string) => {
    return `${parseFloat(spread).toFixed(1)}%`;
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "high":
        return <Badge className="bg-green-600 text-white">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-600 text-white">Medium</Badge>;
      case "low":
        return <Badge className="bg-red-600 text-white">Low</Badge>;
      default:
        return <Badge variant="outline">{confidence}</Badge>;
    }
  };

  const calculatePotentialProfit = (kalshiPrice: string, polymarketPrice: string, stake: number = 1000) => {
    const kalshi = parseFloat(kalshiPrice);
    const poly = parseFloat(polymarketPrice);
    const spread = Math.abs(kalshi - poly);
    return (spread * stake).toFixed(2);
  };

  const getSimilarityScore = (opp: ArbitrageOpportunityWithContracts) => {
    // Mock similarity calculation based on title/description matching
    const kalshiTitle = opp.kalshiContract.title.toLowerCase();
    const polyTitle = opp.polymarketContract.title.toLowerCase();
    const commonWords = kalshiTitle.split(' ').filter(word => polyTitle.includes(word));
    return Math.min(100, (commonWords.length / kalshiTitle.split(' ').length) * 100);
  };

  const highConfidenceOpps = opportunities?.filter(opp => opp.confidence === "high") || [];
  const mediumConfidenceOpps = opportunities?.filter(opp => opp.confidence === "medium") || [];
  const totalSpread = opportunities?.reduce((sum, opp) => sum + parseFloat(opp.spread || "0"), 0) || 0;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-50">
                    Arbitrage Analysis
                  </h1>
                  <p className="text-slate-400 mt-1">
                    Cross-platform arbitrage opportunities and contract matching
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => refetch()}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="trading-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Total Opportunities</p>
                        <p className="text-2xl font-bold text-slate-50">{opportunities?.length || 0}</p>
                      </div>
                      <ArrowRightLeft className="h-8 w-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="trading-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">High Confidence</p>
                        <p className="text-2xl font-bold text-green-400">{highConfidenceOpps.length}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="trading-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Medium Confidence</p>
                        <p className="text-2xl font-bold text-yellow-400">{mediumConfidenceOpps.length}</p>
                      </div>
                      <AlertCircle className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="trading-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Avg Spread</p>
                        <p className="text-2xl font-bold text-slate-50">
                          {opportunities?.length ? (totalSpread / opportunities.length).toFixed(1) : "0"}%
                        </p>
                      </div>
                      <Calculator className="h-8 w-8 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Arbitrage Analysis Tabs */}
              <Tabs defaultValue="opportunities" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                  <TabsTrigger value="opportunities" className="text-slate-300">
                    Opportunities
                  </TabsTrigger>
                  <TabsTrigger value="matching" className="text-slate-300">
                    Contract Matching
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="text-slate-300">
                    Analytics
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="opportunities" className="space-y-4">
                  <Card className="trading-card">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-slate-50">
                        Active Arbitrage Opportunities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="text-center text-slate-400 py-8">
                          Loading opportunities...
                        </div>
                      ) : error ? (
                        <div className="text-center text-red-400 py-8">
                          Failed to load opportunities
                        </div>
                      ) : opportunities && opportunities.length > 0 ? (
                        <div className="space-y-4">
                          {opportunities.map((opp) => (
                            <div key={opp.id} className="border border-slate-700 rounded-lg p-4 hover:bg-slate-700/30 transition-colors">
                              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <h3 className="font-medium text-slate-50 mb-2">
                                    {opp.kalshiContract.title}
                                  </h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="default" className="text-xs">Kalshi</Badge>
                                        <span className="text-green-400 font-medium">
                                          {formatPrice(opp.kalshiPrice)}
                                        </span>
                                      </div>
                                      <div className="text-xs text-slate-400">
                                        {opp.kalshiContract.description}
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs">Polymarket</Badge>
                                        <span className="text-red-400 font-medium">
                                          {formatPrice(opp.polymarketPrice)}
                                        </span>
                                      </div>
                                      <div className="text-xs text-slate-400">
                                        {opp.polymarketContract.description}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                  <div className="text-center">
                                    <div className="text-sm text-slate-400">Spread</div>
                                    <div className="text-lg font-bold text-yellow-400">
                                      {formatSpread(opp.spread)}
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-sm text-slate-400">Confidence</div>
                                    <div className="mt-1">
                                      {getConfidenceBadge(opp.confidence)}
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-sm text-slate-400">Potential Profit</div>
                                    <div className="text-sm font-medium text-green-400">
                                      $${calculatePotentialProfit(opp.kalshiPrice, opp.polymarketPrice)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-slate-400 py-8">
                          No arbitrage opportunities found
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="matching" className="space-y-4">
                  <Card className="trading-card">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-slate-50">
                        Contract Similarity Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {opportunities && opportunities.length > 0 ? (
                        <div className="space-y-4">
                          {opportunities.map((opp) => (
                            <div key={opp.id} className="border border-slate-700 rounded-lg p-4">
                              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <h3 className="font-medium text-slate-50 mb-3">
                                    Contract Pair Analysis
                                  </h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Badge variant="default" className="text-xs mb-2">Kalshi</Badge>
                                      <div className="text-sm text-slate-50 font-medium">
                                        {opp.kalshiContract.title}
                                      </div>
                                      <div className="text-xs text-slate-400 mt-1">
                                        {opp.kalshiContract.category}
                                      </div>
                                    </div>
                                    <div>
                                      <Badge variant="secondary" className="text-xs mb-2">Polymarket</Badge>
                                      <div className="text-sm text-slate-50 font-medium">
                                        {opp.polymarketContract.title}
                                      </div>
                                      <div className="text-xs text-slate-400 mt-1">
                                        {opp.polymarketContract.category}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                  <div className="text-sm text-slate-400">Similarity Score</div>
                                  <div className="w-20">
                                    <Progress value={getSimilarityScore(opp)} className="h-2" />
                                  </div>
                                  <div className="text-sm font-medium text-slate-50">
                                    {getSimilarityScore(opp).toFixed(0)}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-slate-400 py-8">
                          No contract pairs available for analysis
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="trading-card">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-50">
                          Spread Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">0-2% Spread</span>
                            <span className="text-sm text-slate-50">
                              {opportunities?.filter(opp => parseFloat(opp.spread) <= 2).length || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">2-5% Spread</span>
                            <span className="text-sm text-slate-50">
                              {opportunities?.filter(opp => parseFloat(opp.spread) > 2 && parseFloat(opp.spread) <= 5).length || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">5%+ Spread</span>
                            <span className="text-sm text-slate-50">
                              {opportunities?.filter(opp => parseFloat(opp.spread) > 5).length || 0}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="trading-card">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-50">
                          Platform Price Comparison
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">Kalshi Higher</span>
                            <span className="text-sm text-green-400">
                              {opportunities?.filter(opp => parseFloat(opp.kalshiPrice) > parseFloat(opp.polymarketPrice)).length || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">Polymarket Higher</span>
                            <span className="text-sm text-red-400">
                              {opportunities?.filter(opp => parseFloat(opp.polymarketPrice) > parseFloat(opp.kalshiPrice)).length || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">Equal Prices</span>
                            <span className="text-sm text-yellow-400">
                              {opportunities?.filter(opp => parseFloat(opp.kalshiPrice) === parseFloat(opp.polymarketPrice)).length || 0}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}