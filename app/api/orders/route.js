import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// ১. অর্ডার তৈরি (POST)
export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("xeetrix"); 
    const body = await req.json();

    // স্টক চেক
    if (body.productId && ObjectId.isValid(body.productId)) {
      const product = await db.collection("inventory").findOne({ _id: new ObjectId(body.productId) });
      if (!product || product.stock < Number(body.quantity)) {
        return NextResponse.json({ success: false, error: "Insufficient stock!" }, { status: 400 });
      }
    }

    // অর্ডার সেভ (ডিফল্ট স্ট্যাটাস 'Pending')
    const result = await db.collection("orders").insertOne({
      ...body,
      status: body.status || "Pending", 
      createdAt: new Date(),
    });

    // স্টক মাইনাস
    if (body.productId) {
      await db.collection("inventory").updateOne(
        { _id: new ObjectId(body.productId) },
        { $inc: { stock: -Number(body.quantity) } }
      );
    }

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (e) { return NextResponse.json({ success: false, error: e.message }, { status: 500 }); }
}

// ২. সব অর্ডার পড়া (GET)
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("xeetrix");
    const orders = await db.collection("orders").find({}).sort({ _id: -1 }).toArray();
    return NextResponse.json({ success: true, orders });
  } catch (e) { return NextResponse.json({ success: false, error: e.message }, { status: 500 }); }
}

// ৩. স্ট্যাটাস আপডেট ও স্টক অ্যাডজাস্টমেন্ট (PATCH) - এটি নতুন যোগ করা হয়েছে
export async function PATCH(req) {
  try {
    const client = await clientPromise;
    const db = client.db("xeetrix");
    const { id, status } = await req.json();

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
    }

    const oldOrder = await db.collection("orders").findOne({ _id: new ObjectId(id) });
    if (!oldOrder) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });

    // রিটার্ন লজিক: যদি স্ট্যাটাস 'Returned' হয়, স্টক ফেরত দিতে হবে
    if (status === "Returned" && oldOrder.status !== "Returned") {
      if (oldOrder.productId && ObjectId.isValid(oldOrder.productId)) {
        await db.collection("inventory").updateOne(
          { _id: new ObjectId(oldOrder.productId) },
          { $inc: { stock: Number(oldOrder.quantity) } }
        );
      }
    } 
    // যদি রিটার্ন হওয়া অর্ডার আবার অন্য স্ট্যাটাসে যায়, স্টক আবার মাইনাস হবে
    else if (oldOrder.status === "Returned" && status !== "Returned") {
       if (oldOrder.productId && ObjectId.isValid(oldOrder.productId)) {
        await db.collection("inventory").updateOne(
          { _id: new ObjectId(oldOrder.productId) },
          { $inc: { stock: -Number(oldOrder.quantity) } }
        );
      }
    }

    await db.collection("orders").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: status, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ success: false, error: e.message }, { status: 500 }); }
}

// ৪. অর্ডার ডিলিট (DELETE)
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("xeetrix");

    const orderToDelete = await db.collection("orders").findOne({ _id: new ObjectId(id) });
    if (!orderToDelete) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // স্টক রিভার্সাল (ডিলিট করলে স্টক ফেরত যাবে, যদি না সেটা আগেই রিটার্ন হয়ে থাকে)
    if (orderToDelete.status !== "Returned" && orderToDelete.productId && ObjectId.isValid(orderToDelete.productId)) {
      await db.collection("inventory").updateOne(
        { _id: new ObjectId(orderToDelete.productId) },
        { $inc: { stock: Number(orderToDelete.quantity) } }
      );
    }
    
    const result = await db.collection("orders").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: result.deletedCount === 1 });
  } catch (e) { return NextResponse.json({ success: false, error: e.message }, { status: 500 }); }
}