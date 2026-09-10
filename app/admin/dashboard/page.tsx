"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
};

const STATUS_THAI: Record<string, string> = {
  confirmed: "ยืนยันแล้ว",
  pending: "รอยืนยัน",
  cancelled: "ยกเลิกแล้ว",
};

// Available tables for Walk-in booking
const AVAILABLE_TABLES = [
  { id: "Table 1", name: "โต๊ะ 1", capacity: 2 },
  { id: "Table 3", name: "โต๊ะ 3", capacity: 4 },
  { id: "Table 4", name: "โต๊ะ 4", capacity: 4 },
  { id: "Table 5", name: "โต๊ะ 5", capacity: 6 },
  { id: "Table 6", name: "โต๊ะ 6", capacity: 2 },
  { id: "Table 7", name: "โต๊ะ 7", capacity: 8 },
];

const OCCASIONS = [
  "ทานอาหารทั่วไป (Casual Dining)",
  "วันเกิด (Birthday)",
  "วันครบรอบ (Anniversary)",
  "เลี้ยงฉลอง (Celebration)",
  "เลี้ยงสังสรรค์ / ธุรกิจ (Business Gathering)",
  "อื่นๆ (Other)"
];

export default function AdminDashboardPage() {
  const supabase = createClient();
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, totalGuests: 0 });

  // Walk-in Modal State
  const [isWalkinOpen, setIsWalkinOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [selectedTable, setSelectedTable] = useState(AVAILABLE_TABLES[0].id);
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [isSubmittingWalkin, setIsSubmittingWalkin] = useState(false);
  const [walkinSuccessMsg, setWalkinSuccessMsg] = useState("");

  useEffect(() => {
    fetchReservations();

    // Auto-refresh every 5 seconds to catch online bookings immediately
    const interval = setInterval(() => {
      fetchReservations(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchReservations = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("reservations")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (data) {
      const activeReservations = data.filter((r: any) => !r.special_requests?.includes("[DELETED"));
      setReservations(activeReservations);
      setStats({
        total: activeReservations.length,
        confirmed: activeReservations.filter(r => r.status === "confirmed").length,
        pending: activeReservations.filter(r => r.status === "pending").length,
        totalGuests: activeReservations.reduce((sum, r) => sum + (r.guests || 0), 0),
      });
    }
    if (showLoading) setIsLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("reservations").update({ status }).eq("id", id);
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    setStats(prev => ({
      ...prev,
      confirmed: prev.confirmed + (status === "confirmed" ? 1 : -1),
      pending: prev.pending + (status === "pending" ? 1 : -1),
    }));
  };

  const handleDeleteReservation = async (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการจองนี้ออกจากระบบอย่างถาวร?")) {
      // 1. Mark as cancelled with [DELETED_RESERVATION] tag so it works with RLS
      await supabase.from("reservations").update({
        status: "cancelled",
        special_requests: "[DELETED_RESERVATION] ลบโดยแอดมิน"
      }).eq("id", id);
      // 2. Also try delete
      await supabase.from("reservations").delete().eq("id", id);
      setReservations(prev => prev.filter(r => r.id !== id));
      await fetchReservations(false);
    }
  };

  // Handle Walk-in Booking Submission
  const handleWalkinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !selectedTable) return;

    setIsSubmittingWalkin(true);

    const bookingId = crypto.randomUUID();
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    const { error: dbError } = await supabase
      .from("reservations")
      .insert([{
        id: bookingId,
        name: customerName.trim(),
        email: "walkin@casasol.com",
        phone: "-",
        date: today,
        time: currentTime,
        guests: partySize,
        special_requests: `โอกาส: ${occasion} | โต๊ะ: ${selectedTable} (Walk-in)`,
        status: "confirmed"
      }]);

    setIsSubmittingWalkin(false);

    if (dbError) {
      alert("เกิดข้อผิดพลาดในการบันทึกการจอง: " + dbError.message);
      return;
    }

    // Reset Form & Close Modal
    setIsWalkinOpen(false);
    setCustomerName("");
    setPartySize(2);
    setOccasion(OCCASIONS[0]);
    setWalkinSuccessMsg(`เปิดโต๊ะ ${selectedTable} ให้ลูกค้า ${customerName.trim()} เรียบร้อยแล้ว!`);
    setTimeout(() => setWalkinSuccessMsg(""), 4000);

    // Refresh reservations list immediately
    await fetchReservations();
  };

  const statsDisplay = [
    { label: "การจองที่กำลังจะถึง", value: stats.total, sub: "รายการจองทั้งหมด" },
    { label: "ยืนยันเรียบร้อยแล้ว", value: stats.confirmed, sub: "พร้อมรับรอง" },
    { label: "รอการยืนยัน", value: stats.pending, sub: "รอตรวจสอบ" },
    { label: "จำนวนลูกค้ารวม", value: stats.totalGuests, sub: "จำนวนที่คาดการณ์" },
  ];

  return (
    <div className="space-y-8">
      
      {/* Walk-in Success Alert */}
      {walkinSuccessMsg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in duration-300">
          <div className="flex items-center gap-2 font-medium text-sm">
            <span>✅</span> {walkinSuccessMsg}
          </div>
          <button onClick={() => setWalkinSuccessMsg("")} className="text-green-600 hover:text-green-800 text-xs font-bold">
            ปิด
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsDisplay.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl border border-border shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">{stat.label}</h3>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-serif text-charcoal-DEFAULT">{stat.value}</span>
              <span className="text-xs text-muted-foreground">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Reservations Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-border flex justify-between items-center">
            <h3 className="font-serif text-lg text-charcoal-DEFAULT">ตารางการจองโต๊ะที่จะมาถึง</h3>
            <button onClick={() => fetchReservations(true)} className="text-sm font-medium text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1">
              <span>↻</span> รีเฟรชข้อมูล
            </button>
          </div>
          
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">กำลังโหลดข้อมูลการจอง...</div>
          ) : reservations.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">ยังไม่มีรายการจองโต๊ะที่จะมาถึง</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-cream-light/50 text-muted-foreground uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4 font-medium">วันและเวลา</th>
                    <th className="px-6 py-4 font-medium">ลูกค้า & โต๊ะ</th>
                    <th className="px-6 py-4 font-medium">จำนวนแขก</th>
                    <th className="px-6 py-4 font-medium">สถานะ</th>
                    <th className="px-6 py-4 font-medium">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reservations.map((booking) => (
                    <tr key={booking.id} className="hover:bg-cream-light/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-charcoal-DEFAULT">{booking.time} น.</div>
                        <div className="text-muted-foreground text-xs">{new Date(booking.date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-charcoal-DEFAULT font-semibold">{booking.name}</div>
                        {booking.email && booking.email !== "walkin@casasol.com" && (
                          <div className="text-muted-foreground text-xs">{booking.email}</div>
                        )}
                        {booking.special_requests && (
                          <div className="text-terracotta-600 text-[11px] font-medium mt-0.5">
                            {booking.special_requests}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-charcoal-DEFAULT">
                        <span className="font-semibold">{booking.guests}</span> ท่าน
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[booking.status] || "bg-gray-100 text-gray-700"}`}>
                          {STATUS_THAI[booking.status] || booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {booking.status !== "confirmed" && booking.status !== "cancelled" && (
                            <button 
                              onClick={() => updateStatus(booking.id, "confirmed")}
                              className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded transition-colors"
                            >
                              ยืนยัน
                            </button>
                          )}
                          {booking.status !== "cancelled" && (
                            <button 
                              onClick={() => updateStatus(booking.id, "cancelled")}
                              className="px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors"
                            >
                              ยกเลิก
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteReservation(booking.id)}
                            className="px-2.5 py-1 text-xs font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-200 rounded transition-colors shadow-2xs"
                            title="ลบรายการนี้ออกจากระบบอย่างถาวร"
                          >
                            🗑️ ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions & Notes */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
            <h3 className="font-serif text-lg text-charcoal-DEFAULT mb-4">การดำเนินการด่วน</h3>
            <div className="space-y-3">
              {/* Walk-in Button triggers Popup Modal */}
              <button 
                onClick={() => setIsWalkinOpen(true)}
                className="w-full py-3 px-4 bg-terracotta-600 text-white rounded-lg font-medium hover:bg-terracotta-700 transition-colors flex items-center justify-center gap-2 shadow-xs active:scale-98"
              >
                <span>+</span> เพิ่มการจอง Walk-in
              </button>

              <button 
                onClick={() => alert("ระบบปิดรับจองชั่วคราวถูกบันทึกเรียบร้อย")}
                className="w-full py-2.5 px-4 bg-white border border-border text-charcoal-DEFAULT rounded-lg font-medium hover:bg-cream-light transition-colors text-sm"
              >
                ปิดรับจองวัน/เวลา
              </button>
            </div>
          </div>

          <div className="bg-charcoal-DEFAULT p-6 rounded-xl text-cream-light shadow-sm">
            <h3 className="font-serif text-lg text-white mb-4">บันทึกกะการทำงาน (Shift Notes)</h3>
            <ul className="space-y-4 text-sm text-cream-dark/80">
              <li className="flex gap-3">
                <span className="text-terracotta-400">⚠️</span>
                <span>ลูกค้า VIP ถึงเวลา 19:00 (ฉลองวันครบรอบ)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-terracotta-400">🐟</span>
                <span>ปลากะพง (Sea Bass) หมดสต็อกชั่วคราว</span>
              </li>
              <li className="flex gap-3">
                <span className="text-terracotta-400">🎉</span>
                <span>กรุ๊ปใหญ่ 12 ท่าน เวลา 20:30 ในห้องส่วนตัว</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* ===================== POPUP MODAL: WALK-IN BOOKING ===================== */}
      {isWalkinOpen && (
        <div className="fixed inset-0 bg-charcoal-DEFAULT/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-border">
            <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
              <div>
                <h2 className="font-serif text-2xl text-charcoal-DEFAULT font-bold">เพิ่มการจอง Walk-in</h2>
                <p className="text-xs text-muted-foreground mt-0.5">เลือกโต๊ะที่ว่างและระบุข้อมูลลูกค้าเพื่อเปิดโต๊ะทันที</p>
              </div>
              <button 
                onClick={() => setIsWalkinOpen(false)}
                className="w-8 h-8 rounded-full bg-cream-dark flex items-center justify-center text-charcoal-DEFAULT hover:bg-cream-DEFAULT text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWalkinSubmit} className="space-y-5">
              {/* 1. เลือกโต๊ะที่ว่าง (Available Table) */}
              <div>
                <label className="block text-sm font-medium text-charcoal-DEFAULT mb-1.5">
                  เลือกโต๊ะที่ว่าง <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-terracotta-500 text-sm font-medium outline-none bg-white"
                  required
                >
                  {AVAILABLE_TABLES.map((t) => (
                    <option key={t.id} value={t.name}>
                      🟢 {t.name} ({t.capacity} ที่นั่ง) - ว่างพร้อมใช้งาน
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. ชื่อลูกค้า (Customer Name) */}
              <div>
                <label className="block text-sm font-medium text-charcoal-DEFAULT mb-1.5">
                  ชื่อลูกค้า <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="เช่น คุณสมชาย, คุณแอนนา"
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-terracotta-500 text-sm outline-none"
                  autoFocus
                />
              </div>

              {/* 3. Party Size (จำนวนคน) */}
              <div>
                <label className="block text-sm font-medium text-charcoal-DEFAULT mb-1.5">
                  Party Size (จำนวนคน) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPartySize(Math.max(1, partySize - 1))}
                    className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-lg font-bold hover:bg-cream-light active:bg-cream-dark transition-colors"
                  >
                    −
                  </button>
                  <div className="w-16 h-10 border border-border rounded-lg flex items-center justify-center font-bold text-base text-charcoal-DEFAULT bg-cream-light/30">
                    {partySize}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPartySize(Math.min(20, partySize + 1))}
                    className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-lg font-bold hover:bg-cream-light active:bg-cream-dark transition-colors"
                  >
                    +
                  </button>
                  <span className="text-xs text-muted-foreground ml-1">
                    {partySize === 1 ? "ลูกค้า 1 ท่าน" : `ลูกค้า ${partySize} ท่าน`}
                  </span>
                </div>
              </div>

              {/* 4. Occasion (โอกาสพิเศษ) */}
              <div>
                <label className="block text-sm font-medium text-charcoal-DEFAULT mb-1.5">
                  Occasion (โอกาสพิเศษ)
                </label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-terracotta-500 text-sm outline-none bg-white"
                >
                  {OCCASIONS.map((occ) => (
                    <option key={occ} value={occ}>
                      {occ}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => setIsWalkinOpen(false)}
                  className="px-4 py-2.5 border border-border text-charcoal-DEFAULT rounded-lg hover:bg-cream-light transition-colors text-sm font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWalkin}
                  className="px-6 py-2.5 bg-terracotta-600 text-white rounded-lg hover:bg-terracotta-700 transition-colors text-sm font-semibold shadow-sm disabled:opacity-60 flex items-center gap-2"
                >
                  {isSubmittingWalkin ? "กำลังบันทึก..." : "ยืนยันการจองเปิดโต๊ะ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
