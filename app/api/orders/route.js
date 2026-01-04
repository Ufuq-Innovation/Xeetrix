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

// নতুন সংশোধিত DELETE মেথড (স্টক রিভার্সাল লজিকসহ)
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("xeetrix");

    // ১. ডিলিট করার আগে অর্ডারের ডিটেইলস খুঁজে বের করা (স্টক ফেরত দেওয়ার জন্য)
    const orderToDelete = await db.collection("orders").findOne({ _id: new ObjectId(id) });

    if (!orderToDelete) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // ২. ইনভেন্টরিতে স্টক ফেরত (প্লাস) করা
    if (orderToDelete.productId && ObjectId.isValid(orderToDelete.productId)) {
      await db.collection("inventory").updateOne(
        { _id: new ObjectId(orderToDelete.productId) },
        { $inc: { stock: Number(orderToDelete.quantity) } }
      );
    }
    
    // ৩. এবার মেইন অর্ডারটি ডিলিট করা
    const result = await db.collection("orders").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "Delete failed" }, { status: 500 });
    }
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}