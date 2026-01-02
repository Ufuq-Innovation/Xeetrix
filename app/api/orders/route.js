import dbConnect from "../../lib/mongodb";
import order from "../../models/order";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();
    
    // নিট লাভ হিসাব করার লজিক (Profit Engine)
    const totalSales = Number(data.sellingPrice) * Number(data.quantity);
    const totalCost = Number(data.costPrice) * Number(data.quantity);
    const totalExpenses = Number(data.courierCost) + Number(data.otherExpense);
    const netProfit = totalSales - (totalCost + totalExpenses);

    const order = await Order.create({ ...data, netProfit });
    return NextResponse.json({ success: true, data: order });
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