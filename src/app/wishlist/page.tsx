"use client";

import * as React from "react";
import Link from "next/link";
import { Compass, Heart } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import type { Studio } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { StudioCardSkeleton } from "@/components/ui/skeleton";
import { StudioCard } from "@/components/studios/StudioCard";
import { cn } from "@/lib/utils";

export default function WishlistPage() {
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const [studios, setStudios] = React.useState<Studio[]>([]);
  const [fetchedForUser, setFetchedForUser] = React.useState<string>("");

  React.useEffect(() => {
    if (isPending || !userId) return;

    let active = true;
    apiFetch<{ studios: Studio[] }>("/api/wishlist", { requireAuth: true })
      .then((res) => {
        if (active) setStudios(res.studios || []);
      })
      .catch((err) => {
        if (active) {
          toast.error(
            err instanceof Error
              ? err.message
              : "Failed to load saved studios."
          );
        }
      })
      .finally(() => {
        if (active) setFetchedForUser(userId);
      });

    return () => {
      active = false;
    };
  }, [isPending, userId]);

  const loading = isPending || (Boolean(userId) && fetchedForUser !== userId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Saved Studios
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Your shortlisted photo lofts, podcast rooms, and production stages.
          </p>
        </div>

        <Link
          href="/studios"
          className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
        >
          <Compass className="h-4 w-4" />
          Explore More
        </Link>
      </div>

      {loading ? (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <StudioCardSkeleton key={idx} />
          ))}
        </div>
      ) : studios.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
            <Heart className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-foreground">
            Your wishlist is empty
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Tap the heart icon on any studio card to keep track of spaces you
            want to book later.
          </p>
          <Link href="/studios" className={cn(buttonVariants(), "mt-6")}>
            Browse Studios
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {studios.map((studio) => (
            <StudioCard
              key={studio._id}
              studio={studio}
              isSaved
              onWishlistChange={(id, saved) => {
                if (!saved) {
                  setStudios((prev) => prev.filter((item) => item._id !== id));
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
