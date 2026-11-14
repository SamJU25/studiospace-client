"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Aperture,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Upload,
  UserPlus,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { uploadImageToImgbb } from "@/lib/imgbb";
import { isSafeHttpUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [photoUrl, setPhotoUrl] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasMinLength = password.length >= 6;
  const passwordValid = hasUppercase && hasLowercase && hasMinLength;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadImageToImgbb(file);
      setPhotoUrl(url);
      toast.success("Profile photo uploaded.");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Photo upload failed. You can paste a direct photo URL instead."
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in your name and email address.");
      return;
    }

    if (!passwordValid) {
      toast.error(
        "Password must be at least 6 characters and include both uppercase and lowercase letters."
      );
      return;
    }

    const trimmedPhoto = photoUrl.trim();
    if (trimmedPhoto && !isSafeHttpUrl(trimmedPhoto)) {
      toast.error("Photo URL must start with https:// or http://.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        image: trimmedPhoto || undefined,
      });

      if (error) {
        toast.error(error.message || "Could not create account.");
        return;
      }

      // Navigate to Login page per assignment flow
      await authClient.signOut().catch(() => {});
      toast.success("Account registered successfully! Please log in.");
      router.push("/login?registered=1");
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
      if (error) {
        toast.error(
          error.message ||
            "Google sign-in is unavailable until Google OAuth keys are configured."
        );
      }
    } catch {
      toast.error("Could not connect to Google login.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-14rem)] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <Aperture className="h-5 w-5 text-primary shrink-0" />
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Create your account
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Book creative spaces or publish your own studio hours.
          </p>
        </div>

        <form onSubmit={handleRegister} className="mt-7 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reg-name">Full Name</Label>
            <Input
              id="reg-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Elena Vance"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reg-email">Email Address</Label>
            <Input
              id="reg-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="elena@studiospace.dev"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reg-photo">Photo URL (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="reg-photo"
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://i.ibb.co/..."
              />
              <label className="relative inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-secondary px-3 text-xs font-medium text-foreground hover:bg-secondary/80 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
                {uploadingPhoto ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span className="sr-only">Upload profile photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reg-password">Password</Label>
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="pt-2 space-y-1.5 text-xs">
              <p className="flex items-center gap-2">
                {hasUppercase ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span className={hasUppercase ? "text-foreground" : "text-muted-foreground"}>
                  Contains an uppercase letter (A–Z)
                </span>
              </p>
              <p className="flex items-center gap-2">
                {hasLowercase ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span className={hasLowercase ? "text-foreground" : "text-muted-foreground"}>
                  Contains a lowercase letter (a–z)
                </span>
              </p>
              <p className="flex items-center gap-2">
                {hasMinLength ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span className={hasMinLength ? "text-foreground" : "text-muted-foreground"}>
                  At least 6 characters long
                </span>
              </p>
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
              <UserPlus className="h-4 w-4" />
            )}
            {submitting ? "Creating Account..." : "Register"}
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
          onClick={handleGoogleRegister}
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
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
