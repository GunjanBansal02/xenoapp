import OpenAI from "openai";
import type { SegmentRule } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || "your-openai-api-key"
});

export async function convertNaturalLanguageToRules(description: string): Promise<SegmentRule[]> {
  try {
    const prompt = `Convert the following natural language description into structured customer segment rules.

Description: "${description}"

Available fields and their types:
- totalSpend (numeric): Customer's total spending amount
- visitCount (numeric): Number of visits/orders
- lastOrderDate (date): When they last ordered (can be expressed as "days since last order")
- segment (text): Customer segment (vip, regular, new)

Available operators: >, >=, <, <=, =, !=

Rules should be connected with AND/OR logic.

Return a JSON object with this exact structure:
{
  "rules": [
    {
      "field": "totalSpend",
      "operator": ">",
      "value": "10000",
      "connector": "AND"
    }
  ]
}

Convert common phrases:
- "high spenders" or "spent over X" → totalSpend > X
- "inactive" or "haven't shopped in X days/months" → use days calculation for lastOrderDate
- "frequent customers" or "visited more than X times" → visitCount > X
- "new customers" → segment = "new"
- "VIP customers" → segment = "vip"

Parse the description and create logical rules. The last rule should not have a connector.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at converting natural language customer descriptions into structured database query rules. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!result.rules || !Array.isArray(result.rules)) {
      throw new Error("Invalid response format from AI");
    }

    // Remove connector from the last rule
    if (result.rules.length > 0) {
      delete result.rules[result.rules.length - 1].connector;
    }

    return result.rules;
  } catch (error) {
    console.error("Error converting natural language to rules:", error);
    
    // Fallback: Parse some basic patterns manually
    const fallbackRules: SegmentRule[] = [];
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes("spent") && lowerDesc.includes("10")) {
      fallbackRules.push({
        field: "totalSpend",
        operator: ">",
        value: "10000"
      });
    }
    
    if (lowerDesc.includes("inactive") || lowerDesc.includes("haven't")) {
      fallbackRules.push({
        field: "lastOrderDate",
        operator: ">",
        value: "90",
        connector: fallbackRules.length > 0 ? "OR" : undefined
      });
    }
    
    if (fallbackRules.length === 0) {
      // Default rule if nothing matches
      fallbackRules.push({
        field: "totalSpend",
        operator: ">",
        value: "0"
      });
    }
    
    return fallbackRules;
  }
}

export async function generateMessageVariants(objective: string, audienceDescription?: string): Promise<Array<{
  id: string;
  style: string;
  message: string;
}>> {
  try {
    const prompt = `Generate 3 different message variants for a marketing campaign.

Campaign Objective: "${objective}"
Audience: ${audienceDescription || "General customers"}

Create messages that:
1. Include personalization placeholder {{name}}
2. Are appropriate for the campaign objective
3. Have different tones/styles
4. Are concise but compelling
5. Include a clear call-to-action

Return a JSON object with this exact structure:
{
  "messages": [
    {
      "id": "variant1",
      "style": "Friendly",
      "message": "Hi {{name}}, we miss you! Come back and enjoy 20% off your next order. Limited time offer!"
    },
    {
      "id": "variant2", 
      "style": "Urgent",
      "message": "{{name}}, your exclusive 20% discount expires in 24 hours! Don't miss out on your favorite items."
    },
    {
      "id": "variant3",
      "style": "Personal",
      "message": "Hey {{name}}! Based on your previous purchases, we think you'll love our new collection. Plus, here's 20% off!"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert marketing copywriter specializing in personalized customer messaging. Create compelling, personalized messages that drive engagement and conversions. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!result.messages || !Array.isArray(result.messages)) {
      throw new Error("Invalid response format from AI");
    }

    return result.messages;
  } catch (error) {
    console.error("Error generating message variants:", error);
    
    // Fallback messages based on objective
    const fallbackMessages = [
      {
        id: "variant1",
        style: "Friendly",
        message: `Hi {{name}}, ${objective.toLowerCase().includes('back') ? "we miss you! Come back and" : ""} enjoy special offers just for you!`
      },
      {
        id: "variant2", 
        style: "Urgent",
        message: `{{name}}, don't miss out! ${objective.toLowerCase().includes('discount') ? "Limited time discount" : "Exclusive offer"} available now.`
      },
      {
        id: "variant3",
        style: "Personal",
        message: `Hey {{name}}! We have something special for you based on your preferences. Check it out!`
      }
    ];
    
    return fallbackMessages;
  }
}

export async function generateCampaignInsights(campaignData: {
  sent: number;
  delivered: number;
  failed: number;
  audienceSize: number;
  campaignType: string;
}): Promise<string> {
  try {
    const deliveryRate = campaignData.sent > 0 ? (campaignData.delivered / campaignData.sent) * 100 : 0;
    
    const prompt = `Generate a human-readable insight summary for this campaign performance:

Campaign Type: ${campaignData.campaignType}
Total Audience: ${campaignData.audienceSize}
Messages Sent: ${campaignData.sent}
Successfully Delivered: ${campaignData.delivered}
Failed Deliveries: ${campaignData.failed}
Delivery Rate: ${deliveryRate.toFixed(1)}%

Provide insights about:
- Overall performance assessment
- Delivery rate analysis
- Recommendations for improvement
- Comparison to industry standards (assume 90-95% is good)

Keep it concise, actionable, and positive where appropriate. Return as plain text, not JSON.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a marketing analytics expert who provides clear, actionable insights about campaign performance."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
    });

    return response.choices[0].message.content || "Campaign completed successfully.";
  } catch (error) {
    console.error("Error generating campaign insights:", error);
    
    // Fallback insight
    const deliveryRate = campaignData.sent > 0 ? (campaignData.delivered / campaignData.sent) * 100 : 0;
    return `Your ${campaignData.campaignType} campaign reached ${campaignData.audienceSize.toLocaleString()} customers. ${campaignData.delivered.toLocaleString()} messages were successfully delivered with a ${deliveryRate.toFixed(1)}% delivery rate.`;
  }
}
