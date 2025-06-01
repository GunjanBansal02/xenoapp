import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics & Insights</h1>
          <p className="text-slate-600">Deep dive into campaign performance and customer behavior</p>
        </div>

        {/* Coming Soon Card */}
        <Card>
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-chart-bar text-3xl text-violet-600"></i>
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">Advanced Analytics</h3>
              <p className="text-slate-600 mb-6">
                Detailed analytics charts, performance metrics, customer behavior insights, 
                and advanced reporting features will be available here.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                <span className="px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-sm">Campaign ROI</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Customer Lifetime Value</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">Engagement Metrics</span>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">Conversion Funnels</span>
              </div>
              <p className="text-sm text-slate-500">
                This feature is currently in development and will be available in future updates.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
