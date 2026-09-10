"use client";

import Link from "next/link";

const FEATURED_ITEMS = [
  {
    id: 1,
    name: "Al Pastor Tacos",
    description: "Marinated pork, pineapple, onion, cilantro, on fresh corn tortillas.",
    price: "$14",
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Classic Margarita",
    description: "Tequila blanco, fresh lime juice, agave nectar, salt rim.",
    price: "$12",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Churros con Chocolate",
    description: "Cinnamon-sugar dusted churros with warm spiced chocolate dip.",
    price: "$9",
    image: "/images/churros.jpg"
  }
];

export function FeaturedMenu({ dict }: { dict?: any }) {
  return (
    <section className="py-24 bg-cream-light">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div className="max-w-2xl">
            <span className="text-terracotta-600 font-medium tracking-widest uppercase text-xs mb-2 block">
              From the Menu
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-charcoal-DEFAULT mb-4">
              {dict?.featuredTitle || "A Taste of CASA SOL"}
            </h2>
          </div>
          <Link 
            href="/menu" 
            className="hidden md:flex items-center text-sm font-medium text-terracotta-600 hover:text-terracotta-700 transition-colors"
          >
            {dict?.exploreBtn || "View Full Menu →"}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURED_ITEMS.map((item) => (
            <div key={item.id} className="group cursor-pointer">
              <div className="relative h-96 w-full overflow-hidden mb-6 bg-cream-dark">
                <img 
                  src={item.image} 
                  alt={item.name}
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=800&auto=format&fit=crop"; // Known working fallback
                  }}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-serif text-2xl text-charcoal-DEFAULT">{item.name}</h3>
                <span className="font-sans font-medium text-terracotta-600 ml-4">{item.price}</span>
              </div>
              <p className="text-muted-foreground text-sm">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center md:hidden">
          <Link href="/menu" className="text-sm font-medium text-terracotta-600">
            View Full Menu →
          </Link>
        </div>
      </div>
    </section>
  );
}
