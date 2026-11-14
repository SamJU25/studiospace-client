"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Building2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import type { Studio } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { StudioCardSkeleton } from "@/components/ui/skeleton";
import { StudioCard } from "@/components/studios/StudioCard";
import { cn } from "@/lib/utils";

interface FeaturedStudiosSectionProps {
  initialStudios: Studio[];
}

export function FeaturedStudiosSection({
  initialStudios,
}: FeaturedStudiosSectionProps) {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const [studios, setStudios] = React.useState<Studio[]>(initialStudios);
  const [savedIds, setSavedIds] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(initialStudios.length === 0);
  const [fetchError, setFetchError] = React.useState(false);

  const loadFeatured = React.useCallback(() => {
    setLoading(true);
    setFetchError(false);
    return apiFetch<{ studios: Studio[] }>("/api/studios/featured")
      .then((res) => {
        setStudios(res.studios || []);
      })
      .catch(() => {
        setFetchError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  React.useEffect(() => {
    if (initialStudios.length > 0) return;

    let active = true;
    apiFetch<{ studios: Studio[] }>("/api/studios/featured")
      .then((res) => {
        if (active) setStudios(res.studios || []);
      })
      .catch(() => {
        if (active) setFetchError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [initialStudios.length]);

  React.useEffect(() => {
    if (!userId) return;

    let active = true;
    apiFetch<{ studioIds: string[] }>("/api/wishlist", { requireAuth: true })
      .then((res) => {
        if (active) setSavedIds(new Set(res.studioIds || []));
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [userId]);

  const effectiveSavedIds = userId ? savedIds : new Set<string>();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Featured Creative Studios
          </h2>
          <p className="mt-2 max-w-2xl text-base text-muted-foreground">
            Top-rated daylight lofts, soundproof stages, and audio suites
            ready for your next session.
          </p>
        </div>

        <Link
          href="/studios"
          className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
        >
          View All Studios
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {loading ? (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <StudioCardSkeleton key={idx} />
          ))}
        </div>
      ) : fetchError ? (
        <div
          role="alert"
          className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-14 text-center"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-display text-xl font-bold text-foreground">
            Could not load featured studios
          </h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Please check your connection and try loading listings again.
          </p>
          <Button variant="outline" className="mt-6" onClick={loadFeatured}>
            Retry
          </Button>
        </div>
      ) : studios.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-display text-xl font-bold text-foreground">
            No studios listed yet
          </h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Be the first host to publish a photo studio, podcast room, or music
            suite on StudioSpace.
          </p>
          <Link href="/add-studio" className={cn(buttonVariants(), "mt-6")}>
            Host Your Space
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {studios.slice(0, 6).map((studio) => (
            <StudioCard
              key={studio._id}
              studio={studio}
              isSaved={effectiveSavedIds.has(studio._id)}
              onWishlistChange={(id, saved) => {
                setSavedIds((prev) => {
                  const next = new Set(prev);
                  if (saved) next.add(id);
                  else next.delete(id);
                  return next;
                });
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
