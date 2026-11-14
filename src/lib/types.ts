export const STUDIO_CATEGORIES = [
  "Photo Studios",
  "Sound Stages",
  "Podcast Rooms",
  "Music Suites",
  "Art Workshops",
] as const;

export type StudioCategory = (typeof STUDIO_CATEGORIES)[number];

export interface Studio {
  _id: string;
  title: string;
  category: StudioCategory;
  hourlyRate: number;
  securityDeposit: number;
  maxCapacity: number;
  location: string;
  imageUrl: string;
  galleryImages: string[];
  amenities: string[];
  description: string;
  ownerName: string;
  ownerEmail?: string;
  isOwner?: boolean;
  ownerImage?: string;
  rating: number;
  reviewCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export type BookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

export interface Booking {
  _id: string;
  studioId: string;
  studioTitle: string;
  studioImage: string;
  studioCategory: StudioCategory;
  studioLocation: string;
  hourlyRate: number;
  securityDeposit: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  totalPrice: number;
  projectNotes?: string;
  customerName: string;
  customerEmail: string;
  hostEmail: string;
  status: BookingStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  _id: string;
  studioId: string;
  userName: string;
  userEmail: string;
  userImage?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ConfirmedSlot {
  _id: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
}
