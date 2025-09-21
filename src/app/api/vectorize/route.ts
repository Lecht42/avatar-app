import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { vectorize } from "@/lib/services";

export async function POST(req: NextRequest) {
  const payload = (await req.json()) as Record<string, unknown>;
  const response = await vectorize({
    text: typeof payload.text === "string" ? payload.text : undefined,
    graph: payload.graph,
    imageBase64: typeof payload.imageBase64 === "string" ? payload.imageBase64 : undefined,
  });
  return NextResponse.json(response);
}

