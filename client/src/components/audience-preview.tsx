import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import type { SegmentRule } from "@shared/schema";

interface AudiencePreviewProps {
  rules: SegmentRule[];
}

export default function AudiencePreview({ rules }: AudiencePreviewProps) {
  const { data: preview, isLoading, refetch } = useQuery({
    queryKey: ["/api/campaigns/preview-audience", rules],
    queryFn: async () => {
      if (rules.length === 0) return { size: 0, breakdown: {} };
      
      const response = await apiRequest("POST", "/api/campaigns/preview-audience", { rules });
      return response.json();
    },
    enabled: rules.length > 0,
  });

  const audienceSize = preview?.size || 0;
  const breakdown = preview?.breakdown || {};

  const estimatedDeliveryRate = 0.92; // 92%
  const estimatedSent = Math.floor(audienceSize * estimatedDeliveryRate);
  const estimatedFailed = audienceSize - estimatedSent;

  return (
    <>
      {/* Audience Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Audience Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">
                {isLoading ? "..." : audienceSize.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-slate-600">Customers match your criteria</p>
          </div>
          
          {audienceSize > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">High spenders (>₹10K)</span>
                <span className="text-sm font-medium text-slate-900">
                  {breakdown.highSpenders || 0}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Low frequency visitors</span>
                <span className="text-sm font-medium text-slate-900">
                  {breakdown.lowFrequency || 0}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Inactive (90+ days)</span>
                <span className="text-sm font-medium text-slate-900">
                  {breakdown.inactive || 0}
                </span>
              </div>
            </div>
          )}
          
          <Button
            onClick={() => refetch()}
            disabled={isLoading || rules.length === 0}
            variant="outline"
            className="w-full mt-4"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Calculating...
              </>
            ) : (
              <>
                <i className="fas fa-sync-alt mr-2"></i>
                Refresh Preview
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Estimated Delivery */}
      <Card>
        <CardHeader>
          <CardTitle>Estimated Delivery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Success Rate</span>
              <Badge variant="secondary" className="text-emerald-600 bg-emerald-50">
                ~{Math.round(estimatedDeliveryRate * 100)}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Expected Sent</span>
              <span className="text-sm font-medium text-slate-900">
                {estimatedSent.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Expected Failed</span>
              <span className="text-sm font-medium text-red-600">
                {estimatedFailed.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-sm text-slate-600">Estimated Duration</span>
              <span className="text-sm font-medium text-slate-900">
                ~{Math.max(1, Math.ceil(audienceSize / 1000))} minutes
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
