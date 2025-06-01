import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface MessageGeneratorProps {
  campaignType: string;
  onMessageSelect: (message: string) => void;
}

interface MessageVariant {
  id: string;
  style: string;
  message: string;
}

export default function MessageGenerator({ campaignType, onMessageSelect }: MessageGeneratorProps) {
  const [objective, setObjective] = useState("");
  const [variants, setVariants] = useState<MessageVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState("");
  const { toast } = useToast();

  const generateMessagesMutation = useMutation({
    mutationFn: async (data: { objective: string; audienceDescription: string }) => {
      const response = await apiRequest("POST", "/api/ai/generate-messages", data);
      return response.json();
    },
    onSuccess: (data) => {
      setVariants(data.messages);
      toast({
        title: "Messages Generated!",
        description: "AI has created message variants for your campaign.",
      });
    },
    onError: (error) => {
      console.error("Message generation failed:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate messages. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateMessages = () => {
    if (!objective.trim()) {
      toast({
        title: "Missing Objective",
        description: "Please enter a campaign objective.",
        variant: "destructive",
      });
      return;
    }

    generateMessagesMutation.mutate({
      objective,
      audienceDescription: `${campaignType} campaign targeting specific customer segments`,
    });
  };

  const handleVariantSelect = (variantId: string) => {
    setSelectedVariant(variantId);
    const variant = variants.find(v => v.id === variantId);
    if (variant) {
      onMessageSelect(variant.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <i className="fas fa-comment-dots text-emerald-600"></i>
          </div>
          <CardTitle>AI Message Generator</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div>
          <Label htmlFor="objective">Campaign Objective</Label>
          <Input
            id="objective"
            placeholder="e.g. Bring back inactive users with special discount"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
          />
        </div>
        
        <Button
          onClick={handleGenerateMessages}
          disabled={generateMessagesMutation.isPending}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {generateMessagesMutation.isPending ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Generating Messages...
            </>
          ) : (
            <>
              <i className="fas fa-magic mr-2"></i>
              Generate Message Variants
            </>
          )}
        </Button>
        
        {/* Generated Messages */}
        {variants.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <RadioGroup value={selectedVariant} onValueChange={handleVariantSelect}>
              {variants.map((variant, index) => (
                <div key={variant.id} className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  index === 0 ? 'bg-emerald-50 border-emerald-200' :
                  index === 1 ? 'bg-blue-50 border-blue-200' :
                  'bg-violet-50 border-violet-200'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-sm font-medium ${
                      index === 0 ? 'text-emerald-900' :
                      index === 1 ? 'text-blue-900' :
                      'text-violet-900'
                    }`}>
                      Variant {index + 1} - {variant.style}
                    </span>
                    <RadioGroupItem value={variant.id} className={
                      index === 0 ? 'text-emerald-600 border-emerald-600' :
                      index === 1 ? 'text-blue-600 border-blue-600' :
                      'text-violet-600 border-violet-600'
                    } />
                  </div>
                  <p className={`text-sm ${
                    index === 0 ? 'text-emerald-800' :
                    index === 1 ? 'text-blue-800' :
                    'text-violet-800'
                  }`}>
                    {variant.message}
                  </p>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
