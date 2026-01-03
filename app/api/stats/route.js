import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("xeetrix");

    // সব অর্ডার নিয়ে আসা
    const orders = await db.collection("orders").find({}).toArray();

    // হিসাব নিকাশ
    const totalSales = orders.reduce((sum, order) => sum + (order.sellingPrice * order.quantity), 0);
    const totalProfit = orders.reduce((sum, order) => sum + (order.netProfit || 0), 0);
    const totalOrders = orders.length;

    return NextResponse.json({
      success: true,
      stats: {
        totalSales,
        totalProfit,
        totalOrders
      }
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}