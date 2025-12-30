
import dbConnect from "../../../lib/mongodb";
import Trade from "../../../models/trade";
import { calculateTradeStats } from "../../../lib/calculations";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const trades = await Trade.find({}).sort({ entryDate: -1 }).limit(50);
    return NextResponse.json({ success: true, data: trades });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const rawData = await req.json();
    
    // টাইপ কনভার্সন (String to Number)
    const formattedData = {
      ...rawData,
      entryPrice: Number(rawData.entryPrice),
      exitPrice: Number(rawData.exitPrice),
      lotSize: Number(rawData.lotSize),
      sl: Number(rawData.sl || 0),
      tp: Number(rawData.tp || 0),
    };

    const stats = calculateTradeStats(formattedData);
    const trade = await Trade.create({ ...formattedData, ...stats });
    return NextResponse.json({ success: true, data: trade });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}

export async function DELETE(req) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    await dbConnect();
    await Trade.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}
