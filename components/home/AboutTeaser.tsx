import Link from "next/link";

export function AboutTeaser({ dict }: { dict?: any }) {
  return (
    <section className="py-24 bg-charcoal-DEFAULT text-cream-light overflow-hidden">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative h-[600px] w-full">
            <img 
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop" 
              alt="Restaurant Interior"
              className="w-full h-full object-cover"
            />
            {/* Decorative block */}
            <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-terracotta-600 hidden md:block -z-10" />
          </div>

          {/* Content */}
          <div className="max-w-xl">
            <span className="text-terracotta-400 font-medium tracking-widest uppercase text-xs mb-4 block">
              Our Story
            </span>
            <h2 className="font-serif text-4xl md:text-5xl mb-6">
              {dict?.aboutTitle || "More than a meal. A celebration."}
            </h2>
            <p className="text-cream-dark/80 text-lg mb-6 leading-relaxed">
              {dict?.aboutDesc || "CASA SOL was born from a simple desire: to share the vibrant, soul-warming dishes of our heritage with the city. We believe that food is a celebration of life, family, and connection."}
            </p>
            
            <Link 
              href="/story"
              className="inline-flex h-12 items-center justify-center rounded-md border border-cream-light px-8 text-sm font-medium text-cream-light transition-colors hover:bg-cream-light hover:text-charcoal-DEFAULT"
            >
              {dict?.readMore || "Read Our Story"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
