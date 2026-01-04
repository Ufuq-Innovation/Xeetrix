import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("xeetrix"); 
    const body = await req.json();

    const result = await db.collection("inventory").insertOne({
      name: body.name,
      sku: body.sku,
      stock: Number(body.stock),
      costPrice: Number(body.costPrice || 0), // নতুন ফিল্ড
      sellingPrice: Number(body.sellingPrice || 0), // নতুন ফিল্ড
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId });
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