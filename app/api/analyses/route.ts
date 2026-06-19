import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import type { AnalysisHistoryItem } from "@/lib/analysis";

export async function GET() {
  try {
    const user = await requireUser();
    const rows = await sql`
      select
        id::text,
        created_at::text,
        result->>'summary' as summary,
        total_codes,
        master_theme_count,
        superordinate_theme_count
      from analyses
      where user_id = ${user.id}
      order by created_at desc
      limit 25
    ` as AnalysisHistoryItem[];

    return NextResponse.json({ analyses: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load analysis history.";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 400 });
  }
}
