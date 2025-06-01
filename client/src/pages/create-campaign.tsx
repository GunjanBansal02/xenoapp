import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import RuleBuilder from "@/components/rule-builder";
import MessageGenerator from "@/components/message-generator";
import AudiencePreview from "@/components/audience-preview";
import type { SegmentRule } from "@shared/schema";

export default function CreateCampaignPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [campaignName, setCampaignName] = useState("");
  const [campaignType, setCampaignType] = useState("promotional");
  const [rules, setRules] = useState<SegmentRule[]>([]);
  const [selectedMessage, setSelectedMessage] = useState("");

  const createCampaignMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/campaigns", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Campaign Created!",
        description: "Your campaign has been launched successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      setLocation("/campaigns");
    },
    onError: (error) => {
      console.error("Campaign creation failed:", error);
      toast({
        title: "Failed to Create Campaign",
        description: "Please check your inputs and try again.",
        variant: "destructive",
      });
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/campaigns", { ...data, status: "draft" });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Draft Saved",
        description: "Your campaign has been saved as a draft.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
    },
    onError: (error) => {
      console.error("Draft save failed:", error);
      toast({
        title: "Failed to Save Draft",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLaunchCampaign = () => {
    if (!campaignName.trim()) {
      toast({
        title: "Missing Campaign Name",
        description: "Please enter a campaign name.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedMessage.trim()) {
      toast({
        title: "Missing Message",
        description: "Please generate and select a message variant.",
        variant: "destructive",
      });
      return;
    }

    if (rules.length === 0) {
      toast({
        title: "Missing Audience Rules",
        description: "Please add at least one audience rule.",
        variant: "destructive",
      });
      return;
    }

    createCampaignMutation.mutate({
      name: campaignName,
      type: campaignType,
      message: selectedMessage,
      rules,
      audienceSize: 0, // Will be calculated by backend
      status: "running",
    });
  };

  const handleSaveDraft = () => {
    if (!campaignName.trim()) {
      toast({
        title: "Missing Campaign Name",
        description: "Please enter a campaign name.",
        variant: "destructive",
      });
      return;
    }

    saveDraftMutation.mutate({
      name: campaignName,
      type: campaignType,
      message: selectedMessage || "Draft message",
      rules,
      audienceSize: 0,
      status: "draft",
    });
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Campaign</h1>
          <p className="text-slate-600">Build targeted campaigns with intelligent audience segmentation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Campaign Builder */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Campaign Details */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="campaignName">Campaign Name</Label>
                  <Input
                    id="campaignName"
                    placeholder="e.g. Summer Sale 2025"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="campaignType">Campaign Type</Label>
                  <Select value={campaignType} onValueChange={setCampaignType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="promotional">Promotional</SelectItem>
                      <SelectItem value="win-back">Win-back</SelectItem>
                      <SelectItem value="retention">Retention</SelectItem>
                      <SelectItem value="welcome">Welcome</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Rule Builder */}
            <RuleBuilder rules={rules} onChange={setRules} />

            {/* Message Generator */}
            <MessageGenerator
              campaignType={campaignType}
              onMessageSelect={setSelectedMessage}
            />
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            {/* Audience Preview */}
            <AudiencePreview rules={rules} />

            {/* Campaign Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleLaunchCampaign}
                disabled={createCampaignMutation.isPending}
                className="w-full"
              >
                {createCampaignMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Launching...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>
                    Launch Campaign
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={saveDraftMutation.isPending}
                className="w-full"
              >
                {saveDraftMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    Save as Draft
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
