import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { requireSuperAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { listUsers } from "@/lib/users";

type CodeFrequencyRow = { code: string; frequency: string };
type SubmissionRow = {
  id: string;
  email: string;
  created_at: string;
  summary: string;
  total_codes: string;
  master_theme_count: string;
  superordinate_theme_count: string;
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  let admin;
  try {
    admin = await requireSuperAdmin();
  } catch {
    redirect("/login?next=/admin");
  }

  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? 10);
  const codePage = safePositiveNumber(params.codePage, 1);
  const codePageSize = safePositiveNumber(params.codePageSize, 10);
  const submissionPage = safePositiveNumber(params.submissionPage, 1);
  const submissionPageSize = safePositiveNumber(params.submissionPageSize, 10);
  const codeSort = ["code", "frequency"].includes(params.codeSort ?? "") ? params.codeSort! : "frequency";
  const codeDir = params.codeDir === "asc" ? "asc" : "desc";
  const submissionSort = ["email", "created_at", "total_codes", "master_theme_count", "superordinate_theme_count"].includes(params.submissionSort ?? "")
    ? params.submissionSort!
    : "created_at";
  const submissionDir = params.submissionDir === "asc" ? "asc" : "desc";
  const users = await listUsers({
    q: params.q ?? "",
    role: params.role ?? "all",
    status: params.status ?? "all",
    sort: params.sort ?? "created_at",
    dir: params.dir ?? "desc",
    page: Number.isFinite(page) ? page : 1,
    pageSize: Number.isFinite(pageSize) ? pageSize : 10,
  });

  const metrics = await sql`
      select
        count(*)::text as total_analyses,
        coalesce(sum(total_codes), 0)::text as total_codes,
        coalesce(sum(master_theme_count), 0)::text as master_themes,
        coalesce(sum(superordinate_theme_count), 0)::text as superordinate_themes
      from analyses
    ` as unknown as { total_analyses: string; total_codes: string; master_themes: string; superordinate_themes: string }[];
  const codeRows = await sql`
      select code, sum(frequency)::text as frequency
      from analyses
      cross join lateral jsonb_to_recordset(result->'codes') as c(code text, frequency int)
      group by code
      order by sum(frequency) desc
      limit 10
    ` as unknown as { code: string; frequency: string }[];
  const recent = await sql`
      select a.id::text, u.email, a.created_at::text, coalesce(a.result->>'summary', '') as summary
      from analyses a
      join users u on u.id = a.user_id
      order by a.created_at desc
      limit 8
    ` as unknown as { id: string; email: string; created_at: string; summary: string }[];
  const codeQ = params.codeQ ?? "";
  const codeSearch = `%${codeQ}%`;
  const codeOffset = (codePage - 1) * codePageSize;
  const codeTableRows = await sql`
      select code, sum(frequency)::text as frequency
      from analyses
      cross join lateral jsonb_to_recordset(result->'codes') as c(code text, frequency int)
      where (${codeQ} = '' or code ilike ${codeSearch})
      group by code
      order by
        case when ${codeSort} = 'code' and ${codeDir} = 'asc' then code end asc,
        case when ${codeSort} = 'code' and ${codeDir} = 'desc' then code end desc,
        case when ${codeSort} = 'frequency' and ${codeDir} = 'asc' then sum(frequency) end asc,
        case when ${codeSort} = 'frequency' and ${codeDir} = 'desc' then sum(frequency) end desc
      limit ${codePageSize}
      offset ${codeOffset}
    ` as unknown as CodeFrequencyRow[];
  const codeCountRows = await sql`
      select count(*)::text
      from (
        select code
        from analyses
        cross join lateral jsonb_to_recordset(result->'codes') as c(code text, frequency int)
        where (${codeQ} = '' or code ilike ${codeSearch})
        group by code
      ) grouped_codes
    ` as unknown as { count: string }[];
  const submissionQ = params.submissionQ ?? "";
  const submissionSearch = `%${submissionQ}%`;
  const submissionOffset = (submissionPage - 1) * submissionPageSize;
  const submissionRows = await sql`
      select
        a.id::text,
        u.email,
        a.created_at::text,
        coalesce(a.result->>'summary', '') as summary,
        a.total_codes::text,
        a.master_theme_count::text,
        a.superordinate_theme_count::text
      from analyses a
      join users u on u.id = a.user_id
      where (${submissionQ} = '' or u.email ilike ${submissionSearch} or coalesce(a.result->>'summary', '') ilike ${submissionSearch})
      order by
        case when ${submissionSort} = 'email' and ${submissionDir} = 'asc' then u.email end asc,
        case when ${submissionSort} = 'email' and ${submissionDir} = 'desc' then u.email end desc,
        case when ${submissionSort} = 'created_at' and ${submissionDir} = 'asc' then a.created_at end asc,
        case when ${submissionSort} = 'created_at' and ${submissionDir} = 'desc' then a.created_at end desc,
        case when ${submissionSort} = 'total_codes' and ${submissionDir} = 'asc' then a.total_codes end asc,
        case when ${submissionSort} = 'total_codes' and ${submissionDir} = 'desc' then a.total_codes end desc,
        case when ${submissionSort} = 'master_theme_count' and ${submissionDir} = 'asc' then a.master_theme_count end asc,
        case when ${submissionSort} = 'master_theme_count' and ${submissionDir} = 'desc' then a.master_theme_count end desc,
        case when ${submissionSort} = 'superordinate_theme_count' and ${submissionDir} = 'asc' then a.superordinate_theme_count end asc,
        case when ${submissionSort} = 'superordinate_theme_count' and ${submissionDir} = 'desc' then a.superordinate_theme_count end desc
      limit ${submissionPageSize}
      offset ${submissionOffset}
    ` as unknown as SubmissionRow[];
  const submissionCountRows = await sql`
      select count(*)::text
      from analyses a
      join users u on u.id = a.user_id
      where (${submissionQ} = '' or u.email ilike ${submissionSearch} or coalesce(a.result->>'summary', '') ilike ${submissionSearch})
    ` as unknown as { count: string }[];

  return (
    <AdminDashboard
      admin={admin}
      metrics={metrics[0] ?? { total_analyses: "0", total_codes: "0", master_themes: "0", superordinate_themes: "0" }}
      codeRows={codeRows}
      recent={recent}
      codeTable={{
        rows: codeTableRows,
        total: Number(codeCountRows[0]?.count ?? 0),
        page: codePage,
        pageSize: codePageSize,
      }}
      submissionTable={{
        rows: submissionRows,
        total: Number(submissionCountRows[0]?.count ?? 0),
        page: submissionPage,
        pageSize: submissionPageSize,
      }}
      users={users}
      filters={{
        q: params.q ?? "",
        role: params.role ?? "all",
        status: params.status ?? "all",
        sort: params.sort ?? "created_at",
        dir: params.dir ?? "desc",
        view: params.view ?? "",
        codeQ,
        codeSort,
        codeDir,
        submissionQ,
        submissionSort,
        submissionDir,
      }}
    />
  );
}

function safePositiveNumber(value: string | undefined, fallback: number) {
  const numberValue = Number(value ?? fallback);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : fallback;
}
