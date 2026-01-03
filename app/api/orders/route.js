import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("xeetrix"); 
    const body = await req.json();

    console.log("Received Order Data:", body); // ভার্সেল লগে ডাটা চেক করার জন্য

    const result = await db.collection("orders").insertOne({
      ...body,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (e) {
    console.error("Database Error:", e.message);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}