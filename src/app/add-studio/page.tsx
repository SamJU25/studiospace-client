import { StudioForm } from "@/components/studios/StudioForm";

export default function AddStudioPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          List a Creative Studio
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Share your photography loft, sound stage, podcast room, or workshop
          with vetted creators.
        </p>
      </div>

      <StudioForm mode="create" />
    </div>
  );
}
