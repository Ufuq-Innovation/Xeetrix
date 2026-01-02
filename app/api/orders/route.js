import dbConnect from "../../../lib/mongodb";
import Order from "../../../models/Order";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const orders = await Order.find({}).sort({ entryDate: -1 });
    return NextResponse.json({ success: true, data: orders });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const rawData = await req.json();
    
    const cost = Number(rawData.entryPrice);
    const sell = Number(rawData.exitPrice);
    const qty = Number(rawData.lotSize);
    const profit = (sell - cost) * qty; // আসল প্রফিট ক্যালকুলেশন

    const order = await Order.create({
      ...rawData,
      pnl: profit,
      status: profit >= 0 ? 'Win' : 'Loss'
    });
    return NextResponse.json({ success: true, data: order });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}

export async function DELETE(req) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    await dbConnect();
    await Order.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}