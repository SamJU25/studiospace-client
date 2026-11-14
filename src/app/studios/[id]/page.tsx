"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Heart,
  MapPin,
  Shield,
  Star,
  User as UserIcon,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { authClient } from "@/lib/auth-client";
import { apiFetch, ApiError } from "@/lib/api";
import type { ConfirmedSlot, Review, Studio } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { StudioBookingModal } from "@/components/studios/StudioBookingModal";

function calculateHours(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = eh * 60 + em - (sh * 60 + sm);
  return diff > 0 ? Number((diff / 60).toFixed(2)) : 0;
}

export default function StudioDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [studio, setStudio] = React.useState<Studio | null>(null);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [confirmedSlots, setConfirmedSlots] = React.useState<ConfirmedSlot[]>(
    []
  );
  const [loadedId, setLoadedId] = React.useState<string>("");
  const [isSaved, setIsSaved] = React.useState(false);

  const loading = loadedId !== id;

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = React.useState(false);
  const [bookingDate, setBookingDate] = React.useState(() => {
    const tomorrow = new Date(Date.now() + 86400000);
    return tomorrow.toISOString().split("T")[0];
  });
  const [startTime, setStartTime] = React.useState("10:00");
  const [endTime, setEndTime] = React.useState("13:00");
  const [projectNotes, setProjectNotes] = React.useState("");
  const [bookingError, setBookingError] = React.useState("");
  const [bookingSubmitting, setBookingSubmitting] = React.useState(false);

  // Review Form State
  const [reviewRating, setReviewRating] = React.useState(5);
  const [reviewComment, setReviewComment] = React.useState("");
  const [reviewSubmitting, setReviewSubmitting] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    apiFetch<{
      studio: Studio;
      reviews: Review[];
      confirmedSlots: ConfirmedSlot[];
    }>(`/api/studios/${id}`)
      .then((res) => {
        if (!active) return;
        setStudio(res.studio);
        setReviews(res.reviews || []);
        setConfirmedSlots(res.confirmedSlots || []);
      })
      .catch(() => {
        if (active) setStudio(null);
      })
      .finally(() => {
        if (active) setLoadedId(id);
      });

    return () => {
      active = false;
    };
  }, [id]);

  React.useEffect(() => {
    if (!userId || !id) return;
    let active = true;
    apiFetch<{ studioIds: string[] }>("/api/wishlist", { requireAuth: true })
      .then((res) => {
        if (active) setIsSaved((res.studioIds || []).includes(id));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [userId, id]);

  const handleToggleWishlist = async () => {
    if (!session?.user) {
      toast.info("Please sign in to save studios to your wishlist.");
      router.push(`/login?callbackUrl=/studios/${id}`);
      return;
    }

    try {
      const res = await apiFetch<{ saved: boolean }>("/api/wishlist/toggle", {
        method: "POST",
        requireAuth: true,
        body: JSON.stringify({ studioId: id }),
      });
      setIsSaved(res.saved);
      toast.success(
        res.saved ? "Saved to your wishlist." : "Removed from wishlist."
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update wishlist."
      );
    }
  };

  const handleOpenBooking = () => {
    if (!session?.user) {
      toast.info("Please sign in to book this studio.");
      router.push(`/login?callbackUrl=/studios/${id}`);
      return;
    }
    setBookingError("");
    setBookingModalOpen(true);
  };

  const hours = calculateHours(startTime, endTime);
  const estimatedTotal = studio ? hours * studio.hourlyRate : 0;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError("");

    if (hours <= 0) {
      setBookingError("End time must be later than start time.");
      return;
    }

    setBookingSubmitting(true);
    try {
      await apiFetch("/api/bookings", {
        method: "POST",
        requireAuth: true,
        body: JSON.stringify({
          studioId: id,
          bookingDate,
          startTime,
          endTime,
          projectNotes,
          customerName: session?.user?.name || session?.user?.email,
        }),
      });

      toast.success("Booking request submitted! Status: Pending confirmation.");
      setBookingModalOpen(false);
      router.push("/my-bookings");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Unable to complete booking request.";
      setBookingError(message);
      toast.error(message);
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      toast.info("Sign in to leave a review.");
      router.push(`/login?callbackUrl=/studios/${id}`);
      return;
    }
    if (!reviewComment.trim()) {
      toast.error("Please write a short review comment.");
      return;
    }

    setReviewSubmitting(true);
    try {
      const res = await apiFetch<{
        review: Review;
        rating: number;
        reviewCount: number;
      }>(`/api/studios/${id}/reviews`, {
        method: "POST",
        requireAuth: true,
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment.trim(),
          userName: session.user.name,
          userImage: session.user.image,
        }),
      });

      setReviews((prev) => [res.review, ...prev]);
      setStudio((prev) =>
        prev
          ? { ...prev, rating: res.rating, reviewCount: res.reviewCount }
          : prev
      );
      setReviewComment("");
      toast.success("Thank you for reviewing this studio!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not submit review."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-[420px] w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-28 w-full" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!studio) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Studio listing not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This studio may have been removed or the URL is incorrect.
        </p>
        <Link href="/studios" className="mt-6">
          <Button>Back to Explore Studios</Button>
        </Link>
      </div>
    );
  }

  const gallery =
    studio.galleryImages && studio.galleryImages.length > 0
      ? studio.galleryImages
      : [studio.imageUrl];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/studios"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Explore Studios
        </Link>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleToggleWishlist}
          className="gap-2"
        >
          <Heart
            className={cn(
              "h-4 w-4",
              isSaved && "fill-primary text-primary"
            )}
          />
          {isSaved ? "Saved" : "Save Studio"}
        </Button>
      </div>

      {/* Gallery Carousel */}
      <div className="overflow-hidden rounded-2xl border border-border bg-neutral-950">
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          className="h-[320px] sm:h-[440px] lg:h-[500px] w-full"
        >
          {gallery.map((img, index) => (
            <SwiperSlide key={`${img}-${index}`}>
              <img
                src={img}
                alt={`${studio.title} gallery ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Main Content + Booking Sidebar */}
      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Left Details Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-3 border-b border-border pb-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge>{studio.category}</Badge>
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold tabular-nums">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                {Number(studio.rating || 5).toFixed(1)} ({studio.reviewCount || 0}{" "}
                reviews)
              </span>
            </div>

            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {studio.title}
            </h1>

            <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                {studio.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                Max {studio.maxCapacity} crew members
              </span>
            </div>
          </div>

          {/* Overview */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              Studio Overview
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground whitespace-pre-line">
              {studio.description}
            </p>
          </section>

          {/* Amenities */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              Included Amenities & Gear
            </h2>
            {studio.amenities.length > 0 ? (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {studio.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Contact the host for detailed gear and lighting specifications.
              </p>
            )}
          </section>

          {/* Host Info */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold text-foreground">
              Hosted By
            </h2>
            <div className="mt-4 flex items-center gap-4">
              {studio.ownerImage ? (
                <img
                  src={studio.ownerImage}
                  alt={studio.ownerName}
                  className="h-12 w-12 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
                  <UserIcon className="h-6 w-6" />
                </div>
              )}
              <div>
                <p className="font-semibold text-foreground">
                  {studio.ownerName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {studio.ownerEmail}
                </p>
              </div>
            </div>
          </section>

          {/* Reviews */}
          <section className="space-y-5 border-t border-border pt-8">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Creator Reviews ({reviews.length})
            </h2>

            <form
              onSubmit={handleReviewSubmit}
              className="rounded-2xl border border-border bg-card p-5 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Label id="review-rating-label" className="font-semibold">
                  Share your session experience
                </Label>
                <div
                  role="radiogroup"
                  aria-labelledby="review-rating-label"
                  className="flex items-center gap-1"
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      role="radio"
                      aria-checked={num === reviewRating}
                      onClick={() => setReviewRating(num)}
                      aria-label={`Rate ${num} star${num > 1 ? "s" : ""}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary cursor-pointer transition-colors"
                    >
                      <Star
                        className={cn(
                          "h-5 w-5",
                          num <= reviewRating
                            ? "fill-amber-500 text-amber-500"
                            : "text-muted-foreground"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                id="review-comment"
                aria-label="Review comment"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="How was the natural light, acoustic isolation, and host communication?"
                className="min-h-[84px]"
              />
              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={reviewSubmitting}>
                  {reviewSubmitting ? "Posting..." : "Post Review"}
                </Button>
              </div>
            </form>

            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No reviews yet. Book a session and share the first review!
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="rounded-xl border border-border bg-card p-5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm text-foreground">
                        {rev.userName}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground tabular-nums">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        {rev.rating}.0
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Sticky Booking Sidebar */}
        <aside className="space-y-6">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
            <div className="flex items-baseline justify-between border-b border-border pb-4">
              <div>
                <span className="font-display text-3xl font-extrabold text-foreground tabular-nums">
                  {formatCurrency(studio.hourlyRate)}
                </span>
                <span className="text-sm text-muted-foreground"> / hour</span>
              </div>
              <Badge variant="secondary" className="tabular-nums">
                Deposit: {formatCurrency(studio.securityDeposit)}
              </Badge>
            </div>

            <div className="space-y-2.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2.5">
                <Shield className="h-4 w-4 text-primary shrink-0" />
                <span>Refundable security deposit protected</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <span>Real-time confirmed slot conflict checking</span>
              </div>
            </div>

            <Button
              type="button"
              size="lg"
              onClick={handleOpenBooking}
              className="w-full"
            >
              Book Workspace Now
            </Button>

            {confirmedSlots.length > 0 && (
              <div className="rounded-xl border border-border bg-secondary/50 p-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Already Confirmed Slots
                </p>
                <ul className="space-y-1.5 text-xs text-muted-foreground tabular-nums">
                  {confirmedSlots.slice(0, 6).map((slot) => (
                    <li
                      key={slot._id}
                      className="flex items-center justify-between"
                    >
                      <span>{slot.bookingDate}</span>
                      <span className="font-mono font-medium text-foreground">
                        {slot.startTime} – {slot.endTime}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>

      <StudioBookingModal
        open={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        studio={studio}
        bookingDate={bookingDate}
        onBookingDateChange={setBookingDate}
        startTime={startTime}
        onStartTimeChange={setStartTime}
        endTime={endTime}
        onEndTimeChange={setEndTime}
        projectNotes={projectNotes}
        onProjectNotesChange={setProjectNotes}
        hours={hours}
        estimatedTotal={estimatedTotal}
        bookingError={bookingError}
        bookingSubmitting={bookingSubmitting}
        onSubmit={handleBookingSubmit}
      />
    </div>
  );
}
