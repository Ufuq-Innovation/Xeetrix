import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

// সব প্রোডাক্ট লিস্ট পাওয়ার জন্য
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

// নতুন প্রোডাক্ট যোগ করার জন্য
export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("xeetrix");
    const body = await req.json();

    const result = await db.collection("inventory").insertOne({
      ...body,
      stock: Number(body.stock),
      minStock: Number(body.minStock || 5), // স্টক ৫ এর নিচে নামলে ওয়ার্নিং দিবে
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}