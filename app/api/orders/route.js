import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// ১. সব অর্ডার দ্রুত নিয়ে আসার জন্য (GET)
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("xeetrix");

    // শুধু প্রয়োজনীয় ডাটা আনবে (Projection), এতে স্পিড বাড়বে
    const orders = await db.collection("orders")
      .find({})
      .project({ 
        customerName: 1, 
        customerPhone: 1, 
        productName: 1, 
        quantity: 1, 
        sellingPrice: 1, 
        netProfit: 1,
        createdAt: 1 
      })
      .sort({ _id: -1 }) // নতুনগুলো আগে
      .limit(50)         // আপাতত শেষ ৫০টি দেখাবে লোডিং টাইম কমাতে
      .toArray();

    return NextResponse.json({ success: true, orders });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// ২. অর্ডার সেভ এবং স্টক আপডেট করার জন্য (POST)
export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("xeetrix");
    const body = await req.json();

    // ট্রানজেকশন সিমুলেশন: আগে অর্ডার সেভ
    const orderResult = await db.collection("orders").insertOne({
      ...body,
      createdAt: new Date(),
    });

    // যদি প্রোডাক্ট আইডি থাকে, তবে স্টক থেকে বিয়োগ করা
    if (body.productId) {
      await db.collection("inventory").updateOne(
        { _id: new ObjectId(body.productId) },
        { $inc: { stock: -Number(body.quantity) } }
      );
    }

    return NextResponse.json({ success: true, id: orderResult.insertedId });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}