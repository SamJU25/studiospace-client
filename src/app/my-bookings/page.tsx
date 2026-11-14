"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  CalendarX2,
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  MapPin,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import { generateBookingInvoicePdf } from "@/lib/invoice";
import type { Booking, BookingStatus } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";

function getStatusBadgeVariant(status: BookingStatus) {
  switch (status) {
    case "Confirmed":
      return "success";
    case "Completed":
      return "info";
    case "Cancelled":
      return "destructive";
    default:
      return "warning";
  }
}

export default function MyBookingsPage() {
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const [activeTab, setActiveTab] = React.useState<"guest" | "host">("guest");
  const [myBookings, setMyBookings] = React.useState<Booking[]>([]);
  const [hostBookings, setHostBookings] = React.useState<Booking[]>([]);
  const [fetchedForUser, setFetchedForUser] = React.useState<string>("");
  const [bookingToCancel, setBookingToCancel] = React.useState<Booking | null>(
    null
  );
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isPending || !userId) return;

    let active = true;
    Promise.all([
      apiFetch<{ bookings: Booking[] }>("/api/bookings/my", {
        requireAuth: true,
      }),
      apiFetch<{ bookings: Booking[] }>("/api/bookings/host", {
        requireAuth: true,
      }),
    ])
      .then(([guestRes, hostRes]) => {
        if (!active) return;
        setMyBookings(guestRes.bookings || []);
        setHostBookings(hostRes.bookings || []);
      })
      .catch((err) => {
        if (active) {
          toast.error(
            err instanceof Error ? err.message : "Failed to load bookings."
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

  const handleConfirmCancelBooking = async () => {
    if (!bookingToCancel) return;
    setProcessingId(bookingToCancel._id);
    try {
      await apiFetch(`/api/bookings/${bookingToCancel._id}`, {
        method: "DELETE",
        requireAuth: true,
      });
      setMyBookings((prev) =>
        prev.filter((item) => item._id !== bookingToCancel._id)
      );
      toast.success("Pending booking has been cancelled.");
      setBookingToCancel(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not cancel booking."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleHostStatusChange = async (
    bookingId: string,
    status: BookingStatus
  ) => {
    setProcessingId(bookingId);
    try {
      const res = await apiFetch<{ booking: Booking }>(
        `/api/bookings/${bookingId}/status`,
        {
          method: "PATCH",
          requireAuth: true,
          body: JSON.stringify({ status }),
        }
      );
      setHostBookings((prev) =>
        prev.map((item) => (item._id === bookingId ? res.booking : item))
      );
      setMyBookings((prev) =>
        prev.map((item) => (item._id === bookingId ? res.booking : item))
      );
      toast.success(`Booking status updated to ${status}.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update booking status."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const activeList = activeTab === "guest" ? myBookings : hostBookings;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Bookings & Studio Schedule
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Track session confirmations, download PDF receipts, and manage
            incoming host requests.
          </p>
        </div>

        <Link href="/studios">
          <Button variant="outline">Browse More Studios</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("guest")}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-semibold transition-colors cursor-pointer",
            activeTab === "guest"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          My Reservations ({myBookings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("host")}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-semibold transition-colors cursor-pointer",
            activeTab === "host"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          Host Requests ({hostBookings.length})
        </button>
      </div>

      {loading ? (
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      ) : activeList.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <CalendarX2 className="h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 font-display text-xl font-bold text-foreground">
            {activeTab === "guest"
              ? "No studio bookings yet"
              : "No incoming host requests yet"}
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {activeTab === "guest"
              ? "Explore verified creative spaces and reserve an hourly session for your next shoot."
              : "Once creators request hours at your listed studios, you can confirm or manage them here."}
          </p>
          <Link
            href={activeTab === "guest" ? "/studios" : "/add-studio"}
            className="mt-6"
          >
            <Button>
              {activeTab === "guest" ? "Explore Studios" : "List a Studio"}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {activeList.map((booking) => {
            const isBusy = processingId === booking._id;
            return (
              <div
                key={booking._id}
                className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link
                    href={`/studios/${booking.studioId}`}
                    className="h-24 w-full sm:w-36 shrink-0 overflow-hidden rounded-xl bg-muted"
                  >
                    <img
                      src={booking.studioImage}
                      alt={booking.studioTitle}
                      className="h-full w-full object-cover"
                    />
                  </Link>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(booking.status)}>
                        {booking.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {booking.studioCategory}
                      </span>
                    </div>

                    <Link
                      href={`/studios/${booking.studioId}`}
                      className="block font-display text-lg font-bold text-foreground hover:text-primary transition-colors"
                    >
                      {booking.studioTitle}
                    </Link>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {booking.studioLocation}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        {booking.bookingDate}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        {booking.startTime} – {booking.endTime} ({booking.totalHours}h)
                      </span>
                    </div>

                    {activeTab === "host" && (
                      <p className="text-xs text-muted-foreground">
                        Guest: <strong className="text-foreground">{booking.customerName}</strong> ({booking.customerEmail})
                      </p>
                    )}

                    {booking.projectNotes && (
                      <p className="text-xs text-muted-foreground italic">
                        &ldquo;{booking.projectNotes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Price & Actions */}
                <div className="flex flex-col items-start gap-3 border-t border-border pt-4 sm:items-end sm:border-t-0 sm:pt-0">
                  <div className="sm:text-right tabular-nums">
                    <p className="font-display text-xl font-extrabold text-foreground">
                      {formatCurrency(booking.totalPrice)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      +{formatCurrency(booking.securityDeposit)} deposit
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {(booking.status === "Confirmed" ||
                      booking.status === "Completed") && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          generateBookingInvoicePdf(booking);
                          toast.success("PDF invoice downloaded.");
                        }}
                        className="gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5" />
                        PDF Invoice
                      </Button>
                    )}

                    {activeTab === "guest" && booking.status === "Pending" && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={isBusy}
                        onClick={() => setBookingToCancel(booking)}
                        className="gap-1.5"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Cancel Booking
                      </Button>
                    )}

                    {activeTab === "host" && booking.status === "Pending" && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          disabled={isBusy}
                          onClick={() =>
                            handleHostStatusChange(booking._id, "Confirmed")
                          }
                          className="gap-1.5"
                        >
                          {isBusy ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          Confirm
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={isBusy}
                          onClick={() =>
                            handleHostStatusChange(booking._id, "Cancelled")
                          }
                        >
                          Decline
                        </Button>
                      </>
                    )}

                    {activeTab === "host" && booking.status === "Confirmed" && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isBusy}
                        onClick={() =>
                          handleHostStatusChange(booking._id, "Completed")
                        }
                      >
                        Mark Completed
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Booking Confirmation Modal */}
      <Modal
        open={Boolean(bookingToCancel)}
        onClose={() => !processingId && setBookingToCancel(null)}
        title="Cancel Pending Booking"
        description="This removes your pending reservation request."
      >
        <div className="space-y-5">
          <p className="text-sm text-foreground">
            Are you sure you want to cancel your booking for{" "}
            <strong>{bookingToCancel?.studioTitle}</strong> on{" "}
            <strong>{bookingToCancel?.bookingDate}</strong>?
          </p>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={Boolean(processingId)}
              onClick={() => setBookingToCancel(null)}
            >
              Keep Booking
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={Boolean(processingId)}
              onClick={handleConfirmCancelBooking}
              className="gap-2"
            >
              {processingId && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
