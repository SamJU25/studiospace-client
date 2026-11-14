"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  Edit3,
  ExternalLink,
  Loader2,
  MapPin,
  PlusSquare,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import type { Studio } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { StudioCardSkeleton } from "@/components/ui/skeleton";

export default function MyListingsPage() {
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const [studios, setStudios] = React.useState<Studio[]>([]);
  const [fetchedForUser, setFetchedForUser] = React.useState<string>("");
  const [studioToDelete, setStudioToDelete] = React.useState<Studio | null>(
    null
  );
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    if (isPending || !userId) return;

    let active = true;
    apiFetch<{ studios: Studio[] }>("/api/studios/my-listings", {
      requireAuth: true,
    })
      .then((res) => {
        if (active) setStudios(res.studios || []);
      })
      .catch((err) => {
        if (active) {
          toast.error(
            err instanceof Error ? err.message : "Failed to load your listings."
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

  const handleConfirmDelete = async () => {
    if (!studioToDelete) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/studios/${studioToDelete._id}`, {
        method: "DELETE",
        requireAuth: true,
      });
      setStudios((prev) =>
        prev.filter((item) => item._id !== studioToDelete._id)
      );
      toast.success(`"${studioToDelete.title}" has been deleted.`);
      setStudioToDelete(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete studio."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            My Studio Listings
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Manage rates, gear lists, and availability for the creative spaces
            you host.
          </p>
        </div>

        <Link href="/add-studio">
          <Button className="gap-2">
            <PlusSquare className="h-4 w-4" />
            Add New Studio
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <StudioCardSkeleton key={i} />
          ))}
        </div>
      ) : studios.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
            <Building2 className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-foreground">
            You haven&apos;t listed any studios yet
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Turn idle studio hours into recurring income by publishing your
            workspace on StudioSpace.
          </p>
          <Link href="/add-studio" className="mt-6">
            <Button>Publish Your First Studio</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {studios.map((studio) => (
            <article
              key={studio._id}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                <img
                  src={studio.imageUrl}
                  alt={studio.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute left-3.5 top-3.5">
                  <Badge className="bg-background/90 text-foreground border-border">
                    {studio.category}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 truncate">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{studio.location}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 shrink-0">
                    <Users className="h-3.5 w-3.5" />
                    {studio.maxCapacity}
                  </span>
                </div>

                <h3 className="mt-2.5 font-display text-lg font-bold text-foreground line-clamp-2">
                  {studio.title}
                </h3>

                <p className="mt-1.5 text-sm font-semibold text-primary tabular-nums">
                  {formatCurrency(studio.hourlyRate)} / hr
                </p>

                <div className="mt-auto flex items-center gap-2 border-t border-border pt-4">
                  <Link href={`/studios/${studio._id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1.5">
                      <ExternalLink className="h-3.5 w-3.5" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/studios/edit/${studio._id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full gap-1.5">
                      <Edit3 className="h-3.5 w-3.5" />
                      Update
                    </Button>
                  </Link>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setStudioToDelete(studio)}
                    aria-label={`Delete ${studio.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      <Modal
        open={Boolean(studioToDelete)}
        onClose={() => !deleting && setStudioToDelete(null)}
        title="Delete Studio Listing"
        description="This action permanently removes the listing from StudioSpace and cannot be undone."
      >
        <div className="space-y-5">
          <p className="text-sm text-foreground">
            Are you sure you want to delete{" "}
            <strong>{studioToDelete?.title}</strong>?
          </p>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => setStudioToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={handleConfirmDelete}
              className="gap-2"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              {deleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
