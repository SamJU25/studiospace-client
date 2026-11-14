"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Plus, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import { STUDIO_CATEGORIES, type Studio } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StudioCardSkeleton } from "@/components/ui/skeleton";
import { StudioCard } from "@/components/studios/StudioCard";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest Listed" },
  { value: "rating", label: "Top Rated" },
  { value: "price_asc", label: "Hourly Rate: Low to High" },
  { value: "price_desc", label: "Hourly Rate: High to Low" },
];

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
  const [fetchError, setFetchError] = React.useState(false);
  const [reloadNonce, setReloadNonce] = React.useState(0);

  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const handleSlashFocus = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        target?.isContentEditable
      ) {
        return;
      }
      e.preventDefault();
      searchInputRef.current?.focus();
    };
    window.addEventListener("keydown", handleSlashFocus);
    return () => window.removeEventListener("keydown", handleSlashFocus);
  }, []);

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

  const requestKey = `${selectedCategory}|${debouncedSearch}|${sortBy}|${reloadNonce}`;
  const loading = fetchedKey !== requestKey;

  React.useEffect(() => {
    let active = true;
    const url = queryParamsString
      ? `/api/studios?${queryParamsString}`
      : "/api/studios";

    apiFetch<{ studios: Studio[] }>(url)
      .then((res) => {
        if (active) {
          setFetchError(false);
          setStudios(res.studios || []);
        }
      })
      .catch(() => {
        if (active) {
          setFetchError(true);
          setStudios([]);
        }
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

        <Link
          href="/add-studio"
          className={cn(buttonVariants(), "gap-2")}
        >
          <Plus className="h-4 w-4" />
          Host Your Studio
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="mt-8 space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              aria-label="Search studios by title, city, or gear"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title, city, or gear (e.g. Profoto, SM7B)..."
              className="pl-10 pr-9"
            />
            {searchInput && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearchInput("");
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Sort:</span>
            </div>
            <Select
              value={sortBy}
              onChange={setSortBy}
              options={SORT_OPTIONS}
              ariaLabel="Sort studios"
              align="end"
              className="min-w-[195px]"
            />
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
                aria-pressed={active}
                onClick={() => handleCategorySelect(cat)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
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
      ) : fetchError ? (
        <div
          role="alert"
          className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-16 text-center"
        >
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <h2 className="mt-4 font-display text-xl font-bold text-foreground">
            Unable to load studios right now
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Something went wrong while contacting the directory API.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setReloadNonce((n) => n + 1)}
            className="mt-6 gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Retry
          </Button>
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
          <h2 className="mt-6 text-sm font-normal text-muted-foreground tabular-nums">
            Showing <strong className="font-semibold text-foreground">{studios.length}</strong>{" "}
            {studios.length === 1 ? "studio" : "studios"}
            {selectedCategory !== "All" ? ` in ${selectedCategory}` : ""}
          </h2>
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
