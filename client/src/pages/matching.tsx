import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Filter, 
  ArrowLeftRight, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign,
  Target,
  Zap,
  BarChart3,
  Activity
} from "lucide-react";
import type { Contract } from "@shared/schema";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { useIsMobile } from "@/hooks/use-mobile";

interface ContractMatch {
  kalshiContract: Contract;
  polymarketContract: Contract;
  similarity: number;
  priceDifference: number;
  volumeDifference: number;
  arbitrageOpportunity: number;
  confidence: number;
}

export default function Matching() {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("similarity");
  const [minSimilarity, setMinSimilarity] = useState(70);

  const { data: contracts } = useQuery<Contract[]>({
    queryKey: ["/api/contracts"],
  });

  // Generate contract matches
  const contractMatches: ContractMatch[] = contracts ? 
    contracts
      .filter(c => c.platform === "Kalshi")
      .map(kalshiContract => {
        // Find the best matching Polymarket contract
        const polymarketContracts = contracts.filter(c => c.platform === "Polymarket");
        const bestMatch = polymarketContracts.reduce((best, current) => {
          const currentSimilarity = calculateSimilarity(kalshiContract, current);
          const bestSimilarity = best ? calculateSimilarity(kalshiContract, best) : 0;
          return currentSimilarity > bestSimilarity ? current : best;
        }, null as Contract | null);

        if (!bestMatch) return null;

        const similarity = calculateSimilarity(kalshiContract, bestMatch);
        const kalshiPrice = parseFloat(kalshiContract.currentPrice || '0');
        const polymarketPrice = parseFloat(bestMatch.currentPrice || '0');
        const priceDifference = Math.abs(kalshiPrice - polymarketPrice);
        const volumeDifference = Math.abs(
          parseInt(kalshiContract.volume || '0') - parseInt(bestMatch.volume || '0')
        );
        const arbitrageOpportunity = priceDifference * 100;
        const confidence = similarity > 80 ? 95 : similarity > 60 ? 80 : 60;

        return {
          kalshiContract,
          polymarketContract: bestMatch,
          similarity,
          priceDifference,
          volumeDifference,
          arbitrageOpportunity,
          confidence
        };
      })
      .filter(Boolean) as ContractMatch[]
    : [];

  function calculateSimilarity(contract1: Contract, contract2: Contract): number {
    const titleSimilarity = getTextSimilarity(contract1.title, contract2.title);
    const categorySimilarity = contract1.category === contract2.category ? 100 : 0;
    return (titleSimilarity * 0.7) + (categorySimilarity * 0.3);
  }

  function getTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    return (intersection.length / union.length) * 100;
  }

  const filteredMatches = contractMatches
    .filter(match => 
      match.similarity >= minSimilarity &&
      (filterCategory === "all" || match.kalshiContract.category === filterCategory) &&
      (searchTerm === "" || 
       match.kalshiContract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       match.polymarketContract.title.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "similarity":
          return b.similarity - a.similarity;
        case "arbitrage":
          return b.arbitrageOpportunity - a.arbitrageOpportunity;
        case "volume":
          return b.volumeDifference - a.volumeDifference;
        default:
          return b.similarity - a.similarity;
      }
    });

  const categories = contracts ? [...new Set(contracts.map(c => c.category))] : [];

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 90) return "text-green-500";
    if (similarity >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getSimilarityBadge = (similarity: number) => {
    if (similarity >= 90) return "default";
    if (similarity >= 70) return "secondary";
    return "destructive";
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-50">
      <Sidebar />
      <main className={`flex-1 overflow-auto ${isMobile ? 'ml-0' : ''}`}>
        <Header />
        <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Contract Matching</h1>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-muted-foreground">
            {filteredMatches.length} matches found
          </span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Contracts</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="similarity">Similarity Score</SelectItem>
                  <SelectItem value="arbitrage">Arbitrage Opportunity</SelectItem>
                  <SelectItem value="volume">Volume Difference</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Min Similarity: {minSimilarity}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={minSimilarity}
                onChange={(e) => setMinSimilarity(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">High Matches</span>
            </div>
            <p className="text-2xl font-bold">
              {filteredMatches.filter(m => m.similarity >= 90).length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Arbitrage Ops</span>
            </div>
            <p className="text-2xl font-bold">
              {filteredMatches.filter(m => m.arbitrageOpportunity > 5).length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Avg Similarity</span>
            </div>
            <p className="text-2xl font-bold">
              {filteredMatches.length > 0 ? 
                Math.round(filteredMatches.reduce((sum, m) => sum + m.similarity, 0) / filteredMatches.length) : 0
              }%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Total Matches</span>
            </div>
            <p className="text-2xl font-bold">{filteredMatches.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Contract Matches */}
      <div className="space-y-4">
        {filteredMatches.map((match, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant={getSimilarityBadge(match.similarity)}>
                    {match.similarity.toFixed(1)}% Match
                  </Badge>
                  <Badge variant="outline">
                    {match.confidence}% Confidence
                  </Badge>
                  {match.arbitrageOpportunity > 5 && (
                    <Badge variant="secondary">
                      <Zap className="h-3 w-3 mr-1" />
                      Arbitrage Opportunity
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Price Diff: ${match.priceDifference.toFixed(3)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Kalshi Contract */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Kalshi</Badge>
                      <h3 className="font-semibold">{match.kalshiContract.title}</h3>
                    </div>
                    <Badge variant="outline">{match.kalshiContract.category}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Price</p>
                      <p className="text-lg font-bold">${match.kalshiContract.currentPrice}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Volume</p>
                      <p className="text-lg font-bold">{match.kalshiContract.volume}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={match.kalshiContract.status === 'active' ? 'default' : 'secondary'}>
                      {match.kalshiContract.status}
                    </Badge>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center lg:flex-col lg:justify-center">
                  <ArrowLeftRight className="h-6 w-6 text-muted-foreground" />
                  <div className="ml-2 lg:ml-0 lg:mt-2">
                    <Progress value={match.similarity} className="w-20" />
                    <p className="text-xs text-center mt-1 text-muted-foreground">
                      {match.similarity.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Polymarket Contract */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Polymarket</Badge>
                      <h3 className="font-semibold">{match.polymarketContract.title}</h3>
                    </div>
                    <Badge variant="outline">{match.polymarketContract.category}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Price</p>
                      <p className="text-lg font-bold">${match.polymarketContract.currentPrice}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Volume</p>
                      <p className="text-lg font-bold">{match.polymarketContract.volume}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={match.polymarketContract.status === 'active' ? 'default' : 'secondary'}>
                      {match.polymarketContract.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Match Analysis */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Match Analysis</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Similarity Score</p>
                    <p className={`font-semibold ${getSimilarityColor(match.similarity)}`}>
                      {match.similarity.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price Difference</p>
                    <p className="font-semibold">${match.priceDifference.toFixed(3)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Volume Difference</p>
                    <p className="font-semibold">${(match.volumeDifference / 1000).toFixed(0)}k</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Arbitrage Potential</p>
                    <p className="font-semibold">{match.arbitrageOpportunity.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No matches found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search terms to find contract matches.
            </p>
          </CardContent>
        </Card>
      )}
        </div>
      </main>
    </div>
  );
}