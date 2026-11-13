"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MapPin, Star, Users } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import type { Studio } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface StudioCardProps {
  studio: Studio;
  isSaved?: boolean;
  onWishlistChange?: (studioId: string, saved: boolean) => void;
}

export function StudioCard({
  studio,
  isSaved = false,
  onWishlistChange,
}: StudioCardProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [saved, setSaved] = React.useState(isSaved);
  const [toggling, setToggling] = React.useState(false);

  React.useEffect(() => {
    setSaved(isSaved);
  }, [isSaved]);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      toast.info("Sign in to save studios to your wishlist.");
      router.push("/login");
      return;
    }

    if (toggling) return;
    setToggling(true);
    try {
      const res = await apiFetch<{ saved: boolean; studioId: string }>(
        "/api/wishlist/toggle",
        {
          method: "POST",
          requireAuth: true,
          body: JSON.stringify({ studioId: studio._id }),
        }
      );
      setSaved(res.saved);
      onWishlistChange?.(studio._id, res.saved);
      toast.success(
        res.saved
          ? "Saved studio to your wishlist."
          : "Removed studio from your wishlist."
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not update wishlist."
      );
    } finally {
      setToggling(false);
    }
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      {/* Uniform 16:10 image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <Link href={`/studios/${studio._id}`} className="block h-full w-full">
          <img
            src={studio.imageUrl}
            alt={studio.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        <div className="absolute left-3.5 top-3.5">
          <Badge className="bg-background/90 text-foreground backdrop-blur-sm border-border shadow-xs">
            {studio.category}
          </Badge>
        </div>

        <button
          type="button"
          onClick={handleToggleWishlist}
          disabled={toggling}
          aria-label={saved ? "Remove from saved studios" : "Save studio"}
          className={cn(
            "absolute right-3.5 top-3.5 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-sm transition-colors cursor-pointer",
            saved
              ? "border-primary bg-primary text-primary-foreground"
              : "border-white/30 bg-black/45 text-white hover:bg-black/65"
          )}
        >
          <Heart className={cn("h-4 w-4", saved && "fill-current")} />
        </button>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">{studio.location}</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2 py-0.5 font-semibold text-foreground tabular-nums">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            {Number(studio.rating || 5).toFixed(1)}
          </span>
        </div>

        <Link href={`/studios/${studio._id}`} className="mt-2.5 block">
          <h3 className="font-display text-lg font-bold leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {studio.title}
          </h3>
        </Link>

        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {studio.description}
        </p>

        <div className="mt-auto pt-4">
          <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>Up to {studio.maxCapacity} crew members</span>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border pt-3.5">
            <div>
              <span className="font-display text-xl font-bold text-foreground tabular-nums">
                {formatCurrency(studio.hourlyRate)}
              </span>
              <span className="text-xs text-muted-foreground"> / hr</span>
            </div>

            <Link href={`/studios/${studio._id}`}>
              <Button size="sm">View Details</Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
