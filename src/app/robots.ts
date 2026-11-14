import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ).replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/studios", "/studios/"],
        disallow: [
          "/api/",
          "/dashboard",
          "/add-studio",
          "/my-listings",
          "/my-bookings",
          "/wishlist",
          "/studios/edit/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
