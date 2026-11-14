"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarCheck,
  Heart,
  Inbox,
  PlusSquare,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import type { Booking, Studio } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const [counts, setCounts] = React.useState({
    listings: 0,
    myBookings: 0,
    hostRequests: 0,
    saved: 0,
  });
  const [fetchedForUser, setFetchedForUser] = React.useState<string>("");
  const [loadWarning, setLoadWarning] = React.useState(false);
  const [reloadNonce, setReloadNonce] = React.useState(0);

  React.useEffect(() => {
    if (isPending || !userId) return;

    let active = true;
    Promise.allSettled([
      apiFetch<{ studios: Studio[] }>("/api/studios/my-listings", {
        requireAuth: true,
      }),
      apiFetch<{ bookings: Booking[] }>("/api/bookings/my", {
        requireAuth: true,
      }),
      apiFetch<{ bookings: Booking[] }>("/api/bookings/host", {
        requireAuth: true,
      }),
      apiFetch<{ studioIds: string[] }>("/api/wishlist", {
        requireAuth: true,
      }),
    ])
      .then(([listingsRes, myBookingsRes, hostBookingsRes, wishlistRes]) => {
        if (!active) return;
        const anyRejected = [
          listingsRes,
          myBookingsRes,
          hostBookingsRes,
          wishlistRes,
        ].some((r) => r.status === "rejected");
        setLoadWarning(anyRejected);
        setCounts({
          listings:
            listingsRes.status === "fulfilled"
              ? listingsRes.value.studios?.length || 0
              : 0,
          myBookings:
            myBookingsRes.status === "fulfilled"
              ? myBookingsRes.value.bookings?.length || 0
              : 0,
          hostRequests:
            hostBookingsRes.status === "fulfilled"
              ? hostBookingsRes.value.bookings?.length || 0
              : 0,
          saved:
            wishlistRes.status === "fulfilled"
              ? wishlistRes.value.studioIds?.length || 0
              : 0,
        });
      })
      .finally(() => {
        if (active) setFetchedForUser(`${userId}:${reloadNonce}`);
      });

    return () => {
      active = false;
    };
  }, [isPending, userId, reloadNonce]);

  const loading =
    isPending || (Boolean(userId) && fetchedForUser !== `${userId}:${reloadNonce}`);

  const user = session?.user;

  const cards = [
    {
      label: "My Studio Listings",
      value: counts.listings,
      href: "/my-listings",
      icon: Building2,
      action: "Manage listings",
    },
    {
      label: "My Reservations",
      value: counts.myBookings,
      href: "/my-bookings",
      icon: CalendarCheck,
      action: "View schedule",
    },
    {
      label: "Host Requests",
      value: counts.hostRequests,
      href: "/my-bookings",
      icon: Inbox,
      action: "Review requests",
    },
    {
      label: "Saved Studios",
      value: counts.saved,
      href: "/wishlist",
      icon: Heart,
      action: "Open wishlist",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Creator & Host Dashboard
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            {user
              ? `Welcome back, ${user.name || user.email}.`
              : "Overview of your studio listings and bookings."}
          </p>
        </div>

        <Link href="/add-studio" className={cn(buttonVariants(), "gap-2")}>
          <PlusSquare className="h-4 w-4" />
          Add New Studio
        </Link>
      </div>

      {loadWarning && !loading && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <span className="inline-flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Some dashboard metrics could not be loaded.
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setReloadNonce((n) => n + 1)}
          >
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                href={card.href}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {card.label}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>

                <p className="mt-4 font-display text-4xl font-extrabold text-foreground tabular-nums">
                  {card.value}
                </p>

                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:underline">
                  {card.action}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
