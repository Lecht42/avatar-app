import { NextResponse } from "next/server";
import { checkHealth } from "@/lib/services";

export async function GET() {
  const health = await checkHealth();
  return NextResponse.json(health);
}
