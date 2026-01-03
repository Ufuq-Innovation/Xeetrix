import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb"; // নিশ্চিত করুন এই পাথটি ঠিক আছে

export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("Xeetrix"); // আপনার ডাটাবেস নাম
    const body = await req.json();

    const order = await db.collection("orders").insertOne({
      ...body,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, order });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}