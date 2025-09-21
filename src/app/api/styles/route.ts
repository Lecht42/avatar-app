import { NextResponse } from "next/server";
import { getStyles } from "@/lib/services";

export async function GET() {
  const styles = await getStyles();
  return NextResponse.json({ styles, fetchedAt: new Date().toISOString() });
}
