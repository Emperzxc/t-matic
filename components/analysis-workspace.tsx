"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Download, FileQuestion, FileText, ImageIcon, Layers3, Lightbulb, Loader2, Lock, Network, Quote, Sparkles, TableProperties, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { AnalysisResult } from "@/lib/analysis";
import type { SessionUser } from "@/lib/auth";

const maxChars = 8000;

export function AnalysisWorkspace({ user }: { user: SessionUser | null }) {
  const [text, setText] = React.useState("");
  const [result, setResult] = React.useState<AnalysisResult | null>(null);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function analyze() {
    setError("");
    if (!user) {
      window.location.href = `/login?next=${encodeURIComponent("/")}`;
      return;
    }
    if (text.trim().length < 40) {
      setError("Paste at least 40 characters of transcript text to analyze.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Analysis failed.");
      setResult(body.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm font-semibold text-slate-600 shadow-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            AI-assisted qualitative coding
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
              Turn interview transcripts into defensible themes.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Paste qualitative data and T-Matic extracts codes, master themes,
              superordinate themes, evidence snippets, and next-step insights.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Codes", Tags],
              ["Theme maps", Network],
              ["Insights", Lightbulb],
            ].map(([label, Icon]) => (
              <div key={label as string} className="rounded-lg border bg-white p-4 shadow-sm">
                <Icon className="mb-3 h-5 w-5 text-primary" />
                <p className="font-bold">{label as string}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Analysis Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={text}
              maxLength={maxChars}
              onChange={(event) => setText(event.target.value)}
              placeholder="Paste your interview transcript, focus group notes, or open-ended survey responses here..."
              className="min-h-[280px] resize-y"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">{text.length.toLocaleString()} / {maxChars.toLocaleString()}</p>
              <Button onClick={analyze} disabled={loading} size="lg" className="w-full sm:w-auto">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : user ? <Sparkles className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                {user ? "Analyze Themes" : "Login to Analyze"}
              </Button>
            </div>
            {!user ? (
              <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Login is required before analysis. Admin tools are available only to super admins.
                  <Link href="/login" className="ml-1 font-bold underline">Sign in</Link>
                </p>
              </div>
            ) : null}
            {error ? (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-5">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="text-3xl font-black text-slate-900">Thematic Analysis Results</h2>
          <p className="text-muted-foreground">Structured outputs for review, refinement, and reporting.</p>
        </div>
        {result ? <Results result={result} /> : <EmptyResults />}
      </section>
    </section>
  );
}

function EmptyResults() {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed bg-white p-8 text-center">
      <FileQuestion className="mb-4 h-12 w-12 text-slate-400" />
      <p className="text-lg font-semibold text-slate-700">No results yet.</p>
      <p className="mt-1 text-muted-foreground">Paste text and click “Analyze Themes”.</p>
    </div>
  );
}

function Results({ result }: { result: AnalysisResult }) {
  const reportRef = React.useRef<HTMLDivElement>(null);

  function exportCsv() {
    const rows = [
      ["Section", "Name", "Frequency", "Summary", "Codes", "Evidence"],
      ["Summary", "Research Summary", "", result.summary, "", ""],
      ...result.codes.map((item) => [
        "Code",
        item.code,
        String(item.frequency),
        "",
        "",
        item.evidence.join(" | "),
      ]),
      ...result.masterThemes.map((theme) => [
        "Master Theme",
        theme.name,
        "",
        theme.summary,
        theme.codes.join(" | "),
        "",
      ]),
      ...result.superordinateThemes.map((theme) => [
        "Superordinate Theme",
        theme.name,
        "",
        theme.summary,
        theme.codes.join(" | "),
        "",
      ]),
      ...result.recommendations.map((item) => ["Recommendation", item, "", "", "", ""]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), "t-matic-analysis.csv");
  }

  function exportPdf() {
    const markup = reportRef.current?.innerHTML ?? "";
    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=960,height=720");
    if (!printWindow) return;
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>T-Matic Thematic Analysis</title>
          <style>
            body { font-family: "Hanken Grotesk", Arial, sans-serif; margin: 32px; color: #172033; background: #fff; }
            h1, h2, h3 { color: #840000; }
            .no-export { display: none !important; }
            .shadow-soft, .shadow-sm { box-shadow: none !important; }
            * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          </style>
        </head>
        <body>${markup}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => printWindow.print(), 300);
  }

  async function exportImage() {
    const node = reportRef.current;
    if (!node) return;
    const html = node.outerHTML;
    const width = 1200;
    const height = Math.max(900, node.scrollHeight + 80);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; background: #f8fafc; padding: 32px; color: #172033;">
            <style>
              .no-export { display: none !important; }
              .grid { display: grid; gap: 20px; }
              .rounded-lg, .rounded-md { border-radius: 8px; }
              .border { border: 1px solid #e2e8f0; }
              .bg-white { background: #fff; }
              .p-3 { padding: 12px; } .p-4 { padding: 16px; } .p-5 { padding: 20px; } .p-6 { padding: 24px; }
              .text-slate-900 { color: #0f172a; } .text-slate-700 { color: #334155; } .text-muted-foreground { color: #64748b; }
              .font-black { font-weight: 900; } .font-bold { font-weight: 700; } .font-semibold { font-weight: 600; }
            </style>
            ${html}
          </div>
        </foreignObject>
      </svg>
    `;
    const image = new Image();
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = reject;
      image.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = "#f8fafc";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0);
    URL.revokeObjectURL(url);
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, "t-matic-analysis.png");
    }, "image/png");
  }

  return (
    <div ref={reportRef} className="grid gap-5">
      <Card className="overflow-hidden border-red-100 bg-[linear-gradient(135deg,#fff_0%,#fff7f7_48%,#f0fdfa_100%)] shadow-soft">
        <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-normal text-primary">Analysis report</p>
            <CardTitle className="mt-2 text-2xl">Research Summary</CardTitle>
          </div>
          <div className="no-export flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={exportPdf}>
              <FileText className="h-4 w-4" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <TableProperties className="h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportImage}>
              <ImageIcon className="h-4 w-4" />
              Image
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 lg:grid-cols-[1fr_260px]">
          <div className="rounded-lg border border-red-100 bg-white/85 p-5">
            <Quote className="mb-3 h-6 w-6 text-primary" />
            <p className="text-lg leading-8 text-slate-700">{result.summary}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <ResultStat label="Codes" value={result.codes.length} tone="from-red-900 to-red-700" />
            <ResultStat label="Master themes" value={result.masterThemes.length} tone="from-teal-700 to-teal-500" />
            <ResultStat label="Superordinate" value={result.superordinateThemes.length} tone="from-amber-600 to-amber-400" />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-5 lg:grid-cols-3">
        <ThemePanel title="Top Codes" icon={<Tags className="h-5 w-5" />} accent="border-red-100 bg-red-50/60 text-red-900">
          {result.codes.map((item) => (
            <div key={item.code} className="rounded-md border border-red-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold">{item.code}</p>
                <Badge className="border-red-200 bg-red-50 text-red-800" variant="outline">{item.frequency}</Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.evidence[0]}</p>
            </div>
          ))}
        </ThemePanel>
        <ThemePanel title="Master Themes" icon={<Layers3 className="h-5 w-5" />} accent="border-teal-100 bg-teal-50/70 text-teal-900">
          {result.masterThemes.map((theme) => <ThemeItem key={theme.name} theme={theme} tone="teal" />)}
        </ThemePanel>
        <ThemePanel title="Superordinate Themes" icon={<Network className="h-5 w-5" />} accent="border-amber-100 bg-amber-50/80 text-amber-900">
          {result.superordinateThemes.map((theme) => <ThemeItem key={theme.name} theme={theme} tone="amber" />)}
        </ThemePanel>
      </div>
      <Card className="border-indigo-100 bg-[linear-gradient(135deg,#ffffff_0%,#eef2ff_100%)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-indigo-700" />
            Analytic Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-2">
            {result.recommendations.map((item) => (
              <li key={item} className="rounded-md border border-indigo-100 bg-white/90 p-4 text-sm leading-6 text-slate-700 shadow-sm">{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function ResultStat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className={`rounded-lg bg-gradient-to-br ${tone} p-4 text-white shadow-sm`}>
      <p className="text-xs font-black uppercase tracking-normal text-white/75">{label}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
    </div>
  );
}

function ThemePanel({ title, icon, children, accent }: { title: string; icon: React.ReactNode; children: React.ReactNode; accent: string }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className={accent}>
        <CardTitle className="flex items-center gap-2 text-lg">{icon}{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 bg-white p-4">{children}</CardContent>
    </Card>
  );
}

function ThemeItem({ theme, tone }: { theme: { name: string; summary: string; codes: string[] }; tone: "teal" | "amber" }) {
  const badgeClass = tone === "teal"
    ? "border-teal-200 bg-teal-50 text-teal-800"
    : "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <div className="rounded-md border bg-white p-4 shadow-sm">
      <p className="font-bold">{theme.name}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{theme.summary}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {theme.codes.map((code) => <Badge key={code} variant="outline" className={badgeClass}>{code}</Badge>)}
      </div>
    </div>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
