import { NextResponse } from "next/server";
import { DashboardService } from "@/services/dashboardService";

/**
 * API route to fetch business summary statistics
 */
export async function GET() {
  try {
    const stats = await DashboardService.getStats();
    
    return NextResponse.json({
      success: true,
      stats
    });
  } catch (e) {
    return NextResponse.json({ 
      success: false, 
      error: e.message 
    }, { status: 500 });
  }
}