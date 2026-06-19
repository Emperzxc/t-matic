"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, CalendarClock, CheckCircle2, Eye, FileQuestion, FileText, ImageIcon, Layers3, Lightbulb, Loader2, Lock, Network, Quote, Sparkles, TableProperties, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { AnalysisHistoryItem, AnalysisResult } from "@/lib/analysis";
import type { SessionUser } from "@/lib/auth";

const maxChars = 8000;

export function AnalysisWorkspace({ user }: { user: SessionUser | null }) {
  const [text, setText] = React.useState("");
  const [result, setResult] = React.useState<AnalysisResult | null>(null);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [history, setHistory] = React.useState<AnalysisHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = React.useState(false);
  const [viewingId, setViewingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user) return;
    void loadHistory();
  }, [user?.id]);

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const response = await fetch("/api/analyses");
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Unable to load history.");
      setHistory(body.analyses ?? []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }

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
      if (body.id && body.created_at) {
        setHistory((items) => [
          {
            id: body.id,
            created_at: body.created_at,
            summary: body.result.summary,
            total_codes: body.result.codes.length,
            master_theme_count: body.result.masterThemes.length,
            superordinate_theme_count: body.result.superordinateThemes.length,
          },
          ...items.filter((item) => item.id !== body.id),
        ].slice(0, 25));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  async function viewAnalysis(id: string) {
    setError("");
    setViewingId(id);
    try {
      const response = await fetch(`/api/analyses/${id}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Unable to load analysis.");
      setResult(body.analysis.result);
      window.requestAnimationFrame(() => {
        document.getElementById("analysis-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load analysis.");
    } finally {
      setViewingId(null);
    }
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm font-semibold text-slate-600 shadow-sm dark:border-white/10 dark:bg-card dark:text-muted-foreground">
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
              <div key={label as string} className="rounded-lg border bg-white p-4 shadow-sm dark:border-white/10 dark:bg-card">
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
              <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Login is required before analysis. Admin tools are available only to super admins.
                  <Link href="/login" className="ml-1 font-bold underline">Sign in</Link>
                </p>
              </div>
            ) : null}
            {error ? (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {user ? (
        <HistoryPanel
          history={history}
          loading={historyLoading}
          viewingId={viewingId}
          onView={viewAnalysis}
        />
      ) : null}

      <section id="analysis-results" className="space-y-5 scroll-mt-24">
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
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed bg-white p-8 text-center dark:border-white/10 dark:bg-card">
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

  async function exportImage() {
    const { default: html2canvas } = await import("html2canvas");
    const { canvas, cleanup } = await captureDesktopReport(result, html2canvas);
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, "t-matic-analysis.png");
      cleanup();
    }, "image/png");
  }

  async function exportPdf() {
    const { default: html2canvas } = await import("html2canvas");
    const { default: jsPDF } = await import("jspdf");
    const { canvas, cleanup } = await captureDesktopReport(result, html2canvas);
    const image = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageHeight = (canvas.height * pageWidth) / canvas.width;
    let remainingHeight = imageHeight;
    let y = 0;

    pdf.addImage(image, "PNG", 0, y, pageWidth, imageHeight);
    remainingHeight -= pageHeight;

    while (remainingHeight > 0) {
      y -= pageHeight;
      pdf.addPage();
      pdf.addImage(image, "PNG", 0, y, pageWidth, imageHeight);
      remainingHeight -= pageHeight;
    }

    pdf.save("t-matic-analysis.pdf");
    cleanup();
  }

  return (
    <div ref={reportRef} className="grid gap-5">
      <Card className="overflow-hidden border-red-100 bg-[linear-gradient(135deg,#fff_0%,#fff7f7_48%,#f0fdfa_100%)] shadow-soft dark:border-white/10 dark:bg-[linear-gradient(135deg,#111827_0%,#1f1215_48%,#062b2a_100%)]">
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
          <div className="rounded-lg border border-red-100 bg-white/85 p-5 dark:border-white/10 dark:bg-card/85">
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
        <ThemePanel title="Top Codes" icon={<Tags className="h-5 w-5" />} accent="border-red-100 bg-red-50/60 text-red-900 dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-100">
          {result.codes.map((item) => (
            <div key={item.code} className="rounded-md border border-red-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-card">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold">{item.code}</p>
                <Badge className="border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200" variant="outline">{item.frequency}</Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.evidence[0]}</p>
            </div>
          ))}
        </ThemePanel>
        <ThemePanel title="Master Themes" icon={<Layers3 className="h-5 w-5" />} accent="border-teal-100 bg-teal-50/70 text-teal-900 dark:border-teal-900/50 dark:bg-teal-950/35 dark:text-teal-100">
          {result.masterThemes.map((theme) => <ThemeItem key={theme.name} theme={theme} tone="teal" />)}
        </ThemePanel>
        <ThemePanel title="Superordinate Themes" icon={<Network className="h-5 w-5" />} accent="border-amber-100 bg-amber-50/80 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-100">
          {result.superordinateThemes.map((theme) => <ThemeItem key={theme.name} theme={theme} tone="amber" />)}
        </ThemePanel>
      </div>
      <Card className="border-indigo-100 bg-[linear-gradient(135deg,#ffffff_0%,#eef2ff_100%)] dark:border-indigo-900/50 dark:bg-[linear-gradient(135deg,#111827_0%,#171b36_100%)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-indigo-700" />
            Analytic Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-2">
            {result.recommendations.map((item) => (
              <li key={item} className="rounded-md border border-indigo-100 bg-white/90 p-4 text-sm leading-6 text-slate-700 shadow-sm dark:border-white/10 dark:bg-card/90 dark:text-muted-foreground">{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function HistoryPanel({
  history,
  loading,
  viewingId,
  onView,
}: {
  history: AnalysisHistoryItem[];
  loading: boolean;
  viewingId: string | null;
  onView: (id: string) => void;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900">
            <CalendarClock className="h-6 w-6 text-primary" />
            Result History
          </h2>
          <p className="text-sm text-muted-foreground">Review previous analysis results from your account.</p>
        </div>
        <Badge variant="outline" className="w-fit border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
          {history.length} saved
        </Badge>
      </div>
      <Card className="overflow-hidden border-slate-200 shadow-sm dark:border-white/10">
        <CardContent className="p-4 sm:p-5">
          {loading ? (
            <div className="grid min-h-[140px] place-items-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : history.length ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {history.map((item) => (
                <div key={item.id} className="rounded-md border bg-white p-4 shadow-sm dark:border-white/10 dark:bg-card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-900">{formatHistoryDate(item.created_at)}</p>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{item.summary}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      disabled={viewingId === item.id}
                      onClick={() => onView(item.id)}
                    >
                      {viewingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                      View
                    </Button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline">{item.total_codes} codes</Badge>
                    <Badge variant="outline">{item.master_theme_count} master</Badge>
                    <Badge variant="outline">{item.superordinate_theme_count} super</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid min-h-[140px] place-items-center rounded-md border border-dashed bg-slate-50 text-center text-sm text-muted-foreground dark:border-white/10 dark:bg-secondary">
              Your saved results will appear here after you run an analysis.
            </div>
          )}
        </CardContent>
      </Card>
    </section>
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
      <CardContent className="grid gap-3 bg-white p-4 dark:bg-card">{children}</CardContent>
    </Card>
  );
}

function ThemeItem({ theme, tone }: { theme: { name: string; summary: string; codes: string[] }; tone: "teal" | "amber" }) {
  const badgeClass = tone === "teal"
    ? "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-200"
    : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200";

  return (
    <div className="rounded-md border bg-white p-4 shadow-sm dark:border-white/10 dark:bg-card">
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

function exportCanvasOptions() {
  return {
    backgroundColor: "#ffffff",
    scale: Math.min(window.devicePixelRatio || 2, 2),
    useCORS: true,
    ignoreElements: (element: Element) => element.classList.contains("no-export"),
  };
}

async function captureDesktopReport(
  result: AnalysisResult,
  html2canvas: (element: HTMLElement, options?: Record<string, unknown>) => Promise<HTMLCanvasElement>,
) {
  const node = buildDesktopExportReport(result);
  document.body.appendChild(node);
  await document.fonts?.ready;
  const canvas = await html2canvas(node, exportCanvasOptions());
  return {
    canvas,
    cleanup: () => node.remove(),
  };
}

function buildDesktopExportReport(result: AnalysisResult) {
  const root = document.createElement("div");
  root.style.position = "fixed";
  root.style.left = "-10000px";
  root.style.top = "0";
  root.style.width = "1200px";
  root.style.background = "#f8fafc";
  root.style.color = "#172033";
  root.style.padding = "32px";
  root.style.fontFamily = '"Hanken Grotesk", Arial, sans-serif';
  root.style.zIndex = "-1";
  root.innerHTML = `
    <section style="display:grid;gap:20px;width:1136px;">
      <div style="border:1px solid #fee2e2;background:linear-gradient(135deg,#ffffff 0%,#fff7f7 48%,#f0fdfa 100%);border-radius:8px;overflow:hidden;">
        <div style="display:flex;justify-content:space-between;gap:24px;padding:24px;">
          <div>
            <p style="margin:0;color:#840000;font-size:13px;font-weight:900;text-transform:uppercase;">Analysis report</p>
            <h1 style="margin:8px 0 0;font-size:28px;line-height:1.15;color:#172033;">Research Summary</h1>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 260px;gap:20px;padding:0 24px 24px;">
          <div style="border:1px solid #fee2e2;background:rgba(255,255,255,.9);border-radius:8px;padding:20px;">
            <p style="margin:0;font-size:18px;line-height:1.7;color:#334155;">${escapeHtml(result.summary)}</p>
          </div>
          <div style="display:grid;gap:12px;">
            ${exportStat("Codes", result.codes.length, "#7f1d1d", "#b91c1c")}
            ${exportStat("Master themes", result.masterThemes.length, "#0f766e", "#14b8a6")}
            ${exportStat("Superordinate", result.superordinateThemes.length, "#d97706", "#f59e0b")}
          </div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">
        ${exportPanel("Top Codes", "#fef2f2", "#7f1d1d", result.codes.map((item) => `
          <div style="border:1px solid #fee2e2;background:white;border-radius:6px;padding:16px;">
            <div style="display:flex;justify-content:space-between;gap:12px;">
              <strong>${escapeHtml(item.code)}</strong>
              <span style="border:1px solid #fecaca;background:#fef2f2;color:#991b1b;border-radius:999px;padding:2px 8px;font-size:12px;font-weight:700;">${item.frequency}</span>
            </div>
            <p style="margin:8px 0 0;color:#475569;font-size:14px;line-height:1.55;">${escapeHtml(item.evidence[0] ?? "")}</p>
          </div>
        `).join(""))}
        ${exportPanel("Master Themes", "#f0fdfa", "#134e4a", result.masterThemes.map((theme) => exportTheme(theme, "#ccfbf1", "#115e59")).join(""))}
        ${exportPanel("Superordinate Themes", "#fffbeb", "#78350f", result.superordinateThemes.map((theme) => exportTheme(theme, "#fde68a", "#92400e")).join(""))}
      </div>
      <div style="border:1px solid #c7d2fe;background:linear-gradient(135deg,#ffffff 0%,#eef2ff 100%);border-radius:8px;overflow:hidden;">
        <div style="padding:24px 24px 0;">
          <h2 style="margin:0;font-size:22px;color:#172033;">Analytic Recommendations</h2>
        </div>
        <ul style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;list-style:none;margin:0;padding:20px 24px 24px;">
          ${result.recommendations.map((item) => `<li style="border:1px solid #c7d2fe;background:rgba(255,255,255,.92);border-radius:6px;padding:16px;color:#334155;font-size:14px;line-height:1.55;">${escapeHtml(item)}</li>`).join("")}
        </ul>
      </div>
    </section>
  `;

  return root;
}

function exportStat(label: string, value: number, from: string, to: string) {
  return `
    <div style="border-radius:8px;background:linear-gradient(135deg,${from},${to});padding:16px;color:white;">
      <p style="margin:0;color:rgba(255,255,255,.78);font-size:12px;font-weight:900;text-transform:uppercase;">${escapeHtml(label)}</p>
      <p style="margin:4px 0 0;font-size:34px;font-weight:900;">${value}</p>
    </div>
  `;
}

function exportPanel(title: string, headerBg: string, headerColor: string, body: string) {
  return `
    <div style="border:1px solid #e2e8f0;background:white;border-radius:8px;overflow:hidden;">
      <div style="background:${headerBg};color:${headerColor};padding:18px 20px;">
        <h2 style="margin:0;font-size:20px;">${escapeHtml(title)}</h2>
      </div>
      <div style="display:grid;gap:12px;padding:16px;">${body}</div>
    </div>
  `;
}

function exportTheme(theme: { name: string; summary: string; codes: string[] }, badgeBg: string, badgeColor: string) {
  return `
    <div style="border:1px solid #e2e8f0;background:white;border-radius:6px;padding:16px;">
      <strong>${escapeHtml(theme.name)}</strong>
      <p style="margin:8px 0 0;color:#475569;font-size:14px;line-height:1.55;">${escapeHtml(theme.summary)}</p>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;">
        ${theme.codes.map((code) => `<span style="border:1px solid ${badgeBg};background:${badgeBg};color:${badgeColor};border-radius:999px;padding:2px 8px;font-size:12px;font-weight:700;">${escapeHtml(code)}</span>`).join("")}
      </div>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatHistoryDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
