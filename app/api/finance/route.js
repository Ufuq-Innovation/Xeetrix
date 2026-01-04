import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// ১. নতুন খরচ সেভ করা
export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("xeetrix");
    const body = await req.json();

    const result = await db.collection("expenses").insertOne({
      title: body.title,
      amount: Number(body.amount),
      category: body.category,
      date: body.date || new Date(),
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// ২. সব খরচের লিস্ট দেখা
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("xeetrix");
    const expenses = await db.collection("expenses").find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, expenses });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// ৩. খরচ ডিলিট করা
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const client = await clientPromise;
    const db = client.db("xeetrix");
    
    await db.collection("expenses").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}