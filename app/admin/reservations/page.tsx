"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-gray-100 text-gray-700",
};

const STATUS_THAI: Record<string, string> = {
  pending: "รอยืนยัน",
  confirmed: "ยืนยันแล้ว",
  cancelled: "ยกเลิกแล้ว",
  completed: "เสร็จสิ้น",
};

export default function ReservationsPage() {
  const supabase = createClient();
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // Default to "all" so everything is visible!

  useEffect(() => {
    fetchReservations();

    // Auto-poll every 5 seconds to catch new bookings from frontend immediately
    const interval = setInterval(() => {
      fetchReservations(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [filter]);

  const fetchReservations = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    const today = new Date().toISOString().split("T")[0];
    
    let query = supabase.from("reservations").select("*");
    
    if (filter === "upcoming") {
      query = query.gte("date", today).order("date", { ascending: false }).order("created_at", { ascending: false });
    } else if (filter === "past") {
      query = query.lt("date", today).order("date", { ascending: false }).order("created_at", { ascending: false });
    } else {
      query = query.order("date", { ascending: false }).order("created_at", { ascending: false });
    }

    const { data } = await query;
    if (data) {
      setReservations(data.filter((r: any) => !r.special_requests?.includes("[DELETED")));
    }
    if (showLoading) setIsLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("reservations").update({ status }).eq("id", id);
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl text-charcoal-DEFAULT">ระบบจัดการการจองโต๊ะ</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ตรวจสอบ อนุมัติ ปรับสถานะ หรือลบรายการจองโต๊ะของลูกค้า
          </p>
        </div>
        <div className="flex bg-white rounded-lg border border-border p-1">
          <button 
            onClick={() => setFilter("all")}
            className={`px-4 py-2 text-xs font-medium rounded-md transition-colors ${filter === "all" ? "bg-terracotta-600 text-white font-semibold shadow-xs" : "text-charcoal-DEFAULT hover:bg-cream-light"}`}
          >
            ทั้งหมด ({reservations.length})
          </button>
          <button 
            onClick={() => setFilter("upcoming")}
            className={`px-4 py-2 text-xs font-medium rounded-md transition-colors ${filter === "upcoming" ? "bg-terracotta-600 text-white font-semibold shadow-xs" : "text-charcoal-DEFAULT hover:bg-cream-light"}`}
          >
            กำลังจะมาถึง
          </button>
          <button 
            onClick={() => setFilter("past")}
            className={`px-4 py-2 text-xs font-medium rounded-md transition-colors ${filter === "past" ? "bg-terracotta-600 text-white font-semibold shadow-xs" : "text-charcoal-DEFAULT hover:bg-cream-light"}`}
          >
            ที่ผ่านมาแล้ว
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-cream-light/40">
          <h3 className="font-medium text-charcoal-DEFAULT text-sm">
            {filter === "upcoming" ? "รายการจองที่กำลังจะมาถึง" : filter === "past" ? "ประวัติการจองที่ผ่านมา" : "รายการจองทั้งหมด"}
          </h3>
          <button onClick={() => fetchReservations(true)} className="text-xs font-medium text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1">
            <span>↻</span> รีเฟรชข้อมูล
          </button>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">กำลังโหลดข้อมูลการจอง...</div>
        ) : reservations.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">ไม่พบข้อมูลการจองในหมวดนี้</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-cream-light/60 text-muted-foreground uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium">รหัสจอง</th>
                  <th className="px-6 py-4 font-medium">วันและเวลา</th>
                  <th className="px-6 py-4 font-medium">ข้อมูลลูกค้า & โต๊ะ</th>
                  <th className="px-6 py-4 font-medium">จำนวนแขก</th>
                  <th className="px-6 py-4 font-medium">สถานะ</th>
                  <th className="px-6 py-4 font-medium text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reservations.map((booking) => (
                  <tr key={booking.id} className="hover:bg-cream-light/30 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <span className="font-mono text-xs text-terracotta-700 bg-cream-dark px-2.5 py-1 rounded font-bold">
                        #{booking.id.split('-')[0].toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="font-medium text-charcoal-DEFAULT">{booking.time} น.</div>
                      <div className="text-muted-foreground text-xs">{new Date(booking.date).toLocaleDateString('th-TH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="text-charcoal-DEFAULT font-semibold">{booking.name}</div>
                      {booking.email && booking.email !== "walkin@casasol.com" && (
                        <div className="text-muted-foreground text-xs">{booking.email}</div>
                      )}
                      {booking.phone && booking.phone !== "-" && (
                        <div className="text-muted-foreground text-xs">📞 {booking.phone}</div>
                      )}
                      {booking.special_requests && (
                        <div className="text-terracotta-600 text-xs font-medium mt-1 bg-cream-light/60 px-2 py-0.5 rounded inline-block border border-border/50">
                          {booking.special_requests}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 align-top text-charcoal-DEFAULT">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-cream-dark font-medium text-xs">
                        {booking.guests} ท่าน
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[booking.status] || "bg-gray-100 text-gray-700"}`}>
                        {STATUS_THAI[booking.status] || booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right align-top">
                      <div className="flex justify-end items-center gap-1.5 flex-wrap">
                        {booking.status !== "confirmed" && booking.status !== "cancelled" && (
                          <button 
                            onClick={() => updateStatus(booking.id, "confirmed")}
                            className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded transition-colors"
                          >
                            ยืนยัน
                          </button>
                        )}
                        {booking.status === "confirmed" && (
                          <button 
                            onClick={() => updateStatus(booking.id, "completed")}
                            className="px-2 py-1 text-xs font-medium text-charcoal-DEFAULT bg-cream-dark hover:bg-cream-DEFAULT border border-border rounded transition-colors"
                          >
                            ทานเสร็จแล้ว
                          </button>
                        )}
                        {booking.status !== "cancelled" && booking.status !== "completed" && (
                          <button 
                            onClick={() => updateStatus(booking.id, "cancelled")}
                            className="px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors"
                          >
                            ยกเลิก
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteReservation(booking.id)}
                          className="px-2 py-1 text-xs font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-200 rounded transition-colors shadow-2xs"
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
    </div>
  );
}
