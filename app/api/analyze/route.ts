import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import type { AnalysisResult } from "@/lib/analysis";

const schema = z.object({
  text: z.string().min(40).max(8000),
});

const resultSchema = z.object({
  summary: z.string(),
  codes: z.array(z.object({
    code: z.string(),
    frequency: z.number(),
    evidence: z.array(z.string()),
  })),
  masterThemes: z.array(z.object({
    name: z.string(),
    summary: z.string(),
    codes: z.array(z.string()),
  })),
  superordinateThemes: z.array(z.object({
    name: z.string(),
    summary: z.string(),
    codes: z.array(z.string()),
  })),
  recommendations: z.array(z.string()),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = schema.parse(await request.json());
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 500 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are an expert qualitative research assistant. Return only valid JSON matching this shape: {summary:string,codes:[{code:string,frequency:number,evidence:string[]}],masterThemes:[{name:string,summary:string,codes:string[]}],superordinateThemes:[{name:string,summary:string,codes:string[]}],recommendations:string[]}. Use concise, defensible language and quote short evidence snippets only.",
        },
        {
          role: "user",
          content: `Analyze this qualitative text thematically:\n\n${input.text}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message.content ?? "{}";
    const result = resultSchema.parse(JSON.parse(raw)) as AnalysisResult;

    const rows = await sql`
      insert into analyses (user_id, transcript, result, total_codes, master_theme_count, superordinate_theme_count)
      values (
        ${user.id},
        ${input.text},
        ${JSON.stringify(result)}::jsonb,
        ${result.codes.length},
        ${result.masterThemes.length},
        ${result.superordinateThemes.length}
      )
      returning id::text, created_at::text
    ` as { id: string; created_at: string }[];

    return NextResponse.json({ id: rows[0]?.id, created_at: rows[0]?.created_at, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to analyze text.";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
