"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/providers/CartProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { MASTER_MENU_ITEMS } from "@/lib/data/menu";

const CATEGORIES = [
  { id: "All", labelEn: "All", labelTh: "ทั้งหมด" },
  { id: "Starters", labelEn: "Starters", labelTh: "ของว่าง" },
  { id: "Tacos & Mains", labelEn: "Tacos & Mains", labelTh: "ทาโก้ & จานหลัก" },
  { id: "Sides", labelEn: "Sides", labelTh: "เครื่องเคียง" },
  { id: "Drinks & Desserts", labelEn: "Drinks & Desserts", labelTh: "เครื่องดื่ม & ของหวาน" },
];

export default function OrderMenuPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { addToCart } = useCart();
  const { locale } = useI18n();
  const isThai = locale === "th";

  const filteredItems = activeCategory === "All" 
    ? MASTER_MENU_ITEMS 
    : MASTER_MENU_ITEMS.filter(item => item.category === activeCategory);

  const activeCategoryLabel =
    CATEGORIES.find(c => c.id === activeCategory)?.[isThai ? "labelTh" : "labelEn"] || activeCategory;

  const handleAddToCart = (item: any) => {
    addToCart({
      ...item,
      name: isThai ? (item.nameTh || item.name) : (item.nameEn || item.name),
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Categories Sidebar */}
      <div className="lg:col-span-1 space-y-2">
        <h2 className="font-serif text-xl text-charcoal-DEFAULT mb-4">
          {isThai ? "หมวดหมู่อาหาร" : "Categories"}
        </h2>
        <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto hide-scrollbar pb-2 lg:pb-0">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`whitespace-nowrap px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors ${
                activeCategory === category.id 
                  ? "bg-terracotta-600 text-white" 
                  : "bg-white border border-border text-charcoal-DEFAULT hover:bg-cream-light"
              }`}
            >
              {isThai ? category.labelTh : category.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="lg:col-span-3">
        <h2 className="font-serif text-2xl text-charcoal-DEFAULT mb-6">
          {isThai ? `รายการอาหาร: ${activeCategoryLabel}` : `${activeCategoryLabel} Menu`}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map(item => {
            const displayName = isThai ? (item.nameTh || item.name) : (item.nameEn || item.name);
            const displayDesc = isThai ? (item.descriptionTh || item.description) : (item.descriptionEn || item.description);

            return (
              <div key={item.id} className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <div className="h-48 bg-cream-dark relative">
                  <img 
                    src={item.image} 
                    alt={displayName} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop"; }}
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold text-charcoal-DEFAULT shadow-xs">
                    {isThai ? (item.categoryTh || item.category) : item.category}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif text-lg font-bold text-charcoal-DEFAULT">{displayName}</h3>
                    <span className="font-medium text-terracotta-600">${item.price}</span>
                  </div>
                  <p className="text-sm text-muted-foreground flex-1 mb-4 leading-relaxed">{displayDesc}</p>
                  <button 
                    onClick={() => handleAddToCart(item)}
                    className="w-full py-2.5 bg-terracotta-600 text-white rounded-md font-medium text-sm hover:bg-terracotta-700 transition-colors active:scale-[0.98] shadow-sm"
                  >
                    {isThai ? "+ สั่งอาหาร / ใส่ตะกร้า" : "Add to Cart"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
