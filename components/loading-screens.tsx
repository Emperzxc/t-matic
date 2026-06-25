import { Logo } from "@/components/logo";
import { Skeleton } from "@/components/ui/skeleton";

export function AppLoadingScreen() {
  return (
    <div className="min-h-screen bg-background">
      <LoadingHeader />
      <main className="mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-5">
            <Skeleton className="h-9 w-64 rounded-full" />
            <div className="space-y-3">
              <Skeleton className="h-14 w-full max-w-2xl" />
              <Skeleton className="h-14 w-4/5 max-w-xl" />
              <Skeleton className="h-6 w-full max-w-2xl" />
              <Skeleton className="h-6 w-3/4 max-w-xl" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="mt-6 h-72 w-full" />
            <div className="mt-4 flex justify-between gap-4">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-12 w-44" />
            </div>
          </div>
        </section>
        <ResultHistorySkeleton />
      </main>
    </div>
  );
}

export function AdminLoadingScreen() {
  return (
    <div className="min-h-screen bg-background">
      <LoadingHeader />
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-52 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-36" />)}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
        <Skeleton className="h-[420px]" />
      </main>
    </div>
  );
}

export function AuthLoadingScreen() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <Skeleton className="min-h-[420px] lg:min-h-[560px]" />
        <div className="mx-auto w-full max-w-md rounded-lg border bg-card p-6 sm:p-8">
          <Skeleton className="h-11 w-11" />
          <Skeleton className="mt-4 h-9 w-56" />
          <Skeleton className="mt-3 h-5 w-full" />
          <div className="mt-8 grid gap-5">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-11" />
          </div>
        </div>
      </section>
    </main>
  );
}

export function ResultHistorySkeleton() {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>
      <div className="grid gap-3 rounded-lg border bg-card p-5 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="space-y-3 rounded-md border p-4">
            <div className="flex justify-between gap-3">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-9 w-20" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LoadingHeader() {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <Skeleton className="h-11 w-36 rounded-full" />
      </div>
    </header>
  );
}
