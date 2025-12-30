import dbConnect from "../../../lib/mongodb";
import Trade from "../../../models/trade"; // এখানে t ছোট হাতের
import { calculateTradeStats } from "../../../lib/calculations"; // এখানে c ছোট হাতের
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const trades = await Trade.find({}).sort({ entryDate: -1 });
    return NextResponse.json({ success: true, data: trades });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();
    const stats = calculateTradeStats(data);
    const trade = await Trade.create({ ...data, ...stats });
    return NextResponse.json({ success: true, data: trade });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
// DELETE: নির্দিষ্ট ট্রেড মুছে ফেলার জন্য
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await dbConnect();
    const deletedTrade = await Trade.findByIdAndDelete(id);
    
    if (!deletedTrade) {
      return NextResponse.json({ success: false, error: "Trade not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: "Trade deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}