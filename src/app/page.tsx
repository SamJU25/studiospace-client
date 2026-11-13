import { API_BASE_URL } from "@/lib/api";
import type { Studio } from "@/lib/types";
import { HeroSlider } from "@/components/home/HeroSlider";
import { FeaturedStudiosSection } from "@/components/home/FeaturedStudiosSection";
import { CategoriesAndTrustSections } from "@/components/home/CategoriesAndTrustSections";

export const dynamic = "force-dynamic";

async function getFeaturedStudios(): Promise<Studio[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/studios/featured`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { studios?: Studio[] };
    return data.studios || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featuredStudios = await getFeaturedStudios();

  return (
    <div className="flex flex-col">
      <HeroSlider />
      <FeaturedStudiosSection initialStudios={featuredStudios} />
      <CategoriesAndTrustSections />
    </div>
  );
}
