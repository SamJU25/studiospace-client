"use client";

import * as React from "react";
import Link from "next/link";
import { Aperture, ArrowRight, Compass, Pause, Play } from "lucide-react";
import type { Swiper as SwiperInstance } from "swiper";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HERO_SLIDES = [
  {
    id: "daylight-loft",
    title: "Daylight Lofts & Cyclorama Stages Built for Real Shoots",
    subtitle:
      "Book verified creative production studios by the hour with strobes, C-stands, acoustic isolation, and direct host support.",
    image:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1800&q=85",
    highlight: "Brooklyn, Los Angeles, London & Dhaka",
  },
  {
    id: "podcast-suites",
    title: "Broadcast-Ready Podcast & Video Suites Without the Overhead",
    subtitle:
      "Walk into pre-lit multi-camera rooms with Shure SM7B chains and acoustic wood treatment, ready the moment you hit record.",
    image:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1800&q=85",
    highlight: "Instant hourly reservations, zero hidden fees",
  },
  {
    id: "music-stages",
    title: "Sound Stages & Analog Tracking Rooms Trusted by Crews",
    subtitle:
      "Reserve soundproof stages for music videos, album tracking, and maker workshops, or list your idle studio hours to earn.",
    image:
      "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?auto=format&fit=crop&w=1800&q=85",
    highlight: "Protected bookings with verified studio hosts",
  },
];

export function HeroSlider() {
  const swiperRef = React.useRef<SwiperInstance | null>(null);
  const [paused, setPaused] = React.useState(false);

  const toggleAutoplay = () => {
    const instance = swiperRef.current;
    if (!instance?.autoplay) return;
    if (paused) {
      instance.autoplay.start();
      setPaused(false);
    } else {
      instance.autoplay.stop();
      setPaused(true);
    }
  };

  return (
    <section
      aria-label="Featured studio showcase"
      className="relative overflow-hidden border-b border-border bg-neutral-950"
    >
      <Swiper
        onSwiper={(instance) => {
          swiperRef.current = instance;
        }}
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        autoplay={{ delay: 5500, disableOnInteraction: true }}
        pagination={{ clickable: true }}
        navigation
        loop
        className="h-[520px] sm:h-[580px] lg:h-[620px] w-full"
      >
        {HERO_SLIDES.map((slide, index) => {
          const HeadingTag = index === 0 ? "h1" : "h2";
          return (
            <SwiperSlide key={slide.id}>
              <div className="relative h-full w-full">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="h-full w-full object-cover object-center"
                />
                {/* Editorial dark scrim for crisp contrast */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/82 via-black/58 to-black/30" />

                <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8">
                  <div className="max-w-2xl space-y-5 text-white">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium backdrop-blur-md">
                      <Aperture className="h-3.5 w-3.5 text-amber-400" />
                      <span>{slide.highlight}</span>
                    </div>

                    <HeadingTag className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                      {slide.title}
                    </HeadingTag>

                    <p className="max-w-xl text-base leading-relaxed text-neutral-200 sm:text-lg">
                      {slide.subtitle}
                    </p>

                    <div className="flex flex-wrap items-center gap-3.5 pt-2">
                      <Link
                        href="/studios"
                        className={cn(buttonVariants({ size: "lg" }), "gap-2")}
                      >
                        <Compass className="h-4 w-4" />
                        Explore Studios
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        href="/add-studio"
                        className={cn(
                          buttonVariants({ size: "lg", variant: "outline" }),
                          "border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-md"
                        )}
                      >
                        Host Your Space
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <button
        type="button"
        onClick={toggleAutoplay}
        aria-label={paused ? "Resume slideshow autoplay" : "Pause slideshow autoplay"}
        title={paused ? "Resume slideshow" : "Pause slideshow"}
        className="absolute bottom-4 right-4 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-black/75 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
      </button>
    </section>
  );
}
