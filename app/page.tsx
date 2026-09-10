import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedMenu } from "@/components/home/FeaturedMenu";
import { AboutTeaser } from "@/components/home/AboutTeaser";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default async function Home() {
  const dict = await getDictionary();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection dict={dict.home} />
        <FeaturedMenu dict={dict.home} />
        <AboutTeaser dict={dict.home} />
      </main>
      <Footer />
    </div>
  );
}
