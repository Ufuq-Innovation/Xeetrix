// app/api/marketing/analytics/route.js

import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = process.env.MONGODB_DB || "xeetrix";

async function connectDB() {
  try {
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
    }
    return client.db(dbName);
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Database connection failed");
  }
}

export async function GET() {
  try {
    const db = await connectDB();
    const campaignsCollection = db.collection("marketing_campaigns");
    const contentCollection = db.collection("marketing_content");
    
    const [campaigns, content] = await Promise.all([
      campaignsCollection.find({}).toArray(),
      contentCollection.find({}).toArray()
    ]);
    
    // Calculate analytics
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
    const spentBudget = campaigns.reduce((sum, c) => sum + (c.spent || 0), 0);
    
    const totalContent = content.length;
    const activeContent = content.filter(c => c.status === 'active').length;
    const totalImpressions = content.reduce((sum, c) => sum + (c.impressions || 0), 0);
    const totalClicks = content.reduce((sum, c) => sum + (c.clicks || 0), 0);
    const clickRate = totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0;
    
    // Performance by type
    const performanceByType = {};
    content.forEach(item => {
      if (!performanceByType[item.type]) {
        performanceByType[item.type] = {
          count: 0,
          impressions: 0,
          clicks: 0
        };
      }
      performanceByType[item.type].count++;
      performanceByType[item.type].impressions += item.impressions || 0;
      performanceByType[item.type].clicks += item.clicks || 0;
    });
    
    // Recent activity
    const recentCampaigns = campaigns
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    
    const recentContent = content
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    
    const analytics = {
      overview: {
        totalCampaigns,
        activeCampaigns,
        totalBudget,
        spentBudget,
        totalContent,
        activeContent,
        totalImpressions,
        totalClicks,
        clickRate: clickRate.toFixed(2)
      },
      performanceByType,
      recentCampaigns,
      recentContent,
      timestamp: new Date()
    };
    
    return NextResponse.json({
      success: true,
      analytics
    });
    
  } catch (error) {
    console.error("GET analytics error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}