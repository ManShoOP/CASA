"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/client";

// Generate upcoming dates dynamically
function getUpcomingDates(days = 7) {
  const dates = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push({
      label: i === 0 ? `วันนี้ (${d.toLocaleDateString('th-TH', { month:'short', day:'numeric' })})` 
           : i === 1 ? `พรุ่งนี้ (${d.toLocaleDateString('th-TH', { month:'short', day:'numeric' })})`
           : d.toLocaleDateString('th-TH', { weekday:'long', month:'short', day:'numeric' }),
      value: d.toISOString().split('T')[0]
    });
  }
  return dates;
}

export default function ReservePage() {
  const router = useRouter();
  const supabase = createClient();
  const dates = getUpcomingDates();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Step 1 state
  const [selectedDate, setSelectedDate] = useState(dates[0].value);
  const [selectedTime, setSelectedTime] = useState("18:00");
  const [guests, setGuests] = useState(2);

  // Step 2 state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [occasion, setOccasion] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const timeSlots = ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"];
  const selectedDateLabel = dates.find(d => d.value === selectedDate)?.label || selectedDate;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError("");

    const bookingId = crypto.randomUUID();
    const customerFullName = `${firstName} ${lastName}`.trim() || firstName.trim() || "ลูกค้าไม่ระบุชื่อ";
    const customerEmail = email.trim() || `guest-${Date.now()}@casasol.com`;
    const customerPhone = phone.trim() || "-";

    const { error: dbError } = await supabase
      .from("reservations")
      .insert([{
        id: bookingId,
        name: customerFullName,
        email: customerEmail,
        phone: customerPhone,
        date: selectedDate,
        time: selectedTime,
        guests,
        special_requests: `${occasion ? `โอกาส: ${occasion}. ` : ""}${specialRequests}`.trim(),
        status: "pending"
      }]);

    setIsSubmitting(false);

    if (dbError) {
      setError("เกิดข้อผิดพลาดในการบันทึกการจอง: " + dbError.message);
      console.error("Booking error:", dbError);
      return;
    }

    // Redirect to success page with booking ref
    router.push(`/reserve/success?ref=${bookingId.slice(0, 8).toUpperCase()}&name=${encodeURIComponent(firstName || customerFullName)}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream-light">
      <Navbar />
      
      <main className="flex-1 container max-w-3xl py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal-DEFAULT mb-3">จองโต๊ะ (Reserve a Table)</h1>
          <p className="text-muted-foreground">สัมผัสประสบการณ์อาหารเม็กซิกันแท้ในบรรยากาศอบอุ่นที่ CASA SOL</p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-10 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-border" style={{zIndex: -1}} />
          {[
            { num: 1, label: "วัน & เวลา" },
            { num: 2, label: "ข้อมูลลูกค้า" },
            { num: 3, label: "ยืนยัน" }
          ].map((item) => (
            <div key={item.num} className="flex flex-col items-center bg-cream-light px-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors shadow-xs ${
                  step >= item.num ? "bg-terracotta-600 text-white" : "bg-cream-dark text-muted-foreground"
                }`}
              >
                {step > item.num ? "✓" : item.num}
              </div>
              <span className="text-xs mt-1 text-muted-foreground font-medium">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-border">
          
          {/* STEP 1: Date, Time, Guests */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Guests */}
              <div>
                <label className="block text-sm font-medium text-charcoal-DEFAULT mb-2 uppercase tracking-wider">
                  จำนวนแขก (Party Size)
                </label>
                <div className="flex items-center gap-4">
                  <button 
                    type="button"
                    onClick={() => setGuests(Math.max(1, guests - 1))} 
                    className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-cream-light text-xl font-bold transition-colors"
                  >−</button>
                  <span className="text-xl font-bold w-10 text-center text-charcoal-DEFAULT">{guests}</span>
                  <button 
                    type="button"
                    onClick={() => setGuests(Math.min(20, guests + 1))} 
                    className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-cream-light text-xl font-bold transition-colors"
                  >+</button>
                  <span className="text-muted-foreground text-sm ml-2">
                    {guests === 1 ? "1 ท่าน" : `${guests} ท่าน`}
                  </span>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-charcoal-DEFAULT mb-2 uppercase tracking-wider">
                  วันที่ (Date)
                </label>
                <select 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full h-12 rounded-lg border border-border bg-white px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500 font-medium"
                >
                  {dates.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-sm font-medium text-charcoal-DEFAULT mb-2 uppercase tracking-wider">
                  รอบเวลา (Time)
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {timeSlots.map((time) => (
                    <button
                      type="button"
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`h-12 rounded-lg border text-sm font-semibold transition-all ${
                        selectedTime === time 
                          ? "bg-terracotta-600 border-terracotta-600 text-white shadow-xs" 
                          : "border-border hover:border-terracotta-400 hover:text-terracotta-600 bg-white"
                      }`}
                    >
                      {time} น.
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setStep(2)}
                disabled={!selectedTime}
                className="w-full h-12 rounded-lg bg-terracotta-600 text-white font-semibold mt-4 hover:bg-terracotta-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                ถัดไป (กรอกข้อมูลผู้จอง) →
              </button>
            </div>
          )}

          {/* STEP 2: Guest Details */}
          {step === 2 && (
            <div className="space-y-5">
              <h3 className="font-serif text-2xl text-charcoal-DEFAULT mb-2">ข้อมูลผู้จองโต๊ะ</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-charcoal-DEFAULT">ชื่อ <span className="text-red-500">*</span></label>
                  <input 
                    value={firstName} 
                    onChange={e => setFirstName(e.target.value)} 
                    type="text" 
                    required
                    className="w-full h-11 rounded-lg border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500" 
                    placeholder="ระบุชื่อจริง" 
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-charcoal-DEFAULT">นามสกุล</label>
                  <input 
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)} 
                    type="text" 
                    className="w-full h-11 rounded-lg border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500" 
                    placeholder="ระบุนามสกุล (ถ้ามี)" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-charcoal-DEFAULT">อีเมล (Email)</label>
                  <input 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    type="email" 
                    className="w-full h-11 rounded-lg border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500" 
                    placeholder="example@gmail.com" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-charcoal-DEFAULT">เบอร์โทรศัพท์ (Phone)</label>
                  <input 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    type="tel" 
                    className="w-full h-11 rounded-lg border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500" 
                    placeholder="08X-XXX-XXXX" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-charcoal-DEFAULT">
                  โอกาสพิเศษ (Occasion)
                </label>
                <select 
                  value={occasion} 
                  onChange={e => setOccasion(e.target.value)} 
                  className="w-full h-11 rounded-lg border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                >
                  <option value="">เลือกโอกาสพิเศษ (ไม่ระบุก็ได้)</option>
                  <option value="วันเกิด (Birthday)">วันเกิด (Birthday)</option>
                  <option value="วันครบรอบ (Anniversary)">วันครบรอบ (Anniversary)</option>
                  <option value="เลี้ยงฉลอง (Celebration)">เลี้ยงฉลอง (Celebration)</option>
                  <option value="นัดทานอาหารธุรกิจ (Business Dinner)">นัดทานอาหารธุรกิจ (Business Dinner)</option>
                  <option value="เดท (Date Night)">เดท (Date Night)</option>
                  <option value="อื่นๆ (Other)">อื่นๆ (Other)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-charcoal-DEFAULT">
                  คำขอพิเศษ (Special Requests)
                </label>
                <textarea 
                  value={specialRequests}
                  onChange={e => setSpecialRequests(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2.5 min-h-[80px] text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500 resize-none" 
                  placeholder="เช่น แพ้อาหาร, ต้องการเก้าอี้เด็ก, โต๊ะติดริมหน้าต่าง..."
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  type="button"
                  onClick={() => setStep(1)} 
                  className="w-1/3 h-12 rounded-lg border border-border text-charcoal-DEFAULT font-medium hover:bg-cream-light transition-colors text-sm"
                >
                  ← ย้อนกลับ
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    if (!firstName.trim()) {
                      alert("กรุณากรอกชื่อผู้จองโต๊ะ");
                      return;
                    }
                    setStep(3);
                  }}
                  className="w-2/3 h-12 rounded-lg bg-terracotta-600 text-white font-semibold hover:bg-terracotta-700 transition-colors shadow-sm text-sm"
                >
                  ตรวจสอบข้อมูลการจอง →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Confirm */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="font-serif text-2xl text-charcoal-DEFAULT text-center">ตรวจสอบและยืนยันการจอง</h3>
              
              <div className="bg-cream-light/60 p-6 rounded-xl space-y-3.5 border border-border text-sm">
                <div className="flex justify-between items-center border-b border-border/60 pb-3">
                  <span className="text-muted-foreground font-medium">ชื่อผู้จอง</span>
                  <span className="font-bold text-charcoal-DEFAULT">{firstName} {lastName}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/60 pb-3">
                  <span className="text-muted-foreground font-medium">วันที่</span>
                  <span className="font-semibold text-charcoal-DEFAULT">{selectedDateLabel}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/60 pb-3">
                  <span className="text-muted-foreground font-medium">เวลา</span>
                  <span className="font-semibold text-terracotta-600">{selectedTime} น.</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/60 pb-3">
                  <span className="text-muted-foreground font-medium">จำนวนแขก</span>
                  <span className="font-bold text-charcoal-DEFAULT">{guests} ท่าน</span>
                </div>
                {phone && (
                  <div className="flex justify-between items-center border-b border-border/60 pb-3">
                    <span className="text-muted-foreground font-medium">เบอร์โทร</span>
                    <span className="font-medium text-charcoal-DEFAULT">{phone}</span>
                  </div>
                )}
                {occasion && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">โอกาสพิเศษ</span>
                    <span className="font-medium text-terracotta-600">{occasion}</span>
                  </div>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>
              )}

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setStep(2)} 
                  className="w-1/3 h-12 rounded-lg border border-border text-charcoal-DEFAULT font-medium hover:bg-cream-light transition-colors text-sm"
                >
                  ← แก้ไขข้อมูล
                </button>
                <button 
                  type="button"
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="w-2/3 h-12 rounded-lg bg-terracotta-600 text-white font-semibold hover:bg-terracotta-700 disabled:opacity-70 transition-colors flex items-center justify-center shadow-sm text-sm"
                >
                  {isSubmitting ? "กำลังบันทึกข้อมูล..." : "ยืนยันการจองโต๊ะ ✓"}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
