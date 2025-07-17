import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { Contract } from "@/shared/schema";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

export default function Contracts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: contracts, isLoading, error } = useQuery<Contract[]>({
    queryKey: ["/api/contracts"],
    refetchInterval: 30000,
  });

  const filteredContracts = contracts?.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = platformFilter === "all" || contract.platform === platformFilter;
    const matchesCategory = categoryFilter === "all" || contract.category === categoryFilter;
    
    return matchesSearch && matchesPlatform && matchesCategory;
  });

  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const formatVolume = (volume: string) => {
    const vol = parseInt(volume);
    if (vol >= 1000000) {
      return `$${(vol / 1000000).toFixed(1)}M`;
    } else if (vol >= 1000) {
      return `$${(vol / 1000).toFixed(0)}K`;
    }
    return `$${vol}`;
  };

  const getPlatformBadge = (platform: string) => {
    const isKalshi = platform === "kalshi";
    return (
      <Badge variant={isKalshi ? "default" : "secondary"} className="text-xs">
        {isKalshi ? "Kalshi" : "Polymarket"}
      </Badge>
    );
  };

  const getPriceChangeIcon = (price: string) => {
    const priceValue = parseFloat(price);
    if (priceValue > 0.5) {
      return <TrendingUp className="h-4 w-4 text-green-400" />;
    } else if (priceValue < 0.5) {
      return <TrendingDown className="h-4 w-4 text-red-400" />;
    }
    return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
  };

  const categories = [...new Set(contracts?.map(c => c.category) || [])];

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
                    Contract Explorer
                  </h1>
                  <p className="text-slate-400 mt-1">
                    Browse and analyze event contracts across platforms
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Filter className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </div>

              {/* Search and Filters */}
              <Card className="trading-card">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search contracts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-700 border-slate-600 text-slate-50"
                      />
                    </div>
                    <Select value={platformFilter} onValueChange={setPlatformFilter}>
                      <SelectTrigger className="w-full sm:w-40 bg-slate-700 border-slate-600 text-slate-50">
                        <SelectValue placeholder="Platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Platforms</SelectItem>
                        <SelectItem value="kalshi">Kalshi</SelectItem>
                        <SelectItem value="polymarket">Polymarket</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full sm:w-40 bg-slate-700 border-slate-600 text-slate-50">
                        <SelectValue placeholder="Category" />
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
                </CardContent>
              </Card>

              {/* Contracts Table */}
              <Card className="trading-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-50">
                    Active Contracts ({filteredContracts?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center text-slate-400 py-8">
                      Loading contracts...
                    </div>
                  ) : error ? (
                    <div className="text-center text-red-400 py-8">
                      Failed to load contracts
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-slate-400">Contract</TableHead>
                            <TableHead className="text-slate-400">Platform</TableHead>
                            <TableHead className="text-slate-400">Category</TableHead>
                            <TableHead className="text-slate-400">Price</TableHead>
                            <TableHead className="text-slate-400">Volume</TableHead>
                            <TableHead className="text-slate-400">Liquidity</TableHead>
                            <TableHead className="text-slate-400">Trend</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredContracts?.map((contract) => (
                            <TableRow key={contract.id} className="hover:bg-slate-700/50">
                              <TableCell>
                                <div className="max-w-xs">
                                  <div className="font-medium text-slate-50 truncate">
                                    {contract.title}
                                  </div>
                                  <div className="text-xs text-slate-400 truncate">
                                    {contract.description}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {getPlatformBadge(contract.platform)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {contract.category}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-slate-50 font-medium">
                                {formatPrice(contract.currentPrice || "0")}
                              </TableCell>
                              <TableCell className="text-slate-50">
                                {formatVolume(contract.volume || "0")}
                              </TableCell>
                              <TableCell className="text-slate-50">
                                {formatVolume(contract.liquidity || "0")}
                              </TableCell>
                              <TableCell>
                                {getPriceChangeIcon(contract.currentPrice || "0.5")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}