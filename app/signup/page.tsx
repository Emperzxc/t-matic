import { redirect } from "next/navigation";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { SignupForm } from "@/components/signup-form";
import { getSession } from "@/lib/auth";
import { oauthProviderStatus } from "@/lib/next-auth";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;
  if (session) redirect(params.next || (session.role === "super_admin" ? "/admin" : "/"));

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_48%,#eef7f6_100%)] px-4 py-8 dark:bg-[linear-gradient(135deg,#090d18_0%,#111827_48%,#082f2c_100%)] sm:px-6 lg:px-8">
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
                Create your T-Matic researcher account
              </h1>
              <p className="max-w-md text-base leading-7 text-white/88 sm:text-lg sm:leading-8">
                Sign up to analyze transcripts, save results, and return to your qualitative research workspace.
              </p>
            </div>
          </div>
          <div className="grid gap-3 text-sm font-medium text-white/90 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2">
              <BadgeCheck className="h-4 w-4 shrink-0" />
              Email signup
            </div>
            <div className="flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2">
              <BadgeCheck className="h-4 w-4 shrink-0" />
              Google signup
            </div>
          </div>
        </div>
        <div className="mx-auto w-full max-w-md rounded-lg border bg-white/95 p-6 shadow-soft backdrop-blur dark:border-white/10 dark:bg-card/95 sm:p-8">
          <SignupForm next={params.next} providers={oauthProviderStatus} />
        </div>
      </section>
    </main>
  );
}
