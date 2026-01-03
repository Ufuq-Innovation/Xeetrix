import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("xeetrix"); 
    const body = await req.json();

    console.log("Adding to Inventory:", body);

    // এখানে ভুল ছিল, "orders" এর বদলে "inventory" হবে
    const result = await db.collection("inventory").insertOne({
      name: body.name,
      sku: body.sku,
      stock: Number(body.stock), // নিশ্চিত করা হচ্ছে এটা নাম্বার
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (e) {
    console.error("Database Error:", e.message);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("xeetrix");
    // ইনভেন্টরি কালেকশন থেকে ডাটা আনা
    const products = await db.collection("inventory").find({}).sort({ _id: -1 }).toArray();
    return NextResponse.json({ success: true, products });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}