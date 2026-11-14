"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { RotateCcw, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import { STUDIO_CATEGORIES, type Studio } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StudioCardSkeleton } from "@/components/ui/skeleton";
import { StudioCard } from "@/components/studios/StudioCard";

function ExploreStudiosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category") || "All";

  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const [searchInput, setSearchInput] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState("newest");
  const [studios, setStudios] = React.useState<Studio[]>([]);
  const [savedIds, setSavedIds] = React.useState<Set<string>>(new Set());
  const [fetchedKey, setFetchedKey] = React.useState<string>("");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const queryParamsString = React.useMemo(() => {
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== "All") {
      params.set("category", selectedCategory);
    }
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    }
    if (sortBy && sortBy !== "newest") {
      params.set("sort", sortBy);
    }
    return params.toString();
  }, [selectedCategory, debouncedSearch, sortBy]);

  const requestKey = `${selectedCategory}|${debouncedSearch}|${sortBy}`;
  const loading = fetchedKey !== requestKey;

  React.useEffect(() => {
    let active = true;
    const url = queryParamsString
      ? `/api/studios?${queryParamsString}`
      : "/api/studios";

    apiFetch<{ studios: Studio[] }>(url)
      .then((res) => {
        if (active) setStudios(res.studios || []);
      })
      .catch(() => {
        if (active) setStudios([]);
      })
      .finally(() => {
        if (active) setFetchedKey(requestKey);
      });

    return () => {
      active = false;
    };
  }, [queryParamsString, requestKey]);

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

  const handleCategorySelect = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "All") params.delete("category");
    else params.set("category", category);
    const qs = params.toString();
    router.replace(qs ? `/studios?${qs}` : "/studios");
  };

  const resetFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setSortBy("newest");
    handleCategorySelect("All");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-8 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Explore Creative Studios
          </h1>
          <p className="mt-2 max-w-2xl text-base text-muted-foreground">
            Filter verified photo lofts, sound stages, podcast suites, music
            rooms, and maker workshops by specialty or keyword.
          </p>
        </div>

        <Link href="/add-studio">
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            Host Your Studio
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="mt-8 space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title, city, or gear (e.g. Profoto, SM7B)..."
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Sort:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort studios"
              className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="newest">Newest Listed</option>
              <option value="rating">Top Rated</option>
              <option value="price_asc">Hourly Rate: Low to High</option>
              <option value="price_desc">Hourly Rate: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {["All", ...STUDIO_CATEGORIES].map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <StudioCardSkeleton key={idx} />
          ))}
        </div>
      ) : studios.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <Search className="h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 font-display text-xl font-bold text-foreground">
            No studios match your current filter
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Try clearing your search keyword or switching to another studio
            category.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={resetFilters}
            className="mt-6 gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted-foreground tabular-nums">
            Showing <strong className="text-foreground">{studios.length}</strong>{" "}
            {studios.length === 1 ? "studio" : "studios"}
            {selectedCategory !== "All" ? ` in ${selectedCategory}` : ""}
          </p>
          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {studios.map((studio) => (
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
        </>
      )}
    </div>
  );
}

export default function ExploreStudiosPage() {
  return (
    <React.Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <StudioCardSkeleton key={idx} />
            ))}
          </div>
        </div>
      }
    >
      <ExploreStudiosContent />
    </React.Suspense>
  );
}
