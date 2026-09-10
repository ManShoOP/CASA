"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") || "CSOL-2024";
  const name = searchParams.get("name") || "";

  return (
    <div className="bg-cream-light p-8 md:p-12 rounded-xl text-center max-w-2xl mx-auto border border-border">
      <div className="w-20 h-20 bg-terracotta-600 text-white rounded-full flex items-center justify-center mx-auto mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      
      <h2 className="font-serif text-3xl md:text-4xl text-charcoal-DEFAULT mb-4">Your table is reserved{name ? `, ${name}` : ''}!</h2>
      <p className="text-muted-foreground mb-2">We've received your booking and will send a confirmation email shortly.</p>
      <p className="font-medium text-charcoal-DEFAULT mb-8">Booking Reference: <span className="text-terracotta-600 uppercase">#{ref}</span></p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/" className="px-8 py-3 rounded-md border border-border text-charcoal-DEFAULT font-medium hover:bg-white transition-colors">
          Back to Home
        </Link>
        <Link href="/my-reservation" className="px-8 py-3 rounded-md bg-terracotta-600 text-white font-medium hover:bg-terracotta-700 transition-colors">
          View My Booking
        </Link>
      </div>
    </div>
  );
}

export default function ReserveSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <Suspense fallback={<div className="text-center p-12">Loading...</div>}>
          <SuccessContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
