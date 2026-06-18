import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { AnalysisWorkspace } from "@/components/analysis-workspace";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const user = await getSession();

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#fff_0%,#f8fafc_56%,#fff_100%)]">
      <AppHeader user={user} />
      <main className="flex-1">
        <AnalysisWorkspace user={user} />
      </main>
      <Footer />
    </div>
  );
}
