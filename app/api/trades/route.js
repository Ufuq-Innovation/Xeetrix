import dbConnect from "../../../lib/mongodb";
import Trade from "../../../models/Trade";
import { calculateTradeStats } from "../../../lib/calculations";
import { NextResponse } from "next/server";

// ১. ডাটাবেজ থেকে সব ট্রেড নিয়ে আসার জন্য (GET)
export async function GET() {
  try {
    await dbConnect();
    const trades = await Trade.find({}).sort({ entryDate: -1 });
    return NextResponse.json({ success: true, data: trades });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// ২. নতুন ট্রেড সেভ করার জন্য (POST)
export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();
    
    // লাভ-ক্ষতি হিসাব করা
    const stats = calculateTradeStats(data);
    
    const trade = await Trade.create({
      ...data,
      ...stats
    });
    
    return NextResponse.json({ success: true, data: trade });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}