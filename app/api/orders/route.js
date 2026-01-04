import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("xeetrix"); 
    const body = await req.json();

    // ১. স্টক চেক
    if (body.productId && ObjectId.isValid(body.productId)) {
      const product = await db.collection("inventory").findOne({ _id: new ObjectId(body.productId) });
      if (!product || product.stock < Number(body.quantity)) {
        return NextResponse.json({ success: false, error: "Insufficient stock!" }, { status: 400 });
      }
    }

    // ২. অর্ডার সেভ
    const result = await db.collection("orders").insertOne({
      ...body,
      createdAt: new Date(),
    });

    // ৩. স্টক মাইনাস
    if (body.productId) {
      await db.collection("inventory").updateOne(
        { _id: new ObjectId(body.productId) },
        { $inc: { stock: -Number(body.quantity) } }
      );
    }

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (e) { return NextResponse.json({ success: false, error: e.message }, { status: 500 }); }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("xeetrix");
    const orders = await db.collection("orders").find({}).sort({ _id: -1 }).toArray();
    return NextResponse.json({ success: true, orders });
  } catch (e) { return NextResponse.json({ success: false, error: e.message }, { status: 500 }); }
}

// নতুন DELETE মেথড যোগ করা হয়েছে (হিস্ট্রি পেজ থেকে ডিলিট করার জন্য)
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("xeetrix");
    
    const result = await db.collection("orders").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}