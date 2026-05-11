import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "API is running", version: "0.1.0" });
}
