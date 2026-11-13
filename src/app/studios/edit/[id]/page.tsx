"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Studio } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StudioForm } from "@/components/studios/StudioForm";

export default function EditStudioPage() {
  const { id } = useParams<{ id: string }>();
  const [studio, setStudio] = React.useState<Studio | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    apiFetch<{ studio: Studio }>(`/api/studios/${id}`)
      .then((res) => {
        if (active) setStudio(res.studio);
      })
      .catch(() => {
        if (active) setStudio(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

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
          <p className="font-semibold text-foreground">Studio not found</p>
          <Link href="/my-listings" className="mt-4 inline-block">
            <Button variant="outline">Return to My Listings</Button>
          </Link>
        </div>
      ) : (
        <StudioForm mode="edit" initialStudio={studio} />
      )}
    </div>
  );
}
