import { NextResponse } from "next/server";
import { InventoryService } from "@/services/inventoryService";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const body = await req.json();
    const result = await InventoryService.addProduct(body);
    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { id, ...updateData } = await req.json();
    if (!id || !ObjectId.isValid(id)) throw new Error("Invalid Product ID");
    
    await InventoryService.updateProduct(id, updateData);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const products = await InventoryService.getInventory();
    return NextResponse.json({ success: true, products });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}