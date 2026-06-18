"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Activity, ArrowDown, ArrowUp, BarChart3, Database, Edit, Layers3, Plus, Search, Shield, Tags, Trash2, UserCog, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { ProfileMenu } from "@/components/profile-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ManagedUser } from "@/lib/users";
import type { SessionUser, UserRole } from "@/lib/auth";
import { toast } from "@/components/ui/use-toast";

type Props = {
  admin: SessionUser;
  metrics: {
    total_analyses: string;
    total_codes: string;
    master_themes: string;
    superordinate_themes: string;
  };
  codeRows: { code: string; frequency: string }[];
  recent: { id: string; email: string; created_at: string; summary: string }[];
  codeTable: {
    rows: { code: string; frequency: string }[];
    total: number;
    page: number;
    pageSize: number;
  };
  submissionTable: {
    rows: {
      id: string;
      email: string;
      created_at: string;
      summary: string;
      total_codes: string;
      master_theme_count: string;
      superordinate_theme_count: string;
    }[];
    total: number;
    page: number;
    pageSize: number;
  };
  users: { rows: ManagedUser[]; total: number; page: number; pageSize: number };
  filters: {
    q: string;
    role: string;
    status: string;
    sort: string;
    dir: string;
    view: string;
    codeQ: string;
    codeSort: string;
    codeDir: string;
    submissionQ: string;
    submissionSort: string;
    submissionDir: string;
  };
};

export function AdminDashboard({ admin, metrics, codeRows, recent, codeTable, submissionTable, users, filters }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [editing, setEditing] = React.useState<ManagedUser | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (!value || value === "all") params.delete(key);
    else params.set(key, value);
    if (key !== "page") params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function closeViewModal() {
    const params = new URLSearchParams(searchParams);
    params.delete("view");
    router.push(`${pathname}?${params.toString()}`);
  }

  function updateScopedParam(key: string, value: string, resetPage: string) {
    const params = new URLSearchParams(searchParams);
    if (!value || value === "all") params.delete(key);
    else params.set(key, value);
    params.delete(resetPage);
    router.push(`${pathname}?${params.toString()}`);
  }

  function sortBy(column: string) {
    const params = new URLSearchParams(searchParams);
    const current = params.get("sort") ?? "created_at";
    const dir = current === column && (params.get("dir") ?? "desc") === "asc" ? "desc" : "asc";
    params.set("sort", column);
    params.set("dir", dir);
    router.push(`${pathname}?${params.toString()}`);
  }

  function sortScoped(column: string, sortKey: string, dirKey: string, defaultDir = "desc") {
    const params = new URLSearchParams(searchParams);
    const current = params.get(sortKey);
    const currentDir = params.get(dirKey) ?? defaultDir;
    const dir = current === column && currentDir === "asc" ? "desc" : "asc";
    params.set(sortKey, column);
    params.set(dirKey, dir);
    router.push(`${pathname}?${params.toString()}`);
  }

  const totalPages = Math.max(Math.ceil(users.total / users.pageSize), 1);
  const codeTotalPages = Math.max(Math.ceil(codeTable.total / codeTable.pageSize), 1);
  const submissionTotalPages = Math.max(Math.ceil(submissionTable.total / submissionTable.pageSize), 1);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7f7_0%,#f8fafc_34%,#eef7f6_100%)]">
      <header className="sticky top-0 z-20 border-b border-red-950/10 bg-white/90 shadow-sm backdrop-blur">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <Logo className="[&_span]:text-lg sm:[&_span]:text-xl" />
            <p className="mt-1 truncate pl-[52px] text-xs font-semibold text-slate-500">{admin.email}</p>
          </div>
          <ProfileMenu user={admin} />
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-red-100 bg-[linear-gradient(135deg,#840000_0%,#5a0705_46%,#123f3c_100%)] p-5 text-white shadow-soft sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-white/80">
                <Activity className="h-4 w-4" />
                Live administration
              </div>
              <h1 className="mt-4 text-3xl font-black sm:text-4xl">Admin Dashboard</h1>
              <p className="mt-2 max-w-2xl leading-7 text-white/75">
                Monitor analysis volume, review recent submissions, and manage researcher access from one responsive workspace.
              </p>
            </div>
            <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="bg-white text-primary hover:bg-red-50">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric title="Total Analyses" value={metrics.total_analyses} icon={<BarChart3 />} tone="from-red-900 to-red-700" hint="Completed submissions" />
            <Metric title="Total Codes" value={metrics.total_codes} icon={<Tags />} tone="from-slate-900 to-slate-700" hint="Extracted code labels" />
            <Metric title="Master Themes" value={metrics.master_themes} icon={<Layers3 />} tone="from-teal-700 to-teal-500" hint="Mid-level clusters" />
            <Metric title="Superordinate Themes" value={metrics.superordinate_themes} icon={<Shield />} tone="from-amber-600 to-amber-400" hint="High-level patterns" />
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <Card className="overflow-hidden border-red-100 shadow-sm">
            <CardHeader className="border-b bg-red-50/70">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-red-950">
                  <Tags className="h-5 w-5" />
                  Top 10 Code Frequency
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => updateParam("view", "codes")}>View all</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {codeRows.length ? codeRows.map((row, index) => (
                <div key={row.code} className="grid gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0 text-sm font-bold text-slate-800">{index + 1}. {row.code}</p>
                    <Badge variant="outline" className="border-red-200 bg-red-50 text-red-800">{row.frequency}</Badge>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-red-50">
                    <div className="h-full rounded-full bg-[linear-gradient(90deg,#840000,#14b8a6,#f59e0b)]" style={{ width: `${Math.min(Number(row.frequency) * 10, 100)}%` }} />
                  </div>
                </div>
              )) : <EmptyBlock label="No analyzed codes yet." />}
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-teal-100 shadow-sm">
            <CardHeader className="border-b bg-teal-50/80">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-teal-950">
                  <Database className="h-5 w-5" />
                  Recent Analysis Submissions
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => updateParam("view", "submissions")}>View all</Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 p-5">
              {recent.length ? recent.map((item) => (
                <div key={item.id} className="rounded-md border border-teal-100 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-slate-800">{item.email}</p>
                    <Badge variant="outline" className="border-teal-200 bg-teal-50 text-teal-800">{new Date(item.created_at).toLocaleDateString()}</Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.summary}</p>
                </div>
              )) : <EmptyBlock label="No submissions yet." />}
            </CardContent>
          </Card>
        </section>

        {filters.view === "codes" ? (
          <AdminDataTable
            title="All Code Frequencies"
            description="Filter, sort, and page through every generated code across submitted analyses."
            icon={<Tags className="h-5 w-5 text-primary" />}
            onClose={closeViewModal}
            searchValue={filters.codeQ}
            searchPlaceholder="Filter by code"
            onSearch={(value) => updateScopedParam("codeQ", value, "codePage")}
            total={codeTable.total}
            page={codeTable.page}
            totalPages={codeTotalPages}
            onPrevious={() => updateParam("codePage", String(codeTable.page - 1))}
            onNext={() => updateParam("codePage", String(codeTable.page + 1))}
          >
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-slate-100 text-left text-slate-700">
                <tr>
                  <SortableTh label="Code" active={filters.codeSort === "code"} dir={filters.codeDir} onClick={() => sortScoped("code", "codeSort", "codeDir")} />
                  <SortableTh label="Frequency" active={filters.codeSort === "frequency"} dir={filters.codeDir} onClick={() => sortScoped("frequency", "codeSort", "codeDir")} />
                </tr>
              </thead>
              <tbody className="divide-y bg-white">
                {codeTable.rows.map((row) => (
                  <tr key={row.code} className="hover:bg-red-50/40">
                    <td className="px-4 py-3 font-bold text-slate-800">{row.code}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="border-red-200 bg-red-50 text-red-800">{row.frequency}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminDataTable>
        ) : null}

        {filters.view === "submissions" ? (
          <AdminDataTable
            title="All Analysis Submissions"
            description="Review submitted analyses with sortable metrics and email or summary filtering."
            icon={<Database className="h-5 w-5 text-teal-700" />}
            onClose={closeViewModal}
            searchValue={filters.submissionQ}
            searchPlaceholder="Filter by email or summary"
            onSearch={(value) => updateScopedParam("submissionQ", value, "submissionPage")}
            total={submissionTable.total}
            page={submissionTable.page}
            totalPages={submissionTotalPages}
            onPrevious={() => updateParam("submissionPage", String(submissionTable.page - 1))}
            onNext={() => updateParam("submissionPage", String(submissionTable.page + 1))}
          >
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-slate-100 text-left text-slate-700">
                <tr>
                  <SortableTh label="Email" active={filters.submissionSort === "email"} dir={filters.submissionDir} onClick={() => sortScoped("email", "submissionSort", "submissionDir")} />
                  <SortableTh label="Created" active={filters.submissionSort === "created_at"} dir={filters.submissionDir} onClick={() => sortScoped("created_at", "submissionSort", "submissionDir")} />
                  <SortableTh label="Codes" active={filters.submissionSort === "total_codes"} dir={filters.submissionDir} onClick={() => sortScoped("total_codes", "submissionSort", "submissionDir")} />
                  <SortableTh label="Master" active={filters.submissionSort === "master_theme_count"} dir={filters.submissionDir} onClick={() => sortScoped("master_theme_count", "submissionSort", "submissionDir")} />
                  <SortableTh label="Superordinate" active={filters.submissionSort === "superordinate_theme_count"} dir={filters.submissionDir} onClick={() => sortScoped("superordinate_theme_count", "submissionSort", "submissionDir")} />
                  <th className="px-4 py-3 font-bold">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white">
                {submissionTable.rows.map((row) => (
                  <tr key={row.id} className="hover:bg-teal-50/40">
                    <td className="px-4 py-3 font-bold text-slate-800">{row.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(row.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{row.total_codes}</td>
                    <td className="px-4 py-3">{row.master_theme_count}</td>
                    <td className="px-4 py-3">{row.superordinate_theme_count}</td>
                    <td className="max-w-[360px] px-4 py-3 text-muted-foreground">
                      <span className="line-clamp-2">{row.summary}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminDataTable>
        ) : null}

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-black">
                <UserCog className="h-6 w-6 text-primary" />
                User Management
              </h2>
              <p className="text-sm text-muted-foreground">Create users and super admins, update access, and disable accounts.</p>
            </div>
          </div>
          <Card className="overflow-hidden border-slate-200 shadow-soft">
            <div className="border-b bg-white p-4 sm:p-6">
              <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Filter by name or email" defaultValue={filters.q} className="h-11 bg-slate-50 pl-9" onKeyDown={(event) => {
                    if (event.key === "Enter") updateParam("q", event.currentTarget.value);
                  }} />
                </div>
                <Select value={filters.role} onValueChange={(value) => updateParam("role", value)}>
                  <SelectTrigger className="h-11 bg-slate-50"><SelectValue placeholder="Role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All roles</SelectItem>
                    <SelectItem value="super_admin">Super admins</SelectItem>
                    <SelectItem value="user">Users</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.status} onValueChange={(value) => updateParam("status", value)}>
                  <SelectTrigger className="h-11 bg-slate-50"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <CardContent className="p-4 sm:p-6">
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="bg-slate-100 text-left text-slate-700">
                    <tr>
                      {[
                        ["name", "Name"],
                        ["email", "Email"],
                        ["role", "Role"],
                        ["status", "Status"],
                        ["created_at", "Created"],
                      ].map(([key, label]) => (
                        <th key={key} className="px-4 py-3 font-bold">
                          <button className="inline-flex items-center gap-1" onClick={() => sortBy(key)}>
                            {label}
                            {filters.sort === key ? filters.dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" /> : null}
                          </button>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-white">
                    {users.rows.map((user) => (
                      <tr key={user.id} className="transition-colors hover:bg-red-50/40">
                        <td className="px-4 py-3 font-semibold">{user.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                        <td className="px-4 py-3"><Badge variant={user.role === "super_admin" ? "default" : "secondary"} className={user.role === "super_admin" ? "bg-primary" : "bg-teal-50 text-teal-800"}>{user.role.replace("_", " ")}</Badge></td>
                        <td className="px-4 py-3"><Badge variant={user.status === "active" ? "success" : "outline"}>{user.status}</Badge></td>
                        <td className="px-4 py-3 text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="outline" aria-label="Edit user" onClick={() => { setEditing(user); setFormOpen(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="outline" aria-label="Disable user" onClick={() => disableUser(user.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">{users.total} users · page {users.page} of {totalPages}</p>
                <div className="flex gap-2">
                  <Button variant="outline" disabled={users.page <= 1} onClick={() => updateParam("page", String(users.page - 1))}>Previous</Button>
                  <Button variant="outline" disabled={users.page >= totalPages} onClick={() => updateParam("page", String(users.page + 1))}>Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      {formOpen ? <UserForm user={editing} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); router.refresh(); }} /> : null}
    </div>
  );
}

function Metric({ title, value, icon, tone, hint }: { title: string; value: string; icon: React.ReactNode; tone: string; hint: string }) {
  return (
    <div className={`rounded-lg bg-gradient-to-br ${tone} p-5 text-white shadow-sm`}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-black uppercase tracking-normal text-white/90">{title}</p>
        <div className="rounded-md bg-white/15 p-2 [&_svg]:h-5 [&_svg]:w-5">{icon}</div>
      </div>
      <p className="mt-4 text-4xl font-black">{Number(value).toLocaleString()}</p>
      <p className="mt-1 text-sm font-semibold text-white/70">{hint}</p>
    </div>
  );
}

function EmptyBlock({ label }: { label: string }) {
  return <div className="grid min-h-[220px] place-items-center rounded-md bg-secondary text-muted-foreground">{label}</div>;
}

function AdminDataTable({
  title,
  description,
  icon,
  onClose,
  searchValue,
  searchPlaceholder,
  onSearch,
  total,
  page,
  totalPages,
  onPrevious,
  onNext,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClose: () => void;
  searchValue: string;
  searchPlaceholder: string;
  onSearch: (value: string) => void;
  total: number;
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6">
      <Card className="flex max-h-[88vh] w-full max-w-6xl flex-col overflow-hidden border-slate-200 shadow-soft">
        <div className="border-b bg-white p-4 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_360px_auto] lg:items-center">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-black">
                {icon}
                {title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                defaultValue={searchValue}
                className="h-11 bg-slate-50 pl-9"
                onKeyDown={(event) => {
                  if (event.key === "Enter") onSearch(event.currentTarget.value);
                }}
              />
            </div>
            <Button type="button" size="icon" variant="outline" aria-label="Close table modal" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardContent className="min-h-0 flex-1 overflow-hidden p-4 sm:p-6">
          <div className="h-full max-h-[56vh] overflow-auto rounded-lg border">{children}</div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">{total} records · page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={onPrevious}>Previous</Button>
              <Button variant="outline" disabled={page >= totalPages} onClick={onNext}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SortableTh({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: string;
  onClick: () => void;
}) {
  return (
    <th className="px-4 py-3 font-bold">
      <button className="inline-flex items-center gap-1" onClick={onClick}>
        {label}
        {active ? dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" /> : null}
      </button>
    </th>
  );
}

function UserForm({ user, onClose, onSaved }: { user: ManagedUser | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = React.useState(user?.name ?? "");
  const [email, setEmail] = React.useState(user?.email ?? "");
  const [role, setRole] = React.useState<UserRole>(user?.role ?? "user");
  const [status, setStatus] = React.useState(user?.status ?? "active");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(user ? `/api/admin/users/${user.id}` : "/api/admin/users", {
        method: user ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, status, password: password || undefined }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Unable to save user.");
      toast({ title: "User saved", description: `${email} has been updated.` });
      onSaved();
    } catch (error) {
      toast({ title: "Save failed", description: error instanceof Error ? error.message : "Unable to save user." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <form onSubmit={submit} className="w-full max-w-lg rounded-lg bg-white p-6 shadow-soft">
        <div className="mb-5">
          <h3 className="text-2xl font-black">{user ? "Edit User" : "Add User"}</h3>
          <p className="text-sm text-muted-foreground">Super admins can create both researchers and other super admins.</p>
        </div>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="super_admin">Super admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as "active" | "disabled")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{user ? "New password" : "Password"}</Label>
            <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required={!user} minLength={8} />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
        </div>
      </form>
    </div>
  );
}

async function disableUser(id: string) {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "disabled" }),
  });
  const body = await response.json();
  if (!response.ok) toast({ title: "Update failed", description: body.error ?? "Unable to disable user." });
  else {
    toast({ title: "User disabled" });
    window.location.reload();
  }
}
