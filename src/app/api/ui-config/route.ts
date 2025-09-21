import { NextResponse } from "next/server";
import { getUiConfig } from "@/lib/services";

export async function GET() {
  const config = await getUiConfig();
  return NextResponse.json(config);
}
