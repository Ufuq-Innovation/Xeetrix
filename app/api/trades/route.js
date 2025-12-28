import dbConnect from "@/lib/mongodb";
import Trade from "@/models/Trade";
import { calculateTradeStats } from "@/lib/calculations";
import { NextResponse } from "next/server";

// ১. ডাটাবেজ থেকে সব ট্রেড নিয়ে আসার জন্য (GET)
export async function GET() {
  try {
    await dbConnect();
    const trades = await Trade.find({}).sort({ entryDate: -1 }); // নতুন ট্রেডগুলো আগে দেখাবে
    return NextResponse.json({ success: true, data: trades });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// ২. নতুন ট্রেড সেভ করার জন্য (POST)
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    // আমাদের ক্যালকুলেশন ফাংশন ব্যবহার করে এক্সট্রা ডাটা জেনারেট করা
    const stats = calculateTradeStats(body);
    
    // মেইন ডাটার সাথে ক্যালকুলেটেড ডাটা যোগ করা
    const finalTradeData = { ...body, ...stats };

    const trade = await Trade.create(finalTradeData);
    return NextResponse.json({ success: true, data: trade }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}