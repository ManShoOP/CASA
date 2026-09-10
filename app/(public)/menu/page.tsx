"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useI18n } from "@/components/providers/I18nProvider";
import { MASTER_MENU_ITEMS } from "@/lib/data/menu";

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { dict, locale } = useI18n();
  const isThai = locale === "th";

  const MENU_CATEGORIES = [
    { id: "All", label: dict.menuPage.categories.all },
    { id: "Starters", label: dict.menuPage.categories.starters },
    { id: "Tacos & Mains", label: dict.menuPage.categories.mains },
    { id: "Sides", label: dict.menuPage.categories.sides },
    { id: "Drinks & Desserts", label: dict.menuPage.categories.drinks }
  ];

  const filteredMenu = activeCategory === "All" 
    ? MASTER_MENU_ITEMS 
    : MASTER_MENU_ITEMS.filter(item => item.category === activeCategory);

  return (
    <div className="flex min-h-screen flex-col bg-cream-light">
      <Navbar />
      
      <main className="flex-1">
        
        {/* Menu Hero */}
        <section className="bg-charcoal-DEFAULT py-20 px-4 text-center">
          <div className="container max-w-4xl">
            <span className="text-terracotta-400 font-medium tracking-[0.2em] uppercase text-sm mb-4 block">
              {dict.menuPage.subtitle}
            </span>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-cream-light mb-6">
              {dict.menuPage.title}
            </h1>
            <p className="text-cream-dark/80 text-lg md:text-xl max-w-2xl mx-auto">
              {dict.menuPage.description}
            </p>
          </div>
        </section>

        {/* Menu Navigation */}
        <section className="sticky top-20 z-40 bg-cream-light border-b border-border">
          <div className="container">
            <div className="flex overflow-x-auto py-4 hide-scrollbar justify-start md:justify-center gap-2 md:gap-4">
              {MENU_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category.id 
                      ? "bg-terracotta-600 text-white" 
                      : "bg-cream-DEFAULT text-charcoal-DEFAULT hover:bg-cream-dark/50"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Menu Items Grid */}
        <section className="py-16 md:py-24">
          <div className="container max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
              
              {filteredMenu.map((item) => (
                <div key={item.id} className="group flex flex-col sm:flex-row gap-6 items-start">
                  
                  {/* Image with fallback */}
                  <div className="w-full sm:w-32 h-48 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-cream-dark relative">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop"; // Ultimate fallback pizza/food
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : null}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex justify-between items-baseline mb-2 border-b border-border/50 pb-2 border-dashed">
                      <h3 className="font-serif text-2xl text-charcoal-DEFAULT truncate pr-4">
                        {isThai ? (item.nameTh || item.name) : (item.nameEn || item.name)}
                      </h3>
                      <span className="font-medium text-terracotta-600">{item.priceFormatted || `$${item.price}`}</span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                      {isThai ? (item.descriptionTh || item.description) : (item.descriptionEn || item.description)}
                    </p>
                    
                    {/* Dietary Badges */}
                    {Boolean(item.dietary && item.dietary.length > 0) && (
                      <div className="flex gap-2">
                        {item.dietary.map(diet => (
                          <span 
                            key={diet} 
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cream-DEFAULT text-charcoal-DEFAULT text-xs font-bold"
                            title={diet === 'V' ? 'Vegetarian' : 'Gluten Free'}
                          >
                            {diet}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

            </div>
            
            {/* Dietary Legend */}
            <div className="mt-20 pt-8 border-t border-border flex justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cream-DEFAULT text-charcoal-DEFAULT text-xs font-bold">V</span>
                {isThai ? "มังสวิรัติ (Vegetarian)" : "Vegetarian"}
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cream-DEFAULT text-charcoal-DEFAULT text-xs font-bold">GF</span>
                {isThai ? "ปราศจากกลูเตน (Gluten Free)" : "Gluten Free"}
              </span>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
