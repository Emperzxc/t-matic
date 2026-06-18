import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { Logo } from "@/components/logo";
import { getSession } from "@/lib/auth";
import { BadgeCheck, ShieldCheck } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;
  if (session) redirect(params.next || (session.role === "super_admin" ? "/admin" : "/"));

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_48%,#eef7f6_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex min-h-[420px] flex-col justify-between rounded-lg bg-primary p-6 text-white shadow-soft sm:p-8 lg:min-h-[560px] lg:p-10">
          <Logo className="[&_span]:text-white" />
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white">
              <ShieldCheck className="h-4 w-4" />
              Secure research workspace
            </div>
            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-black leading-tight tracking-normal sm:text-5xl">
                Thematic analysis access for your team
              </h1>
              <p className="max-w-md text-base leading-7 text-white/88 sm:text-lg sm:leading-8">
                Continue qualitative coding, AI-assisted theme generation, and admin work from one protected account.
              </p>
            </div>
          </div>
          <div className="grid gap-3 text-sm font-medium text-white/90 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2">
              <BadgeCheck className="h-4 w-4 shrink-0" />
              Researcher sign-in
            </div>
            <div className="flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2">
              <BadgeCheck className="h-4 w-4 shrink-0" />
              Admin console access
            </div>
          </div>
        </div>
        <div className="mx-auto w-full max-w-md rounded-lg border bg-white/95 p-6 shadow-soft backdrop-blur sm:p-8">
          <LoginForm next={params.next} />
        </div>
      </section>
    </main>
  );
}
