"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/client";

export default function MyBookingPage() {
  const [bookingRef, setBookingRef] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingRef.trim()) return;
    
    setIsSearching(true);
    setNotFound(false);
    setBooking(null);

    // Clean the input (remove # and spaces)
    const cleanRef = bookingRef.replace(/#/g, "").replace(/\s/g, "").toLowerCase();

    const supabase = createClient();
    
    // Postgres doesn't allow ILIKE on UUID columns directly via PostgREST
    // For this prototype, we'll fetch recent reservations and find the match in memory
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);

    setIsSearching(false);

    if (error || !data) {
      console.error(error);
      setNotFound(true);
      return;
    }

    const foundBooking = data.find((r) => r.id.toLowerCase().startsWith(cleanRef));

    if (!foundBooking) {
      setNotFound(true);
      return;
    }

    setBooking(foundBooking);
  };

  const handleCancel = async () => {
    if (!booking) return;
    setIsCancelling(true);
    const supabase = createClient();
    await supabase
      .from("reservations")
      .update({ status: "cancelled" })
      .eq("id", booking.id);
    setBooking({ ...booking, status: "cancelled" });
    setIsCancelling(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream-light">
      <Navbar />
      
      <main className="flex-1 container max-w-3xl py-16 md:py-24 px-4">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal-DEFAULT mb-4">My Booking</h1>
          <p className="text-muted-foreground">Enter your booking reference number to view or manage your reservation.</p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-border">
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-6 max-w-md mx-auto mb-8">
            <div className="space-y-2">
              <label htmlFor="reference" className="text-sm font-medium text-charcoal-DEFAULT">Booking Reference</label>
              <input 
                id="reference"
                type="text" 
                value={bookingRef}
                onChange={(e) => setBookingRef(e.target.value)}
                className="w-full h-12 rounded-md border border-border px-3 focus:outline-none focus:ring-2 focus:ring-terracotta-500 uppercase" 
                placeholder="e.g. A1B2C3D4"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={isSearching || !bookingRef}
              className="w-full h-12 rounded-md bg-terracotta-600 text-white font-medium hover:bg-terracotta-700 transition-colors disabled:opacity-70 flex items-center justify-center"
            >
              {isSearching ? "Searching..." : "Find Booking"}
            </button>
          </form>

          {/* Not Found */}
          {notFound && (
            <div className="text-center py-6 text-muted-foreground border-t border-border">
              <p className="mb-1">No booking found with reference <strong className="text-charcoal-DEFAULT uppercase">{bookingRef}</strong>.</p>
              <p className="text-sm">Please check your reference number and try again.</p>
            </div>
          )}

          {/* Booking Found */}
          {booking && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 border-t border-border pt-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Reference</p>
                  <p className="font-mono font-medium text-charcoal-DEFAULT">{booking.id.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date & Time</p>
                  <p className="font-medium text-charcoal-DEFAULT text-lg">{new Date(booking.date).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })} at {booking.time}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Party Size</p>
                  <p className="font-medium text-charcoal-DEFAULT text-lg">{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Guest Details</p>
                  <p className="font-medium text-charcoal-DEFAULT">{booking.name}</p>
                  <p className="text-sm text-muted-foreground">{booking.email}</p>
                  <p className="text-sm text-muted-foreground">{booking.phone}</p>
                </div>
                {booking.special_requests && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Special Requests</p>
                    <p className="text-charcoal-DEFAULT text-sm">{booking.special_requests}</p>
                  </div>
                )}
              </div>

              {booking.status !== 'cancelled' && (
                <div className="pt-6 border-t border-border">
                  <button 
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="w-full h-12 rounded-md border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors disabled:opacity-70"
                  >
                    {isCancelling ? "Cancelling..." : "Cancel Reservation"}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
