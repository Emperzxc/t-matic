import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/components/profile-menu";
import type { SessionUser } from "@/lib/auth";
import { LogIn, LayoutDashboard } from "lucide-react";

export function AppHeader({ user }: { user: SessionUser | null }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="flex shrink-0 items-center gap-2">
          {user?.role === "super_admin" ? (
            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <Link href="/admin">
                <LayoutDashboard className="h-4 w-4" />
                Admin
              </Link>
            </Button>
          ) : null}
          {user ? (
            <ProfileMenu user={user} />
          ) : (
            <Button asChild>
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
