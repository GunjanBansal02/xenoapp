import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/campaigns"],
  });

  const recentCampaigns = campaigns.slice(0, 3);

  if (statsLoading || campaignsLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-slate-200">
                  <div className="h-12 bg-slate-200 rounded mb-4"></div>
                  <div className="h-6 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-20"></div>
                </div>
              ))}
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Overview of your campaign performance and customer insights</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="animate-slide-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-bullhorn text-blue-600"></i>
                </div>
                <Badge variant="secondary" className="text-emerald-600 bg-emerald-50">
                  +12%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">
                {stats?.totalCampaigns || 0}
              </h3>
              <p className="text-slate-600 text-sm">Total Campaigns</p>
            </CardContent>
          </Card>

          <Card className="animate-slide-in" style={{ animationDelay: "0.1s" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-paper-plane text-emerald-600"></i>
                </div>
                <Badge variant="secondary" className="text-emerald-600 bg-emerald-50">
                  +8%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">
                {stats?.messagesSent?.toLocaleString() || 0}
              </h3>
              <p className="text-slate-600 text-sm">Messages Sent</p>
            </CardContent>
          </Card>

          <Card className="animate-slide-in" style={{ animationDelay: "0.2s" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-users text-violet-600"></i>
                </div>
                <Badge variant="secondary" className="text-emerald-600 bg-emerald-50">
                  +15%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">
                {stats?.activeCustomers?.toLocaleString() || 0}
              </h3>
              <p className="text-slate-600 text-sm">Active Customers</p>
            </CardContent>
          </Card>

          <Card className="animate-slide-in" style={{ animationDelay: "0.3s" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-percentage text-amber-600"></i>
                </div>
                <Badge variant="secondary" className="text-emerald-600 bg-emerald-50">
                  +3%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">
                {stats?.deliveryRate?.toFixed(1) || 0}%
              </h3>
              <p className="text-slate-600 text-sm">Delivery Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Campaigns & AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Recent Campaigns</CardTitle>
                <Link href="/campaigns">
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCampaigns.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-bullhorn text-4xl text-slate-300 mb-4"></i>
                    <p className="text-slate-500">No campaigns yet</p>
                    <Link href="/create-campaign">
                      <Button className="mt-4">Create Your First Campaign</Button>
                    </Link>
                  </div>
                ) : (
                  recentCampaigns.map((campaign: any, index: number) => (
                    <div key={campaign.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          index === 0 ? 'bg-blue-100' : index === 1 ? 'bg-violet-100' : 'bg-amber-100'
                        }`}>
                          <i className={`text-sm ${
                            index === 0 ? 'fas fa-bullhorn text-blue-600' : 
                            index === 1 ? 'fas fa-heart text-violet-600' : 
                            'fas fa-star text-amber-600'
                          }`}></i>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{campaign.name}</p>
                          <p className="text-sm text-slate-500">
                            {new Date(campaign.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">
                          {campaign.sent || 0} sent
                        </p>
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                          {campaign.delivered && campaign.sent ? 
                            Math.round((campaign.delivered / campaign.sent) * 100) : 0}% delivered
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-brain text-violet-600"></i>
                </div>
                <CardTitle className="text-xl">AI Insights</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-lightbulb text-blue-600 mt-1"></i>
                    <div>
                      <p className="font-medium text-blue-900 mb-1">Optimal Send Time</p>
                      <p className="text-sm text-blue-700">
                        Your audience is most active on Tuesdays at 2 PM. Consider scheduling your next campaign then for 23% better engagement.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-chart-line text-emerald-600 mt-1"></i>
                    <div>
                      <p className="font-medium text-emerald-900 mb-1">Segment Performance</p>
                      <p className="text-sm text-emerald-700">
                        Customers who spent {'>'}₹10K show 95% delivery rate. Consider creating similar high-value segments.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-target text-amber-600 mt-1"></i>
                    <div>
                      <p className="font-medium text-amber-900 mb-1">Audience Suggestion</p>
                      <p className="text-sm text-amber-700">
                        324 customers similar to your best performers are available for targeting in the next campaign.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
