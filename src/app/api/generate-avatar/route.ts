import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { generateAvatar } from "@/lib/services";

export async function POST(req: NextRequest) {
  const payload = (await req.json()) as Record<string, unknown>;
  const response = await generateAvatar({
    prompt: String(payload.prompt ?? ""),
    seed: typeof payload.seed === "number" ? payload.seed : null,
    steps: Number(payload.steps ?? 28),
    guidance: Number(payload.guidance ?? 7),
    model: String(payload.model ?? "aurora-v1"),
    width: Number(payload.width ?? 512),
    height: Number(payload.height ?? 512),
    styleId: typeof payload.styleId === "string" ? payload.styleId : undefined,
    palette: typeof payload.palette === "string" ? payload.palette : undefined,
    accessories: typeof payload.accessories === "string" ? payload.accessories : undefined,
    background: typeof payload.background === "string" ? payload.background : undefined,
  });
  return NextResponse.json(response);
}

