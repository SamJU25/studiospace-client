"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Aperture,
  CalendarCheck,
  ChevronDown,
  Heart,
  LayoutDashboard,
  ListMusic,
  LogOut,
  Menu,
  PlusSquare,
  User as UserIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { clearServerCookie } from "@/lib/api";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Explore Studios", href: "/studios" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About Us", href: "/about" },
];

function isNavItemActive(href: string, pathname: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const closeMenus = () => {
    setDropdownOpen(false);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      await clearServerCookie();
      toast.success("Signed out of StudioSpace.");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          onClick={closeMenus}
          className="flex items-center gap-2.5 group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
            <Aperture className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-foreground">
            StudioSpace
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((item) => {
            const isActive = isNavItemActive(item.href, pathname);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenus}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {isPending ? (
            <div className="hidden sm:block h-9 w-28 animate-pulse rounded-lg bg-muted" />
          ) : user ? (
            <div
              className="relative hidden sm:block"
              ref={dropdownRef}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                  setDropdownOpen(false);
                }
              }}
            >
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
                className="flex h-9 items-center gap-2 rounded-full border border-border bg-card pl-1.5 pr-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User avatar"}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <UserIcon className="h-4 w-4" />
                  </span>
                )}
                <span className="max-w-[120px] truncate">
                  {user.name || user.email.split("@")[0]}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full pt-2 w-60 z-50">
                  <div className="rounded-xl border border-border bg-popover p-1.5 shadow-xl">
                    <div className="px-3 py-2 border-b border-border mb-1">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {user.name || "Creator"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={closeMenus}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                      Dashboard
                    </Link>
                    <Link
                      href="/add-studio"
                      onClick={closeMenus}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                    >
                      <PlusSquare className="h-4 w-4 text-muted-foreground" />
                      Add New Studio
                    </Link>
                    <Link
                      href="/my-listings"
                      onClick={closeMenus}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                    >
                      <ListMusic className="h-4 w-4 text-muted-foreground" />
                      My Studio Listings
                    </Link>
                    <Link
                      href="/my-bookings"
                      onClick={closeMenus}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                    >
                      <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                      My Bookings
                    </Link>
                    <Link
                      href="/wishlist"
                      onClick={closeMenus}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                    >
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      Saved Studios
                    </Link>

                    <div className="my-1 border-t border-border" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-9 px-3.5")}
              >
                Login
              </Link>
              <Link
                href="/register"
                className={cn(buttonVariants({ size: "sm" }), "h-9 px-3.5")}
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
            aria-label="Toggle navigation menu"
            className="inline-flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:bg-secondary cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          id="mobile-nav-drawer"
          className="md:hidden border-t border-border bg-card px-4 py-4 space-y-2"
        >
          {NAV_LINKS.map((item) => {
            const isActive = isNavItemActive(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenus}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "block rounded-lg px-3 py-2.5 text-sm font-medium",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-secondary"
                )}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-border space-y-1.5">
            {user ? (
              <>
                <div className="px-3 py-1.5 text-xs text-muted-foreground">
                  Signed in as <strong className="text-foreground">{user.name || user.email}</strong>
                </div>
                <Link
                  href="/dashboard"
                  onClick={closeMenus}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
                    pathname.startsWith("/dashboard")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "hover:bg-secondary"
                  )}
                >
                  <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                  Dashboard
                </Link>
                <Link
                  href="/add-studio"
                  onClick={closeMenus}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
                    pathname.startsWith("/add-studio")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "hover:bg-secondary"
                  )}
                >
                  <PlusSquare className="h-4 w-4 text-muted-foreground" />
                  Add New Studio
                </Link>
                <Link
                  href="/my-listings"
                  onClick={closeMenus}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
                    pathname.startsWith("/my-listings")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "hover:bg-secondary"
                  )}
                >
                  <ListMusic className="h-4 w-4 text-muted-foreground" />
                  My Studio Listings
                </Link>
                <Link
                  href="/my-bookings"
                  onClick={closeMenus}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
                    pathname.startsWith("/my-bookings")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "hover:bg-secondary"
                  )}
                >
                  <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                  My Bookings
                </Link>
                <Link
                  href="/wishlist"
                  onClick={closeMenus}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
                    pathname.startsWith("/wishlist")
                      ? "bg-accent text-accent-foreground font-medium"
                      : "hover:bg-secondary"
                  )}
                >
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  Saved Studios
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 text-left rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={closeMenus}
                  className={cn(buttonVariants({ variant: "outline" }), "flex-1")}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={closeMenus}
                  className={cn(buttonVariants(), "flex-1")}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
