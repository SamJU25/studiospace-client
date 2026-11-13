import Link from "next/link";
import { Aperture, ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
      <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-border bg-card shadow-sm">
        <Aperture className="h-11 w-11 text-primary" />
        <span className="absolute -right-2 -top-2 rounded-full bg-primary px-2.5 py-0.5 font-mono text-xs font-bold text-primary-foreground">
          404
        </span>
      </div>

      <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        This studio door is locked
      </h1>
      <p className="mt-3 max-w-md text-base text-muted-foreground">
        The room or listing you are looking for does not exist or may have been
        moved by its host.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button size="lg" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Return to Home
          </Button>
        </Link>
        <Link href="/studios">
          <Button size="lg" variant="outline" className="gap-2">
            <Compass className="h-4 w-4" />
            Explore Studios
          </Button>
        </Link>
      </div>
    </div>
  );
}
