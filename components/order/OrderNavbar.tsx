"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export function OrderNavbar() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { locale } = useI18n();
  const isThai = locale === "th";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-serif text-xl font-bold tracking-tight text-terracotta-600">
            CASA SOL{" "}
            <span className="text-xs font-sans font-normal text-muted-foreground ml-2 px-2 py-0.5 bg-cream-DEFAULT rounded-full">
              {isThai ? "สั่งอาหารออนไลน์" : "Order Online"}
            </span>
          </span>
        </Link>

        {/* Steps */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link
            href="/order/menu"
            className={`flex items-center transition-colors ${
              pathname?.includes("/menu")
                ? "text-terracotta-600 font-semibold"
                : pathname?.includes("/cart") || pathname?.includes("/checkout")
                ? "text-charcoal-DEFAULT hover:text-terracotta-600"
                : "text-muted-foreground"
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 transition-colors ${
                pathname?.includes("/cart") || pathname?.includes("/checkout")
                  ? "bg-green-600 text-white font-bold"
                  : pathname?.includes("/menu")
                  ? "bg-terracotta-600 text-white"
                  : "bg-cream-dark text-muted-foreground"
              }`}
            >
              {pathname?.includes("/cart") || pathname?.includes("/checkout") ? "✓" : "1"}
            </span>
            {isThai ? "เลือกเมนู" : "Menu"}
          </Link>
          <div
            className={`w-8 h-px ${
              pathname?.includes("/cart") || pathname?.includes("/checkout")
                ? "bg-terracotta-500/60"
                : "bg-border"
            }`}
          ></div>
          <Link
            href="/order/cart"
            className={`flex items-center transition-colors ${
              pathname?.includes("/cart")
                ? "text-terracotta-600 font-semibold"
                : pathname?.includes("/checkout")
                ? "text-charcoal-DEFAULT hover:text-terracotta-600"
                : "text-muted-foreground"
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 transition-colors ${
                pathname?.includes("/checkout")
                  ? "bg-green-600 text-white font-bold"
                  : pathname?.includes("/cart")
                  ? "bg-terracotta-600 text-white"
                  : "bg-cream-dark text-muted-foreground"
              }`}
            >
              {pathname?.includes("/checkout") ? "✓" : "2"}
            </span>
            {isThai ? "ตะกร้าสินค้า" : "Cart"}
          </Link>
          <div
            className={`w-8 h-px ${
              pathname?.includes("/checkout") ? "bg-terracotta-500/60" : "bg-border"
            }`}
          ></div>
          <div
            className={`flex items-center ${
              pathname?.includes("/checkout")
                ? "text-terracotta-600 font-semibold"
                : "text-muted-foreground"
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 ${
                pathname?.includes("/checkout")
                  ? "bg-terracotta-600 text-white shadow-xs"
                  : "bg-cream-dark text-muted-foreground"
              }`}
            >
              3
            </span>
            {isThai ? "ยืนยัน / ชำระเงิน" : "Checkout"}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher currentLocale={locale} />
          <Link 
            href="/order/cart" 
            className="flex items-center justify-center rounded-md bg-cream-light border border-border px-4 py-2 text-sm font-medium text-charcoal-DEFAULT transition-colors hover:bg-cream-dark shadow-xs"
            title={isThai ? "ดูตะกร้าสินค้า" : "View Cart"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            <span className="bg-terracotta-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">{totalItems}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
