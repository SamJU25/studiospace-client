import Link from "next/link";
import {
  ArrowUpRight,
  Camera,
  CheckCircle2,
  Clapperboard,
  Headphones,
  Mic,
  Palette,
  Search,
  ShieldCheck,
  FileCheck2,
  CalendarClock,
} from "lucide-react";
import type { StudioCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";

const CATEGORY_CARDS: {
  name: StudioCategory;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  image: string;
}[] = [
  {
    name: "Photo Studios",
    description: "Cyclorama walls, natural light lofts & strobe kits",
    icon: Camera,
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Sound Stages",
    description: "Acoustic isolation, pre-lit grids & crew bays",
    icon: Clapperboard,
    image:
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Podcast Rooms",
    description: "Multi-cam 4K rigs & broadcast vocal chains",
    icon: Mic,
    image:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Music Suites",
    description: "Tuned control rooms, outboard gear & booths",
    icon: Headphones,
    image:
      "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Art Workshops",
    description: "Ceramics wheels, print tables & open daylight",
    icon: Palette,
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=80",
  },
];

const WORKFLOW_STEPS = [
  {
    step: "1. Discover Spaces",
    description:
      "Filter by studio type, hourly rate, crew capacity, and neighborhood equipment lists.",
    icon: Search,
  },
  {
    step: "2. Pick Your Time Slot",
    description:
      "Check live confirmed slots on each studio page and pick an exact start and end hour.",
    icon: CalendarClock,
  },
  {
    step: "3. Book & Confirm",
    description:
      "Submit your project brief. Our double-booking guard keeps confirmed sessions collision-free.",
    icon: CheckCircle2,
  },
  {
    step: "4. Create & Wrap",
    description:
      "Check in with your host, produce your session, and download your official PDF booking receipt.",
    icon: FileCheck2,
  },
];

export function CategoriesAndTrustSections() {
  return (
    <>
      {/* Browse by Studio Categories */}
      <section className="border-y border-border bg-secondary/45">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Browse by Studio Category
            </h2>
            <p className="mt-2 text-base text-muted-foreground">
              Jump directly into spaces outfitted for your specific discipline.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {CATEGORY_CARDS.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={`/studios?category=${encodeURIComponent(cat.name)}`}
                  className="group relative flex h-64 flex-col justify-end overflow-hidden rounded-2xl border border-border/80 bg-neutral-900 p-5 text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-white/30"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-75 transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <span
                    aria-hidden="true"
                    className="absolute right-3.5 top-3.5 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white/75 opacity-75 backdrop-blur-sm transition-all duration-200 group-hover:border-white/35 group-hover:text-white group-hover:opacity-100"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                  <div className="relative z-10 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0 text-white/85" />
                      <h3 className="font-display text-[15px] font-semibold tracking-tight leading-snug whitespace-nowrap">
                        {cat.name}
                      </h3>
                    </div>
                    <p className="text-xs leading-relaxed text-neutral-200">
                      {cat.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Extra Section 1: How Booking Works — Hairline Bento Flow */}
      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How Booking Works
          </h2>
          <p className="mt-2 text-base text-muted-foreground">
            From scouting a location to wrapping your shoot—built to stay fast
            and conflict-free.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {WORKFLOW_STEPS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="flex flex-col p-6 sm:border-b lg:border-b-0 border-border transition-colors hover:bg-secondary/30"
              >
                <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <span>STEP 0{idx + 1}</span>
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <h3 className="mt-5 font-display text-base font-bold tracking-tight text-foreground">
                  {item.step.replace(/^\d+\.\s*/, "")}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Extra Section 2: Host Guarantee & Creator Support */}
      <section
        id="about-us"
        className="border-t border-border bg-secondary/45"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 rounded-3xl border border-border bg-card p-8 sm:p-12 lg:grid-cols-2">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3.5 py-1.5 text-xs font-semibold text-accent-foreground">
                <ShieldCheck className="h-4 w-4" />
                <span>Host Guarantee & Creator Support</span>
              </div>

              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Protected Studios. Transparent Hourly Pricing.
              </h2>

              <p className="text-base leading-relaxed text-muted-foreground">
                Every StudioSpace booking includes transparent refundable
                security deposits, conflict-checked schedules, and direct host
                messaging. Whether you manage a boutique darkroom or a full
                cinema stage, your gear and calendar stay protected.
              </p>

              <ul className="space-y-2.5 text-sm text-foreground">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Automatic double-booking protection across confirmed slots</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>JWT & HTTPOnly cookie authentication on all mutations</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Downloadable PDF booking receipts for production accounting</span>
                </li>
              </ul>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/add-studio">
                  <Button size="lg">List Your Studio</Button>
                </Link>
                <Link href="/studios">
                  <Button size="lg" variant="outline">
                    Browse All Spaces
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-border aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80"
                alt="Architectural daylight creative studio interior"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
