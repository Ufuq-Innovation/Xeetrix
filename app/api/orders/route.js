import { NextResponse } from "next/server";
import { OrderService } from "@/services/orderService";
import { ObjectId } from "mongodb";

/**
 * API Routes for Order Management
 * All business logic is isolated in OrderService
 */

export async function POST(req) {
  try {
    const body = await req.json();
    const id = await OrderService.createOrder(body);
    return NextResponse.json({ success: true, id });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const orders = await OrderService.getAllOrders();
    return NextResponse.json({ success: true, orders });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { id, status } = await req.json();
    if (!id || !ObjectId.isValid(id)) throw new Error("Invalid ID provided");
    
    await OrderService.updateStatus(id, status);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id || !ObjectId.isValid(id)) throw new Error("Invalid ID provided");

    const result = await OrderService.deleteOrder(id);
    return NextResponse.json({ success: result.deletedCount === 1 });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}