"use client";

import * as React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { Studio } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";

interface StudioBookingModalProps {
  open: boolean;
  onClose: () => void;
  studio: Studio;
  bookingDate: string;
  onBookingDateChange: (val: string) => void;
  startTime: string;
  onStartTimeChange: (val: string) => void;
  endTime: string;
  onEndTimeChange: (val: string) => void;
  projectNotes: string;
  onProjectNotesChange: (val: string) => void;
  hours: number;
  estimatedTotal: number;
  bookingError: string;
  bookingSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

function getLocalDateIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function StudioBookingModal({
  open,
  onClose,
  studio,
  bookingDate,
  onBookingDateChange,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  projectNotes,
  onProjectNotesChange,
  hours,
  estimatedTotal,
  bookingError,
  bookingSubmitting,
  onSubmit,
}: StudioBookingModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Book ${studio.title}`}
      description="Pick your date and session hours. Confirmed bookings are protected against overlapping time slots."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {bookingError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 text-sm text-destructive"
          >
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{bookingError}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="booking-date">Session Date</Label>
          <Input
            id="booking-date"
            type="date"
            required
            min={getLocalDateIso()}
            value={bookingDate}
            onChange={(e) => onBookingDateChange(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="booking-start">Start Time</Label>
            <Input
              id="booking-start"
              type="time"
              required
              value={startTime}
              onChange={(e) => onStartTimeChange(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="booking-end">End Time</Label>
            <Input
              id="booking-end"
              type="time"
              required
              value={endTime}
              onChange={(e) => onEndTimeChange(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="booking-notes">Project Brief / Crew Notes</Label>
          <Textarea
            id="booking-notes"
            value={projectNotes}
            onChange={(e) => onProjectNotesChange(e.target.value)}
            placeholder="Share crew count, lighting needs, or load-in timing..."
            className="min-h-[80px]"
          />
        </div>

        <div className="rounded-xl border border-border bg-secondary/45 p-4 text-sm space-y-1.5 tabular-nums">
          <div className="flex justify-between text-muted-foreground">
            <span>
              {formatCurrency(studio.hourlyRate)} × {hours} hr(s)
            </span>
            <span className="font-semibold text-foreground">
              {formatCurrency(estimatedTotal)}
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Refundable Security Deposit</span>
            <span>{formatCurrency(studio.securityDeposit)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={bookingSubmitting}>
            {bookingSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Confirm Booking Request"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
