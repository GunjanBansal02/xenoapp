import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertOrderSchema, insertCampaignSchema, type SegmentRule } from "@shared/schema";
import { convertNaturalLanguageToRules, generateMessageVariants } from "./openai";
import { sendMessage } from "./vendor-api";
import { z } from "zod";

const googleUserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  picture: z.string().optional(),
  sub: z.string(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { token } = req.body;
      
      // In a real implementation, verify the Google token
      // For now, we'll accept the user data directly
      const userData = googleUserSchema.parse(req.body.user);
      
      let user = await storage.getUserByGoogleId(userData.sub);
      
      if (!user) {
        user = await storage.createUser({
          email: userData.email,
          name: userData.name,
          avatar: userData.picture,
          googleId: userData.sub,
        });
      }
      
      // In a real app, you'd create a session or JWT token here
      res.json({ user });
    } catch (error) {
      console.error("Auth error:", error);
      res.status(401).json({ message: "Authentication failed" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    // For demo purposes, return a mock user
    // In a real app, verify session/token and return actual user
    const mockUser = {
      id: 1,
      email: "demo@example.com",
      name: "Demo User",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    };
    res.json(mockUser);
  });

  // Customer data ingestion
  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.json(customer);
    } catch (error) {
      console.error("Customer creation error:", error);
      res.status(400).json({ message: "Invalid customer data" });
    }
  });

  app.get("/api/customers", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const customers = await storage.getCustomers(limit, offset);
      res.json(customers);
    } catch (error) {
      console.error("Customers fetch error:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  // Order data ingestion
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.json(order);
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(400).json({ message: "Invalid order data" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const customerId = req.query.customerId ? parseInt(req.query.customerId as string) : undefined;
      const limit = parseInt(req.query.limit as string) || 50;
      const orders = await storage.getOrders(customerId, limit);
      res.json(orders);
    } catch (error) {
      console.error("Orders fetch error:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // AI-powered natural language to rules conversion
  app.post("/api/ai/convert-rules", async (req, res) => {
    try {
      const { description } = req.body;
      if (!description) {
        return res.status(400).json({ message: "Description is required" });
      }
      
      const rules = await convertNaturalLanguageToRules(description);
      res.json({ rules });
    } catch (error) {
      console.error("Rules conversion error:", error);
      res.status(500).json({ message: "Failed to convert description to rules" });
    }
  });

  // AI message generation
  app.post("/api/ai/generate-messages", async (req, res) => {
    try {
      const { objective, audienceDescription } = req.body;
      if (!objective) {
        return res.status(400).json({ message: "Objective is required" });
      }
      
      const messages = await generateMessageVariants(objective, audienceDescription);
      res.json({ messages });
    } catch (error) {
      console.error("Message generation error:", error);
      res.status(500).json({ message: "Failed to generate messages" });
    }
  });

  // Audience preview
  app.post("/api/campaigns/preview-audience", async (req, res) => {
    try {
      const { rules } = req.body;
      const customers = await storage.getCustomersBySegment(rules as SegmentRule[]);
      
      const breakdown = {
        highSpenders: customers.filter(c => parseFloat(c.totalSpend) > 10000).length,
        lowFrequency: customers.filter(c => c.visitCount <= 3).length,
        inactive: customers.filter(c => {
          if (!c.lastOrderDate) return true;
          const daysSince = (Date.now() - new Date(c.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24);
          return daysSince > 90;
        }).length,
      };
      
      res.json({
        size: customers.length,
        breakdown,
        customers: customers.slice(0, 10), // Return first 10 for preview
      });
    } catch (error) {
      console.error("Audience preview error:", error);
      res.status(500).json({ message: "Failed to preview audience" });
    }
  });

  // Campaign management
  app.get("/api/campaigns", async (req, res) => {
    try {
      // For demo, use user ID 1
      const userId = 1;
      const campaigns = await storage.getCampaigns(userId);
      
      // Enrich with stats
      const enrichedCampaigns = await Promise.all(
        campaigns.map(async (campaign) => {
          const stats = await storage.getCampaignStats(campaign.id);
          return { ...campaign, ...stats };
        })
      );
      
      res.json(enrichedCampaigns);
    } catch (error) {
      console.error("Campaigns fetch error:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const campaignData = insertCampaignSchema.parse({
        ...req.body,
        userId: 1, // For demo, use user ID 1
      });
      
      const campaign = await storage.createCampaign(campaignData);
      
      // If status is not draft, launch the campaign
      if (campaign.status !== "draft") {
        await launchCampaign(campaign.id);
      }
      
      res.json(campaign);
    } catch (error) {
      console.error("Campaign creation error:", error);
      res.status(400).json({ message: "Invalid campaign data" });
    }
  });

  app.patch("/api/campaigns/:id/launch", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      
      const campaign = await storage.updateCampaign(campaignId, {
        status: "running",
        launchedAt: new Date(),
      });
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      // Launch the campaign
      await launchCampaign(campaignId);
      
      res.json(campaign);
    } catch (error) {
      console.error("Campaign launch error:", error);
      res.status(500).json({ message: "Failed to launch campaign" });
    }
  });

  // Delivery receipt API (called by vendor)
  app.post("/api/delivery-receipt", async (req, res) => {
    try {
      const { logId, status, timestamp } = req.body;
      
      const log = await storage.updateCommunicationLog(parseInt(logId), {
        status,
        deliveredAt: status === "delivered" ? new Date(timestamp) : undefined,
      });
      
      if (!log) {
        return res.status(404).json({ message: "Communication log not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Delivery receipt error:", error);
      res.status(500).json({ message: "Failed to update delivery status" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      // For demo, use user ID 1
      const userId = 1;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Campaign launch helper function
  async function launchCampaign(campaignId: number) {
    try {
      const campaign = await storage.getCampaign(campaignId);
      if (!campaign) throw new Error("Campaign not found");
      
      // Get target audience based on campaign rules
      const customers = await storage.getCustomersBySegment(campaign.rules as SegmentRule[]);
      
      // Create communication logs and send messages
      for (const customer of customers) {
        const personalizedMessage = campaign.message.replace(/\{\{name\}\}/g, customer.name);
        
        const log = await storage.createCommunicationLog({
          campaignId: campaign.id,
          customerId: customer.id,
          message: personalizedMessage,
          status: "pending",
        });
        
        // Send message via vendor API (async)
        sendMessage({
          to: customer.email,
          message: personalizedMessage,
          logId: log.id,
        }).catch(console.error);
      }
      
      // Update campaign status
      await storage.updateCampaign(campaignId, { status: "completed" });
    } catch (error) {
      console.error("Campaign launch error:", error);
      await storage.updateCampaign(campaignId, { status: "failed" });
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
