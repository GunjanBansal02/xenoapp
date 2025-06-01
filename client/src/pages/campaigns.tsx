import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CampaignsPage() {
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["/api/campaigns"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-800";
      case "running":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-slate-100 text-slate-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "promotional":
        return "bg-blue-100 text-blue-800";
      case "win-back":
        return "bg-violet-100 text-violet-800";
      case "retention":
        return "bg-amber-100 text-amber-800";
      case "welcome":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "promotional":
        return "fas fa-bullhorn text-blue-600";
      case "win-back":
        return "fas fa-heart text-violet-600";
      case "retention":
        return "fas fa-star text-amber-600";
      case "welcome":
        return "fas fa-gift text-emerald-600";
      default:
        return "fas fa-bullhorn text-slate-600";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-96 mb-8"></div>
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Campaign History</h1>
            <p className="text-slate-600">Monitor and analyze your campaign performance</p>
          </div>
          <Link href="/create-campaign">
            <Button>
              <i className="fas fa-plus mr-2"></i>New Campaign
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Campaigns</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
                <Select defaultValue="30days">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="3months">Last 3 Months</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Campaign Type</label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="promotional">Promotional</SelectItem>
                    <SelectItem value="win-back">Win-back</SelectItem>
                    <SelectItem value="retention">Retention</SelectItem>
                    <SelectItem value="welcome">Welcome</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" className="w-full">
                  <i className="fas fa-filter mr-2"></i>Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            {campaigns.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-bullhorn text-4xl text-slate-300 mb-4"></i>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No campaigns yet</h3>
                <p className="text-slate-500 mb-6">Create your first campaign to get started</p>
                <Link href="/create-campaign">
                  <Button>
                    <i className="fas fa-plus mr-2"></i>Create Campaign
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Audience</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Delivered</TableHead>
                      <TableHead>Failed</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign: any) => (
                      <TableRow key={campaign.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <i className={getTypeIcon(campaign.type)}></i>
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{campaign.name}</p>
                              <p className="text-sm text-slate-500">
                                {campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)} campaign
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(campaign.type)}>
                            {campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-900">
                          {campaign.audienceSize?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell className="text-slate-900">
                          {campaign.sent?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell className="text-emerald-600">
                          {campaign.delivered?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell className="text-red-600">
                          {campaign.failed?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-1">
                              <i className="fas fa-eye"></i>
                            </Button>
                            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 p-1">
                              <i className="fas fa-copy"></i>
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 p-1">
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
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
    </div>
  );
}
