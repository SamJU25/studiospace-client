"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Aperture, Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { syncServerCookie } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const justRegistered = searchParams.get("registered") === "1";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  React.useEffect(() => {
    if (justRegistered) {
      toast.success("Account created! Sign in with your new credentials.");
    }
  }, [justRegistered]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter both your email and password.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error(error.message || "Invalid email or password.");
        return;
      }

      await syncServerCookie();
      toast.success("Welcome back to StudioSpace!");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      toast.error("Sign in failed. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackUrl,
      });
      if (error) {
        toast.error(
          error.message ||
            "Google sign-in is unavailable until Google OAuth keys are configured."
        );
      }
    } catch {
      toast.error(
        "Google sign-in could not start. Check OAuth configuration in .env."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-14rem)] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Aperture className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground">
            Sign in to StudioSpace
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Access your booked sessions, saved studios, and host listings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="login-email">Email address</Label>
            <Input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="creator@studiospace.dev"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Password</Label>
              <button
                type="button"
                onClick={() =>
                  toast.info(
                    "Password recovery is handled by your workspace administrator in this demo."
                  )
                }
                className="text-xs font-medium text-primary hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-11 gap-2"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {submitting ? "Signing in..." : "Login"}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            or continue with
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={googleLoading}
          onClick={handleGoogleLogin}
          className="w-full h-11 gap-2.5"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.5 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.6H12z"
            />
          </svg>
          {googleLoading ? "Connecting Google..." : "Continue with Google"}
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to StudioSpace?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
