"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProviderStatus = {
  google: boolean;
};

export function SocialAuthButtons({
  next,
  mode,
  providers,
}: {
  next?: string;
  mode: "signin" | "signup";
  providers: ProviderStatus;
}) {
  const [loading, setLoading] = React.useState(false);
  const callbackUrl = next || "/";
  const action = mode === "signup" ? "Sign up" : "Sign in";

  async function start() {
    setLoading(true);
    await signIn("google", { callbackUrl });
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full"
        disabled={!providers.google || loading}
        onClick={start}
        title={providers.google ? `${action} with Google` : "Google OAuth is not configured"}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleMark />}
        {action} with Google
      </Button>
      {!providers.google ? (
        <p className="text-xs leading-5 text-muted-foreground">
          Google signup requires Google OAuth environment variables.
        </p>
      ) : null}
    </div>
  );
}

function GoogleMark() {
  return (
    <img src="/google-g-logo.webp" alt="" className="h-4 w-4 object-contain" />
  );
}
