import dbConnect from "@/lib/mongodb"; 
import Order from "@/model/orders";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();
    
    const totalSales = Number(data.sellingPrice) * Number(data.quantity);
    const totalCost = Number(data.costPrice) * Number(data.quantity);
    const totalExpenses = Number(data.courierCost) + Number(data.otherExpense);
    const netProfit = totalSales - (totalCost + totalExpenses);

    const newOrder = await Order.create({ ...data, netProfit }); // ভেরিয়েবল নাম পরিবর্তন করলাম ক্লারিটির জন্য
    return NextResponse.json({ success: true, data: newOrder });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: orders });
  } catch (e) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}