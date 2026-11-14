"use client";

import * as React from "react";
import Link from "next/link";
import { Aperture, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { STUDIO_CATEGORIES } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  const [email, setEmail] = React.useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.info("Dispatch preview saved for this browser session.");
    setEmail("");
  };

  return (
    <footer className="border-t border-border bg-card text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Mission */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Aperture className="h-5 w-5" />
              </span>
              <span className="font-display text-xl font-bold tracking-tight">
                StudioSpace
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Connecting photographers, filmmakers, podcasters, and musicians
              with independent production spaces built for real creative work.
            </p>
            <div className="flex items-center gap-3 pt-1">
              {/* New X logo */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow StudioSpace on X"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4 w-4 fill-current"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow StudioSpace on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="StudioSpace on YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                  <path d="m10 15 5-3-5-3v6Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
              Quick Links
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/studios" className="hover:text-primary transition-colors">
                  Explore Studios
                </Link>
              </li>
              <li>
                <Link href="/add-studio" className="hover:text-primary transition-colors">
                  Host Your Space
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-primary transition-colors">
                  How Booking Works
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About &amp; Host Guarantee
                </Link>
              </li>
              <li>
                <Link href="/my-bookings" className="hover:text-primary transition-colors">
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
              Studio Categories
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {STUDIO_CATEGORIES.map((category) => (
                <li key={category}>
                  <Link
                    href={`/studios?category=${encodeURIComponent(category)}`}
                    className="hover:text-primary transition-colors"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
              Creator Dispatch
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Get curated acoustic rooms, daylight lofts, and seasonal host
              rates straight to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
                aria-label="Newsletter email"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className={buttonVariants({ size: "icon" })}
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} StudioSpace Inc. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/about#terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/about#privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/about#guarantee" className="hover:text-foreground transition-colors">
              Host Insurance
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
