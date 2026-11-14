import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarCheck2,
  ClipboardList,
  Compass,
  FileCheck2,
  ListChecks,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How It Works | StudioSpace",
  description:
    "See how creators book verified studios by the hour and how hosts manage equipment, schedules, and PDF receipts on StudioSpace.",
};

const CREATOR_STEPS = [
  {
    code: "STEP 01",
    title: "Scout by gear & discipline",
    description:
      "Filter spaces by Photo Studio, Sound Stage, Podcast Room, Music Suite, or Art Workshop, or search for specific kit like Profoto or SM7B.",
    icon: Compass,
  },
  {
    code: "STEP 02",
    title: "Check open time slots",
    description:
      "Every listing shows confirmed sessions on the selected date so you never request an already booked studio block.",
    icon: CalendarCheck2,
  },
  {
    code: "STEP 03",
    title: "Confirm transparent terms",
    description:
      "Review the hourly rate, minimum booking hours, capacity, and refundable security deposit before submitting your request.",
    icon: ShieldCheck,
  },
  {
    code: "STEP 04",
    title: "Produce & download receipt",
    description:
      "Coordinate check-in with your host, wrap your production, and export a clean PDF booking receipt for team accounting.",
    icon: FileCheck2,
  },
];

const HOST_STEPS = [
  {
    code: "HOST 01",
    title: "Publish room specs & gear",
    description:
      "List hourly rates, capacity, square footage, acoustic notes, and in-house equipment so crews arrive prepared.",
    icon: ClipboardList,
  },
  {
    code: "HOST 02",
    title: "Approve conflict-free bookings",
    description:
      "Incoming requests are automatically validated against confirmed bookings on your calendar—zero double-booking surprises.",
    icon: SlidersHorizontal,
  },
  {
    code: "HOST 03",
    title: "Complete & collect verified reviews",
    description:
      "Mark wrapped sessions as Completed to unlock verified creator reviews that boost visibility in StudioSpace rankings.",
    icon: ListChecks,
  },
];

const FAQ_ITEMS = [
  {
    question: "How does double-booking protection work?",
    answer:
      "When a host confirms a booking window on a given date, StudioSpace checks time-range overlap before accepting any new booking request for that same slot.",
  },
  {
    question: "When is a booking confirmed?",
    answer:
      "New requests start in Pending status so the host can verify production requirements. Once the host confirms, your slot is locked on the public schedule.",
  },
  {
    question: "Are deposits included in the hourly rate?",
    answer:
      "No. The studio hourly rate covers session time, while the refundable security deposit (if listed) is shown separately and returned after session wrap-up.",
  },
  {
    question: "Can I download an invoice for my production team?",
    answer:
      "Yes. Confirmed and completed bookings include a one-click PDF booking receipt directly from your My Bookings dashboard.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl border-b border-border pb-10">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          How booking a studio works
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          From scouting acoustic gear to downloading a finalized PDF receipt,
          every StudioSpace session follows a clear, conflict-free schedule.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/studios">
            <Button size="lg">Explore Studios</Button>
          </Link>
          <Link href="/add-studio">
            <Button size="lg" variant="outline">
              Host Your Studio
            </Button>
          </Link>
        </div>
      </div>

      {/* For Creators */}
      <section className="py-12 sm:py-14">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            For creators booking a session
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Four predictable steps to lock in the right space without back-and-forth emails.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {CREATOR_STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.code}
                className="flex flex-col border-border p-6 transition-colors hover:bg-secondary/30 sm:border-b lg:border-b-0"
              >
                <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                  <span>{item.code}</span>
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <h3 className="mt-5 font-display text-base font-bold tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* For Studio Hosts */}
      <section className="border-t border-border py-12 sm:py-14">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            For studio owners hosting space
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Keep your studio calendar protected while opening downtime hours to independent creators.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-3 md:divide-x md:divide-y-0">
          {HOST_STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.code}
                className="flex flex-col p-6 transition-colors hover:bg-secondary/30"
              >
                <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                  <span>{item.code}</span>
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <h3 className="mt-5 font-display text-base font-bold tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Common Questions */}
      <section className="border-t border-border py-12 sm:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Booking questions
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Clear policies around scheduling, deposits, and receipts before you reserve.
            </p>
          </div>

          <dl className="divide-y divide-border rounded-2xl border border-border bg-card px-6 lg:col-span-8">
            {FAQ_ITEMS.map((faq) => (
              <div key={faq.question} className="py-5">
                <dt className="font-display text-base font-bold text-foreground">
                  {faq.question}
                </dt>
                <dd className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
