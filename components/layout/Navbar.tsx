"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useI18n } from "@/components/providers/I18nProvider";

export function Navbar() {
  const { dict, locale } = useI18n();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-cream-DEFAULT/80 backdrop-blur-md">
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-serif text-2xl font-bold tracking-tight text-terracotta-600">
            CASA SOL
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link href="/" className="text-charcoal-DEFAULT hover:text-terracotta-600 transition-colors">
            {dict.nav.home}
          </Link>
          <Link href="/menu" className="text-charcoal-DEFAULT hover:text-terracotta-600 transition-colors">
            {dict.nav.menu}
          </Link>
          <Link href="/story" className="text-charcoal-DEFAULT hover:text-terracotta-600 transition-colors">
            {dict.nav.story}
          </Link>
          <Link href="/contact" className="text-charcoal-DEFAULT hover:text-terracotta-600 transition-colors">
            {dict.nav.contact}
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link href="/my-reservation" className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-charcoal-DEFAULT transition-colors">
            <span>{dict.nav.myBooking}</span>
          </Link>
          
          <Link 
            href="/order/menu" 
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center justify-center rounded-md border border-terracotta-600 bg-white px-5 py-2.5 text-sm font-medium text-terracotta-600 transition-colors hover:bg-terracotta-50"
          >
            {dict.nav.orderOnline}
          </Link>

          <Link 
            href="/reserve" 
            className="hidden md:flex items-center justify-center rounded-md bg-terracotta-600 px-6 py-2.5 text-sm font-medium text-white shadow transition-colors hover:bg-terracotta-700"
          >
            {dict.nav.reserveTable}
          </Link>

          {/* Language Switcher */}
          <div className="ml-2">
            <LanguageSwitcher currentLocale={locale} />
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    </header>
  );
}
