import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("xeetrix"); 
    const body = await req.json();

    // ১. আগে চেক করি ইনভেন্টরিতে পর্যাপ্ত স্টক আছে কি না
    if (body.productId && ObjectId.isValid(body.productId)) {
      const product = await db.collection("inventory").findOne({ 
        _id: new ObjectId(body.productId) 
      });

      if (!product) {
        return NextResponse.json({ success: false, error: "Product not found!" }, { status: 404 });
      }

      if (product.stock < Number(body.quantity)) {
        return NextResponse.json({ 
          success: false, 
          error: `Insufficient stock! Available: ${product.stock}` 
        }, { status: 400 });
      }
    }

    // ২. স্টক থাকলে এবার অর্ডার সেভ করা
    const result = await db.collection("orders").insertOne({
      ...body,
      createdAt: new Date(),
    });

    // ৩. ইনভেন্টরি থেকে স্টক কমানো
    if (body.productId) {
      await db.collection("inventory").updateOne(
        { _id: new ObjectId(body.productId) },
        { $inc: { stock: -Number(body.quantity) } }
      );
    }

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("xeetrix");
    const orders = await db.collection("orders").find({}).sort({ _id: -1 }).toArray();
    return NextResponse.json({ success: true, orders });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}