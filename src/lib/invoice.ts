import { jsPDF } from "jspdf";
import type { Booking } from "./types";

export function generateBookingInvoicePdf(booking: Booking): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header band
  doc.setFillColor(20, 20, 19);
  doc.rect(0, 0, pageWidth, 110, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("StudioSpace", 48, 52);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(200, 196, 188);
  doc.text("Creative Workspace & Production Studio Booking Receipt", 48, 72);

  doc.setTextColor(224, 109, 66);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`STATUS: ${booking.status.toUpperCase()}`, pageWidth - 48, 52, {
    align: "right",
  });

  doc.setTextColor(200, 196, 188);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Booking Ref: ${booking._id.slice(-8).toUpperCase()}`, pageWidth - 48, 72, {
    align: "right",
  });

  // Details block
  let y = 152;
  doc.setTextColor(20, 20, 19);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(booking.studioTitle, 48, y);

  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 86, 80);
  doc.text(`${booking.studioCategory}  •  ${booking.studioLocation}`, 48, y);

  y += 32;
  doc.setDrawColor(230, 223, 213);
  doc.line(48, y, pageWidth - 48, y);

  y += 28;
  doc.setTextColor(20, 20, 19);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("BILLED TO", 48, y);
  doc.text("SESSION SCHEDULE", pageWidth / 2, y);

  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 58, 54);
  doc.text(booking.customerName, 48, y);
  doc.text(`Date: ${booking.bookingDate}`, pageWidth / 2, y);

  y += 16;
  doc.text(booking.customerEmail, 48, y);
  doc.text(`Time: ${booking.startTime} - ${booking.endTime}`, pageWidth / 2, y);

  y += 16;
  doc.text(`Host: ${booking.hostEmail}`, 48, y);
  doc.text(`Duration: ${booking.totalHours} hr(s)`, pageWidth / 2, y);

  // Pricing table
  y += 42;
  doc.setFillColor(248, 245, 240);
  doc.rect(48, y, pageWidth - 96, 28, "F");
  doc.setTextColor(20, 20, 19);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Description", 60, y + 18);
  doc.text("Rate", 330, y + 18);
  doc.text("Hours", 415, y + 18);
  doc.text("Amount", pageWidth - 60, y + 18, { align: "right" });

  y += 46;
  doc.setFont("helvetica", "normal");
  doc.text(`Studio Rental (${booking.studioTitle.slice(0, 34)})`, 60, y);
  doc.text(`$${booking.hourlyRate}/hr`, 330, y);
  doc.text(`${booking.totalHours}`, 415, y);
  doc.text(`$${booking.totalPrice.toFixed(2)}`, pageWidth - 60, y, {
    align: "right",
  });

  y += 26;
  doc.text("Refundable Security Deposit (held at check-in)", 60, y);
  doc.text("-", 330, y);
  doc.text("-", 415, y);
  doc.text(`$${booking.securityDeposit.toFixed(2)}`, pageWidth - 60, y, {
    align: "right",
  });

  y += 24;
  doc.setDrawColor(230, 223, 213);
  doc.line(48, y, pageWidth - 48, y);

  y += 28;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Session Rental Total", 330, y);
  doc.setTextColor(200, 90, 50);
  doc.text(`$${booking.totalPrice.toFixed(2)}`, pageWidth - 60, y, {
    align: "right",
  });

  if (booking.projectNotes) {
    y += 48;
    doc.setTextColor(20, 20, 19);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("PRODUCTION NOTES", 48, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(90, 86, 80);
    const wrapped = doc.splitTextToSize(booking.projectNotes, pageWidth - 96);
    doc.text(wrapped, 48, y);
  }

  doc.setFontSize(9);
  doc.setTextColor(130, 125, 118);
  doc.text(
    "Thank you for creating with StudioSpace. Present this confirmation at studio check-in.",
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 48,
    { align: "center" }
  );

  doc.save(`studiospace-invoice-${booking._id.slice(-8)}.pdf`);
}
