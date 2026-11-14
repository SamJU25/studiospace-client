# StudioSpace — Peer-to-Peer Creative Production Studio Platform

**StudioSpace** connects photographers, filmmakers, podcasters, musicians, and makers with hourly creative studios and production spaces hosted by fellow creators.

- **Live Website:** https://studiospace-client-azure.vercel.app
- **API Server:** https://studiospace-server-sigma-steel.vercel.app

## Key Features

- **Curated Studio Discovery & Category Filtering:** Browse Photo Studios, Sound Stages, Podcast Rooms, Music Suites, and Art Workshops with real-time search, sorting, and category filters.
- **BetterAuth + JWT & HTTPOnly Cookie Security:** Full email/password and Google OAuth authentication powered by BetterAuth with MongoDB Adapter, Next.js `proxy.ts` route protection, and server-side JWT verification via JWKS and HTTPOnly cookies.
- **Double-Booking Prevention:** Server-side overlap validation queries existing `"Confirmed"` bookings in MongoDB for the same studio and date before accepting conflicting reservations.
- **Full Host CRUD & Image Uploads:** Authenticated hosts can publish studios (with optional ImgBB file upload), update listings, and delete listings with custom confirmation dialogs and toast feedback.
- **Booking Lifecycle & PDF Invoices:** Guests track `"Pending"`, `"Confirmed"`, `"Completed"`, and `"Cancelled"` bookings, cancel pending slots, and download formatted PDF booking receipts for confirmed sessions.
- **Saved Studios Wishlist & Light/Dark Theme:** Save favorite studios to MongoDB per account and switch seamlessly between Daylight Atelier (Light) and Control Room (Dark) themes.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Swiper.js, Sonner, jsPDF, `next-themes`
- **Authentication:** BetterAuth (`@better-auth/mongo-adapter`, `jwt()` plugin) + Next.js `proxy.ts`
- **Backend:** Express.js, TypeScript, MongoDB Native Driver, `jose` (JWKS), `jsonwebtoken`, `cookie-parser`, CORS

## Local Setup Instructions

1. **Clone both repositories:**
   ```bash
   git clone <client-repo-url> studiospace-client
   git clone <server-repo-url> studiospace-server
   ```

2. **Configure & run `studiospace-server`:**
   ```bash
   cd studiospace-server
   cp .env.example .env
   # Fill in MONGODB_URI, MONGODB_DB_NAME, JWT_SECRET, CLIENT_URL=http://localhost:3000
   npm install
   npm run dev
   ```

3. **Configure & run `studiospace-client`:**
   ```bash
   cd studiospace-client
   cp .env.example .env.local
   # Fill in NEXT_PUBLIC_API_URL=http://localhost:5000, BETTER_AUTH_SECRET, BETTER_AUTH_URL=http://localhost:3000, MONGODB_URI, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXT_PUBLIC_IMGBB_API_KEY
   npm install
   npm run dev
   ```

4. **Seed demo studios (optional, once MongoDB is connected and `SEED_SECRET` is set in server `.env`):**
   ```bash
   curl -X POST http://localhost:5000/api/seed -H "x-seed-key: <your_SEED_SECRET>"
   ```

## Examiner Test Credentials

Register a new account via `/register` or use the seeded examiner account after registration:

- **Email:** `examiner@studiospace.dev`
- **Password:** `StudioPass2026`
