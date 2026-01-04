import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb"; // যোগ করা হয়েছে

export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("xeetrix"); 
    const body = await req.json();

    const result = await db.collection("inventory").insertOne({
      ...body, // স্প্রেড অপারেটর যাতে সব নতুন ফিল্ড (description, category, source) সেভ হয়
      stock: Number(body.stock),
      costPrice: Number(body.costPrice || 0),
      sellingPrice: Number(body.sellingPrice || 0),
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// নতুন PUT মেথড যোগ করা হয়েছে এডিট করার জন্য
export async function PUT(req) {
  try {
    const client = await clientPromise;
    const db = client.db("xeetrix");
    const { id, ...updateData } = await req.json();

    const result = await db.collection("inventory").updateOne(
      { _id: new ObjectId(id) },
      { $set: { 
          ...updateData,
          stock: Number(updateData.stock),
          costPrice: Number(updateData.costPrice),
          sellingPrice: Number(updateData.sellingPrice)
        } 
      }
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("xeetrix");
    const products = await db.collection("inventory").find({}).sort({ _id: -1 }).toArray();
    return NextResponse.json({ success: true, products });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}