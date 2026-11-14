import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { STUDIO_CATEGORIES } from "@/lib/types";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us | StudioSpace",
  description:
    "Learn about StudioSpace—our mission to connect creators with independent creative spaces under transparent hourly terms.",
};

const PILLARS = [
  {
    title: "Conflict-checked scheduling",
    description:
      "Every studio detail page surfaces locked booking blocks by date and validates overlaps server-side before reserving your slot.",
  },
  {
    title: "Transparent hourly rates",
    description:
      "Hosts list clear hourly pricing, capacity limits, minimum session duration, and refundable security deposits upfront.",
  },
  {
    title: "Verified creator reviews",
    description:
      "Feedback comes directly from authenticated StudioSpace accounts who completed a session at that space.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl border-b border-border pb-10">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          Creative rooms without the scheduling friction
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          StudioSpace is a peer-to-peer marketplace built for photographers,
          filmmakers, podcasters, musicians, and independent makers looking for
          dependable space by the hour.
        </p>
      </div>

      {/* Host Guarantee & Visual */}
      <section className="grid grid-cols-1 items-center gap-10 py-12 sm:py-14 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3.5 py-1.5 text-xs font-semibold text-accent-foreground">
            <ShieldCheck className="h-4 w-4" />
            <span>Host Guarantee &amp; Creator Support</span>
          </div>

          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Protected studios. Clear terms for every shoot.
          </h2>

          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            Whether you operate an acoustic vocal booth or a daylight loft with
            full strobe grip, your equipment list and studio hours stay organized
            in one calm workspace.
          </p>

          <ul className="space-y-2.5 text-sm text-foreground">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
              <span>Automatic double-booking protection across confirmed slots</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
              <span>Session-verified authentication and ownership controls on edits</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
              <span>Downloadable PDF booking receipts for production accounting</span>
            </li>
          </ul>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/studios">
              <Button size="lg">Browse Studios</Button>
            </Link>
            <Link href="/add-studio">
              <Button size="lg" variant="outline">
                List Your Space
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border">
          <img
            src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80"
            alt="Architectural daylight creative studio interior"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      {/* Standards */}
      <section className="border-t border-border py-12 sm:py-14">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            What we standardize
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Every listing follows the same pricing and availability structure so you can compare spaces in seconds.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-3 md:divide-x md:divide-y-0">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="p-6">
              <h3 className="font-display text-base font-bold tracking-tight text-foreground">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Disciplines */}
      <section className="border-t border-border pt-12 sm:pt-14">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Five creative disciplines
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Jump directly into curated spaces filtered by discipline.
            </p>
          </div>
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Read how booking works
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-5 lg:divide-x">
          {STUDIO_CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/studios?category=${encodeURIComponent(category)}`}
              className="group flex items-center justify-center border-border p-5 text-center transition-colors hover:bg-secondary/40 sm:border-b lg:border-b-0"
            >
              <span className="font-display text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                {category}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
