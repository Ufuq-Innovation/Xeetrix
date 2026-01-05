import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ status: "Xeetrix API is running" });
}