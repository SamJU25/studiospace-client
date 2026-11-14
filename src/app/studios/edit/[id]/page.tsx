"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import type { Studio } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StudioForm } from "@/components/studios/StudioForm";

export default function EditStudioPage() {
  const { id } = useParams<{ id: string }>();
  const [studio, setStudio] = React.useState<Studio | null>(null);
  const [loadedKey, setLoadedKey] = React.useState<string>("");
  const [reloadNonce, setReloadNonce] = React.useState(0);
  const [fetchError, setFetchError] = React.useState("");

  const requestKey = `${id}:${reloadNonce}`;
  const loading = loadedKey !== requestKey;

  React.useEffect(() => {
    let active = true;
    apiFetch<{ studio: Studio }>(`/api/studios/${id}`, { requireAuth: true })
      .then((res) => {
        if (!active) return;
        setFetchError("");
        setStudio(res.studio);
      })
      .catch((err) => {
        if (!active) return;
        setStudio(null);
        if (err instanceof ApiError && err.status === 404) {
          setFetchError("");
        } else {
          setFetchError(
            err instanceof Error
              ? err.message
              : "Could not load studio details."
          );
        }
      })
      .finally(() => {
        if (active) setLoadedKey(requestKey);
      });

    return () => {
      active = false;
    };
  }, [id, requestKey]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/my-listings"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Studio Listings
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Edit Studio Listing
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Update pricing, equipment tags, capacity, or studio description.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-8">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : !studio ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <p className="font-semibold text-foreground">
            {fetchError ? "Unable to load studio" : "Studio not found"}
          </p>
          {fetchError && (
            <p className="mt-2 text-sm text-muted-foreground">{fetchError}</p>
          )}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {fetchError && (
              <Button
                type="button"
                onClick={() => {
                  setFetchError("");
                  setReloadNonce((n) => n + 1);
                }}
              >
                Try again
              </Button>
            )}
            <Link
              href="/my-listings"
              className={buttonVariants({ variant: "outline" })}
            >
              Return to My Listings
            </Link>
          </div>
        </div>
      ) : studio.isOwner === false ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <p className="font-semibold text-foreground">
            You do not have permission to edit this studio
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Only the verified owner of this listing can modify its rates or details.
          </p>
          <Link
            href="/my-listings"
            className={buttonVariants({ variant: "outline", className: "mt-5" })}
          >
            Return to My Listings
          </Link>
        </div>
      ) : (
        <StudioForm mode="edit" initialStudio={studio} />
      )}
    </div>
  );
}
