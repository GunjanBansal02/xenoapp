import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { SegmentRule } from "@shared/schema";

interface RuleBuilderProps {
  rules: SegmentRule[];
  onChange: (rules: SegmentRule[]) => void;
}

export default function RuleBuilder({ rules, onChange }: RuleBuilderProps) {
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const convertRulesMutation = useMutation({
    mutationFn: async (description: string) => {
      const response = await apiRequest("POST", "/api/ai/convert-rules", { description });
      return response.json();
    },
    onSuccess: (data) => {
      onChange(data.rules);
      toast({
        title: "Rules Generated!",
        description: "AI has converted your description into segment rules.",
      });
    },
    onError: (error) => {
      console.error("Rules conversion failed:", error);
      toast({
        title: "Conversion Failed",
        description: "Failed to convert description to rules. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleConvertToRules = () => {
    if (!description.trim()) {
      toast({
        title: "Missing Description",
        description: "Please enter a description of your target audience.",
        variant: "destructive",
      });
      return;
    }
    
    convertRulesMutation.mutate(description);
  };

  const addRule = () => {
    const newRule: SegmentRule = {
      field: "totalSpend",
      operator: ">",
      value: "0",
      connector: "AND",
    };
    onChange([...rules, newRule]);
  };

  const updateRule = (index: number, updates: Partial<SegmentRule>) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], ...updates };
    onChange(newRules);
  };

  const removeRule = (index: number) => {
    const newRules = rules.filter((_, i) => i !== index);
    onChange(newRules);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
            <i className="fas fa-brain text-violet-600"></i>
          </div>
          <CardTitle>AI-Powered Audience Builder</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Natural Language Input */}
        <div>
          <Label htmlFor="audienceDescription">Describe your target audience</Label>
          <div className="relative mt-2">
            <Textarea
              id="audienceDescription"
              placeholder="e.g. People who haven't shopped in 6 months and spent over ₹5K, or customers who visited more than 3 times"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] resize-none pr-24"
            />
            <Button
              onClick={handleConvertToRules}
              disabled={convertRulesMutation.isPending}
              size="sm"
              className="absolute bottom-3 right-3 bg-violet-600 hover:bg-violet-700"
            >
              {convertRulesMutation.isPending ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fas fa-magic mr-2"></i>
              )}
              Convert to Rules
            </Button>
          </div>
        </div>

        {/* Visual Rule Builder */}
        <div className="border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-slate-900">Rule Builder</h4>
            <Button onClick={addRule} size="sm">
              <i className="fas fa-plus mr-1"></i>Add Rule
            </Button>
          </div>
          
          <div className="space-y-3">
            {rules.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
                <i className="fas fa-filter text-2xl text-slate-400 mb-2"></i>
                <p className="text-slate-500">No rules defined yet</p>
                <p className="text-sm text-slate-400">Add rules manually or use AI conversion above</p>
              </div>
            ) : (
              rules.map((rule, index) => (
                <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Select 
                      value={rule.field} 
                      onValueChange={(value) => updateRule(index, { field: value })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="totalSpend">Total Spend</SelectItem>
                        <SelectItem value="visitCount">Number of Visits</SelectItem>
                        <SelectItem value="lastOrderDate">Days Since Last Order</SelectItem>
                        <SelectItem value="segment">Customer Segment</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={rule.operator} 
                      onValueChange={(value) => updateRule(index, { operator: value })}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=">">{">"}</SelectItem>
                        <SelectItem value=">=">{">="}</SelectItem>
                        <SelectItem value="<">{"<"}</SelectItem>
                        <SelectItem value="<=">&le;</SelectItem>
                        <SelectItem value="=">=</SelectItem>
                        <SelectItem value="!=">&ne;</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Input
                      placeholder="Value"
                      value={rule.value}
                      onChange={(e) => updateRule(index, { value: e.target.value })}
                      className="w-24"
                    />
                    
                    {index < rules.length - 1 && (
                      <Select 
                        value={rule.connector} 
                        onValueChange={(value) => updateRule(index, { connector: value as "AND" | "OR" })}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AND">AND</SelectItem>
                          <SelectItem value="OR">OR</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRule(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
