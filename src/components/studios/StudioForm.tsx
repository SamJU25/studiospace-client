"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, PlusCircle, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import { uploadImageToImgbb } from "@/lib/imgbb";
import { STUDIO_CATEGORIES, type Studio, type StudioCategory } from "@/lib/types";
import { isSafeHttpUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface StudioFormProps {
  mode: "create" | "edit";
  initialStudio?: Studio;
}

export function StudioForm({ mode, initialStudio }: StudioFormProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [title, setTitle] = React.useState(initialStudio?.title || "");
  const [category, setCategory] = React.useState<StudioCategory>(
    initialStudio?.category || "Photo Studios"
  );
  const [hourlyRate, setHourlyRate] = React.useState(
    initialStudio ? String(initialStudio.hourlyRate) : ""
  );
  const [securityDeposit, setSecurityDeposit] = React.useState(
    initialStudio ? String(initialStudio.securityDeposit) : "100"
  );
  const [maxCapacity, setMaxCapacity] = React.useState(
    initialStudio ? String(initialStudio.maxCapacity) : "8"
  );
  const [location, setLocation] = React.useState(initialStudio?.location || "");
  const [imageUrl, setImageUrl] = React.useState(initialStudio?.imageUrl || "");
  const [extraGalleryUrl, setExtraGalleryUrl] = React.useState(
    initialStudio?.galleryImages?.slice(1).join(", ") || ""
  );
  const [amenitiesText, setAmenitiesText] = React.useState(
    initialStudio?.amenities?.join(", ") || ""
  );
  const [description, setDescription] = React.useState(
    initialStudio?.description || ""
  );
  const [uploading, setUploading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageToImgbb(file);
      setImageUrl(url);
      toast.success("Studio cover photo uploaded to ImgBB.");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "ImgBB upload failed. Please paste a direct image URL."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      toast.error("Please log in to publish or update a studio.");
      router.push("/login");
      return;
    }

    const rate = Number(hourlyRate);
    const deposit = Number(securityDeposit || 0);
    const capacity = Number(maxCapacity);

    if (!title.trim() || !location.trim() || !imageUrl.trim() || !description.trim()) {
      toast.error("Please complete all required studio fields.");
      return;
    }

    if (!Number.isFinite(rate) || rate <= 0) {
      toast.error("Hourly rate must be greater than $0.");
      return;
    }

    if (!Number.isFinite(capacity) || capacity <= 0) {
      toast.error("Max capacity must be at least 1 person.");
      return;
    }

    const amenities = amenitiesText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const galleryImages = [
      imageUrl.trim(),
      ...extraGalleryUrl
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean),
    ];

    if (galleryImages.some((url) => !isSafeHttpUrl(url))) {
      toast.error("All cover and gallery image URLs must use http:// or https://.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        category,
        hourlyRate: rate,
        securityDeposit: Math.max(0, deposit),
        maxCapacity: capacity,
        location: location.trim(),
        imageUrl: imageUrl.trim(),
        galleryImages,
        amenities,
        description: description.trim(),
        ownerName: session.user.name || session.user.email.split("@")[0],
        ownerImage: session.user.image || undefined,
      };

      if (mode === "create") {
        await apiFetch("/api/studios", {
          method: "POST",
          requireAuth: true,
          body: JSON.stringify(payload),
        });
        toast.success("Studio published to StudioSpace!");
      } else if (initialStudio) {
        await apiFetch(`/api/studios/${initialStudio._id}`, {
          method: "PATCH",
          requireAuth: true,
          body: JSON.stringify(payload),
        });
        toast.success("Studio listing updated.");
      }

      router.push("/my-listings");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save studio listing."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="studio-title">Studio Title *</Label>
          <Input
            id="studio-title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Northlight Cyclorama & Daylight Loft"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="studio-category">Category *</Label>
          <select
            id="studio-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as StudioCategory)}
            className="flex h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {STUDIO_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="studio-location">Location / Address *</Label>
          <Input
            id="studio-location"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Brooklyn Arts District, NY"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="studio-rate">Hourly Rate (USD) *</Label>
          <Input
            id="studio-rate"
            type="number"
            min="1"
            step="1"
            required
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            placeholder="95"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="studio-deposit">Security Deposit (USD)</Label>
          <Input
            id="studio-deposit"
            type="number"
            min="0"
            step="1"
            value={securityDeposit}
            onChange={(e) => setSecurityDeposit(e.target.value)}
            placeholder="150"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="studio-capacity">Max Crew Capacity *</Label>
          <Input
            id="studio-capacity"
            type="number"
            min="1"
            step="1"
            required
            value={maxCapacity}
            onChange={(e) => setMaxCapacity(e.target.value)}
            placeholder="12"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="studio-amenities">
            Amenities & Equipment (comma-separated)
          </Label>
          <Input
            id="studio-amenities"
            value={amenitiesText}
            onChange={(e) => setAmenitiesText(e.target.value)}
            placeholder="Profoto Strobes, Cyclorama Wall, Fiber Wi-Fi"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="studio-image">
            Cover Image URL (or upload via ImgBB) *
          </Label>
          <div className="flex gap-2">
            <Input
              id="studio-image"
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
            />
            <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-border bg-secondary px-3.5 text-sm font-medium text-foreground hover:bg-secondary/80">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Upload</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
          {imageUrl && (
            <div className="mt-3 overflow-hidden rounded-xl border border-border aspect-[16/9] max-h-56 w-full bg-muted">
              <img
                src={imageUrl}
                alt="Studio cover preview"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="studio-gallery">
            Additional Gallery Image URLs (optional, comma-separated)
          </Label>
          <Input
            id="studio-gallery"
            value={extraGalleryUrl}
            onChange={(e) => setExtraGalleryUrl(e.target.value)}
            placeholder="https://..., https://..."
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="studio-description">Detailed Overview *</Label>
          <Textarea
            id="studio-description"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe natural light windows, acoustic isolation, ceiling height, load-in access, and included gear..."
          />
        </div>

        {/* Read-only Host Info */}
        <div className="space-y-1.5">
          <Label htmlFor="host-name">Host Name (Read-only)</Label>
          <Input
            id="host-name"
            readOnly
            disabled
            value={
              initialStudio?.ownerName ||
              session?.user?.name ||
              session?.user?.email?.split("@")[0] ||
              ""
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="host-email">Host Email (Read-only)</Label>
          <Input
            id="host-email"
            readOnly
            disabled
            value={initialStudio?.ownerEmail || session?.user?.email || ""}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="gap-2">
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : mode === "create" ? (
            <PlusCircle className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {submitting
            ? mode === "create"
              ? "Publishing..."
              : "Saving..."
            : mode === "create"
              ? "Publish Studio"
              : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
