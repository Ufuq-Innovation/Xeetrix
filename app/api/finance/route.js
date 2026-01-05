import { NextResponse } from "next/server";
import { FinanceService } from "@/services/financeService";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const body = await req.json();
    const result = await FinanceService.addExpense(body);
    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const expenses = await FinanceService.getExpenses();
    return NextResponse.json({ success: true, expenses });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id || !ObjectId.isValid(id)) throw new Error("Invalid Transaction ID");

    await FinanceService.deleteExpense(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}