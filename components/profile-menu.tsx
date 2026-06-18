"use client";

import * as React from "react";
import { ChevronDown, Loader2, LogOut, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { initials } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth";

export function ProfileMenu({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [confirmLogout, setConfirmLogout] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Unable to log out.");
      setConfirmLogout(false);
      router.replace("/login");
      router.refresh();
    } catch (error) {
      toast({ title: "Logout failed", description: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-11 gap-3 rounded-full border-red-100 bg-white px-2 pr-3 shadow-sm">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-black text-white">
              {initials(user.name || user.email)}
            </span>
            <span className="hidden min-w-0 text-left sm:block">
              <span className="block max-w-[150px] truncate text-sm font-bold">{user.name}</span>
              <span className="block text-xs text-muted-foreground">{user.role.replace("_", " ")}</span>
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-black text-white">
                {initials(user.name || user.email)}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-black">{user.name}</span>
                <span className="block truncate text-xs font-medium text-muted-foreground">{user.email}</span>
                <Badge className="mt-2" variant={user.role === "super_admin" ? "default" : "secondary"}>
                  {user.role.replace("_", " ")}
                </Badge>
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setOpen(true)}>
            <UserRound className="h-4 w-4" />
            Profile details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-700 focus:bg-red-50 focus:text-red-800" onSelect={() => setConfirmLogout(true)}>
            <LogOut className="h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {open ? <ProfileDialog user={user} onClose={() => setOpen(false)} /> : null}
      <AlertDialog open={confirmLogout} onOpenChange={(nextOpen) => !loggingOut && setConfirmLogout(nextOpen)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of T-Matic?</AlertDialogTitle>
            <AlertDialogDescription>
              Your current session will end on this device. Any unsaved text in the workspace should be saved before continuing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loggingOut}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-red-700"
              disabled={loggingOut}
              onClick={(event) => {
                event.preventDefault();
                void logout();
              }}
            >
              {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ProfileDialog({ user, onClose }: { user: SessionUser; onClose: () => void }) {
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: password || undefined }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Unable to update profile.");
      toast({ title: "Profile updated", description: "Your profile details were saved." });
      onClose();
      window.location.reload();
    } catch (error) {
      toast({ title: "Profile update failed", description: error instanceof Error ? error.message : "Unable to update profile." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <form onSubmit={submit} className="w-full max-w-lg rounded-lg border bg-white p-6 shadow-soft">
        <div className="mb-5">
          <h2 className="text-2xl font-black">Profile Details</h2>
          <p className="text-sm text-muted-foreground">Manage your display name, email, and password.</p>
        </div>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Name</Label>
            <Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input id="profile-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-password">New password</Label>
            <Input id="profile-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} />
            <p className="text-xs text-muted-foreground">Leave blank to keep your current password.</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={loading}>{loading ? "Saving..." : "Save profile"}</Button>
        </div>
      </form>
    </div>
  );
}
