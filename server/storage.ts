import { 
  users, customers, orders, campaigns, communicationLogs,
  type User, type InsertUser, type Customer, type InsertCustomer,
  type Order, type InsertOrder, type Campaign, type InsertCampaign,
  type CommunicationLog, type InsertCommunicationLog, type SegmentRule
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, gte, lte, gt, lt, ne, sql, count } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Customers
  getCustomers(limit?: number, offset?: number): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<Customer>): Promise<Customer | undefined>;
  getCustomersBySegment(rules: SegmentRule[]): Promise<Customer[]>;

  // Orders
  getOrders(customerId?: number, limit?: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;

  // Campaigns
  getCampaigns(userId: number, limit?: number): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<Campaign>): Promise<Campaign | undefined>;

  // Communication Logs
  getCommunicationLogs(campaignId: number): Promise<CommunicationLog[]>;
  createCommunicationLog(log: InsertCommunicationLog): Promise<CommunicationLog>;
  updateCommunicationLog(id: number, log: Partial<CommunicationLog>): Promise<CommunicationLog | undefined>;
  getCampaignStats(campaignId: number): Promise<{ sent: number; delivered: number; failed: number }>;

  // Dashboard stats
  getDashboardStats(userId: number): Promise<{
    totalCampaigns: number;
    messagesSent: number;
    activeCustomers: number;
    deliveryRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getCustomers(limit = 50, offset = 0): Promise<Customer[]> {
    return await db.select().from(customers).limit(limit).offset(offset).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.email, email));
    return customer || undefined;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db.insert(customers).values(insertCustomer).returning();
    return customer;
  }

  async updateCustomer(id: number, customer: Partial<Customer>): Promise<Customer | undefined> {
    const [updated] = await db.update(customers).set(customer).where(eq(customers.id, id)).returning();
    return updated || undefined;
  }

  async getCustomersBySegment(rules: SegmentRule[]): Promise<Customer[]> {
    if (rules.length === 0) return [];

    // Build dynamic where clause based on rules
    const conditions = rules.map((rule, index) => {
      let condition;
      const value = rule.field.includes('Spend') || rule.field.includes('amount') 
        ? parseFloat(rule.value) 
        : parseInt(rule.value) || rule.value;

      switch (rule.field) {
        case 'totalSpend':
          switch (rule.operator) {
            case '>': condition = gt(customers.totalSpend, value.toString()); break;
            case '>=': condition = gte(customers.totalSpend, value.toString()); break;
            case '<': condition = lt(customers.totalSpend, value.toString()); break;
            case '<=': condition = lte(customers.totalSpend, value.toString()); break;
            case '=': condition = eq(customers.totalSpend, value.toString()); break;
            case '!=': condition = ne(customers.totalSpend, value.toString()); break;
            default: return null;
          }
          break;
        case 'visitCount':
          switch (rule.operator) {
            case '>': condition = gt(customers.visitCount, value as number); break;
            case '>=': condition = gte(customers.visitCount, value as number); break;
            case '<': condition = lt(customers.visitCount, value as number); break;
            case '<=': condition = lte(customers.visitCount, value as number); break;
            case '=': condition = eq(customers.visitCount, value as number); break;
            case '!=': condition = ne(customers.visitCount, value as number); break;
            default: return null;
          }
          break;
        case 'segment':
          switch (rule.operator) {
            case '=': condition = eq(customers.segment, rule.value); break;
            case '!=': condition = ne(customers.segment, rule.value); break;
            default: return null;
          }
          break;
        case 'lastOrderDate':
          // For date comparisons, treat value as days ago
          const daysAgo = new Date(Date.now() - (value as number) * 24 * 60 * 60 * 1000);
          switch (rule.operator) {
            case '>': condition = lt(customers.lastOrderDate, daysAgo); break; // More days ago means earlier date
            case '>=': condition = lte(customers.lastOrderDate, daysAgo); break;
            case '<': condition = gt(customers.lastOrderDate, daysAgo); break;
            case '<=': condition = gte(customers.lastOrderDate, daysAgo); break;
            default: return null;
          }
          break;
        default:
          return null;
      }

      return condition;
    }).filter(Boolean);

    if (conditions.length === 0) return [];

    // For simplicity, we'll use AND logic for now
    // In a real implementation, you'd parse the connector logic
    const whereClause = conditions.length === 1 ? conditions[0]! : and(...conditions.filter(c => c !== null));
    
    return await db.select().from(customers).where(whereClause);
  }

  async getOrders(customerId?: number, limit = 50): Promise<Order[]> {
    const query = db.select().from(orders);
    
    if (customerId) {
      return await query.where(eq(orders.customerId, customerId)).limit(limit).orderBy(desc(orders.createdAt));
    }
    
    return await query.limit(limit).orderBy(desc(orders.createdAt));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    
    // Update customer stats
    const [customer] = await db.select().from(customers).where(eq(customers.id, insertOrder.customerId));
    if (customer) {
      await db.update(customers)
        .set({
          totalSpend: sql`${customers.totalSpend} + ${insertOrder.amount}`,
          visitCount: sql`${customers.visitCount} + 1`,
          lastOrderDate: new Date(),
        })
        .where(eq(customers.id, insertOrder.customerId));
    }
    
    return order;
  }

  async getCampaigns(userId: number, limit = 50): Promise<Campaign[]> {
    return await db.select().from(campaigns)
      .where(eq(campaigns.userId, userId))
      .limit(limit)
      .orderBy(desc(campaigns.createdAt));
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign || undefined;
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db.insert(campaigns).values(insertCampaign).returning();
    return campaign;
  }

  async updateCampaign(id: number, campaign: Partial<Campaign>): Promise<Campaign | undefined> {
    const [updated] = await db.update(campaigns).set(campaign).where(eq(campaigns.id, id)).returning();
    return updated || undefined;
  }

  async getCommunicationLogs(campaignId: number): Promise<CommunicationLog[]> {
    return await db.select().from(communicationLogs)
      .where(eq(communicationLogs.campaignId, campaignId))
      .orderBy(desc(communicationLogs.createdAt));
  }

  async createCommunicationLog(insertLog: InsertCommunicationLog): Promise<CommunicationLog> {
    const [log] = await db.insert(communicationLogs).values(insertLog).returning();
    return log;
  }

  async updateCommunicationLog(id: number, log: Partial<CommunicationLog>): Promise<CommunicationLog | undefined> {
    const [updated] = await db.update(communicationLogs).set(log).where(eq(communicationLogs.id, id)).returning();
    return updated || undefined;
  }

  async getCampaignStats(campaignId: number): Promise<{ sent: number; delivered: number; failed: number }> {
    const [sentCount] = await db.select({ count: count() })
      .from(communicationLogs)
      .where(and(eq(communicationLogs.campaignId, campaignId), eq(communicationLogs.status, 'sent')));

    const [deliveredCount] = await db.select({ count: count() })
      .from(communicationLogs)
      .where(and(eq(communicationLogs.campaignId, campaignId), eq(communicationLogs.status, 'delivered')));

    const [failedCount] = await db.select({ count: count() })
      .from(communicationLogs)
      .where(and(eq(communicationLogs.campaignId, campaignId), eq(communicationLogs.status, 'failed')));

    return {
      sent: sentCount.count,
      delivered: deliveredCount.count,
      failed: failedCount.count,
    };
  }

  async getDashboardStats(userId: number): Promise<{
    totalCampaigns: number;
    messagesSent: number;
    activeCustomers: number;
    deliveryRate: number;
  }> {
    const [campaignCount] = await db.select({ count: count() })
      .from(campaigns)
      .where(eq(campaigns.userId, userId));

    const [messageCount] = await db.select({ count: count() })
      .from(communicationLogs)
      .innerJoin(campaigns, eq(communicationLogs.campaignId, campaigns.id))
      .where(eq(campaigns.userId, userId));

    const [customerCount] = await db.select({ count: count() })
      .from(customers)
      .where(gte(customers.lastOrderDate, new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))); // Last 90 days

    const [deliveredCount] = await db.select({ count: count() })
      .from(communicationLogs)
      .innerJoin(campaigns, eq(communicationLogs.campaignId, campaigns.id))
      .where(and(eq(campaigns.userId, userId), eq(communicationLogs.status, 'delivered')));

    const deliveryRate = messageCount.count > 0 ? (deliveredCount.count / messageCount.count) * 100 : 0;

    return {
      totalCampaigns: campaignCount.count,
      messagesSent: messageCount.count,
      activeCustomers: customerCount.count,
      deliveryRate: Math.round(deliveryRate * 10) / 10,
    };
  }
}

export const storage = new DatabaseStorage();
