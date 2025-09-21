import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cluster } from "@/lib/services";

export async function POST(req: NextRequest) {
  const payload = (await req.json()) as { vectors?: unknown };
  const vectors = Array.isArray(payload.vectors) ? (payload.vectors as number[][]) : [];
  const response = await cluster({ vectors });
  return NextResponse.json(response);
}

