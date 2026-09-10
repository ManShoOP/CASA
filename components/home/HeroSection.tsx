import Link from "next/link";

export function HeroSection({ dict }: { dict?: any }) {
  return (
    <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden bg-charcoal-DEFAULT">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 opacity-60 bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1565299507177-b0ac66763828?q=80&w=2000&auto=format&fit=crop")' }}
      />
      
      {/* Content */}
      <div className="container relative z-10 flex flex-col items-center text-center px-4 py-24">
        <span className="text-terracotta-400 font-medium tracking-[0.2em] uppercase text-sm mb-6">
          {dict?.heroSub || "Authentic Mexican Flavors"}
        </span>
        
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-cream-light mb-8 leading-tight">
          {dict?.heroTitle || "Taste the Sun of Mexico"}
        </h1>
        
        <p className="text-cream-dark/80 max-w-xl text-lg md:text-xl mb-10">
          {dict?.heroSubtitle || "A modern approach to traditional recipes, served in a warm, earthy atmosphere that feels just like home."}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/reserve"
            className="inline-flex h-12 items-center justify-center rounded-md bg-terracotta-600 px-8 text-sm font-medium text-white transition-colors hover:bg-terracotta-700"
          >
            {dict?.reserveBtn || "Reserve a Table"}
          </Link>
          <Link 
            href="/menu"
            className="inline-flex h-12 items-center justify-center rounded-md border border-cream-dark/30 bg-transparent px-8 text-sm font-medium text-cream-light transition-colors hover:bg-cream-light/10"
          >
            {dict?.exploreBtn || "Explore Menu →"}
          </Link>
        </div>
      </div>
    </section>
  );
}
