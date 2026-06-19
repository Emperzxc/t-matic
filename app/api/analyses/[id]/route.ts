import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import type { AnalysisResult } from "@/lib/analysis";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = paramsSchema.parse(await params);
    const rows = await sql`
      select
        id::text,
        created_at::text,
        result
      from analyses
      where id = ${id}
        and user_id = ${user.id}
      limit 1
    ` as { id: string; created_at: string; result: AnalysisResult }[];

    const analysis = rows[0];
    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found." }, { status: 404 });
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load analysis.";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 400 });
  }
}
