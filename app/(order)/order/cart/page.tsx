"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { createClient } from "@/lib/supabase/client";

const RESTAURANT_TABLES = [
  { id: "โต๊ะ 1", labelTh: "โต๊ะ 1 (2 ที่นั่ง)", labelEn: "Table 1 (2 Seats)" },
  { id: "โต๊ะ 2", labelTh: "โต๊ะ 2 (2 ที่นั่ง)", labelEn: "Table 2 (2 Seats)" },
  { id: "โต๊ะ 3", labelTh: "โต๊ะ 3 (4 ที่นั่ง)", labelEn: "Table 3 (4 Seats)" },
  { id: "โต๊ะ 4", labelTh: "โต๊ะ 4 (4 ที่นั่ง)", labelEn: "Table 4 (4 Seats)" },
  { id: "โต๊ะ 5", labelTh: "โต๊ะ 5 (6 ที่นั่ง)", labelEn: "Table 5 (6 Seats)" },
  { id: "โต๊ะ 6", labelTh: "โต๊ะ 6 (2 ที่นั่ง)", labelEn: "Table 6 (2 Seats)" },
  { id: "โต๊ะ 7", labelTh: "โต๊ะ 7 (8 ที่นั่ง)", labelEn: "Table 7 (8 Seats)" },
  { id: "โต๊ะ 8", labelTh: "โต๊ะ 8 (4 ที่นั่ง)", labelEn: "Table 8 (4 Seats)" },
  { id: "สั่งกลับบ้าน", labelTh: "🛍️ สั่งกลับบ้าน (Takeaway)", labelEn: "🛍️ Takeaway" },
];

export default function OrderCartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  const { locale } = useI18n();
  const isThai = locale === "th";
  const supabase = createClient();

  const [selectedTable, setSelectedTable] = useState(RESTAURANT_TABLES[0].id);
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tax = totalPrice * 0.07;
  const total = totalPrice + tax;

  // Handle Checkout & Send to Admin
  const handleProceedToCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const orderItems = items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      price: i.price,
    }));

    const newOrder = {
      id: orderId,
      customerName: customerName.trim() || `${isThai ? "ลูกค้า" : "Customer"} ${selectedTable}`,
      type: selectedTable === "สั่งกลับบ้าน" ? "online_order" : "booking_preorder",
      tableOrTime: selectedTable,
      phone: "-",
      date: now.toISOString(),
      status: "preparing",
      items: orderItems,
      total: total,
    };

    // 1. Save to localStorage for Admin Menu Page and Step 3 Checkout
    try {
      const existing = localStorage.getItem("casasol_admin_orders");
      const list = existing ? JSON.parse(existing) : [];
      const updatedList = [newOrder, ...list];
      localStorage.setItem("casasol_admin_orders", JSON.stringify(updatedList));
      localStorage.setItem("casasol_last_order", JSON.stringify(newOrder));
    } catch (err) {
      console.error("Local storage error:", err);
    }

    // 2. Also send to Supabase reservations table so all admin screens stay in sync
    try {
      await supabase.from("reservations").insert([
        {
          id: crypto.randomUUID(),
          name: `${customerName.trim() || (isThai ? "ลูกค้า" : "Customer")} (${selectedTable})`,
          email: "order@casasol.com",
          phone: "-",
          date: now.toISOString().split("T")[0],
          time: now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
          guests: items.reduce((sum, item) => sum + item.quantity, 0),
          special_requests: `[ออเดอร์โต๊ะ ${selectedTable}] ${items
            .map((i) => `${i.name} x${i.quantity}`)
            .join(", ")} | ยอดรวม $${total.toFixed(2)}${notes ? ` | หมายเหตุ: ${notes}` : ""}`,
          status: "confirmed",
        },
      ]);
    } catch (err) {
      console.error("Supabase insert error:", err);
    }

    // Clear cart and navigate directly to Step 3: Checkout
    clearCart();
    setIsSubmitting(false);
    router.push(`/order/checkout?orderId=${orderId}`);
  };

  // EMPTY CART SCREEN
  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl text-charcoal-DEFAULT">
            {isThai ? "ตะกร้าของคุณ" : "Your Cart"}
          </h1>
          <Link
            href="/order/menu"
            className="text-sm font-medium text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1.5"
          >
            ← {isThai ? "กลับไปเลือกเมนูอาหาร" : "Back to Menu"}
          </Link>
        </div>

        <div className="bg-white border border-border rounded-2xl p-8 text-center py-16 shadow-xs">
          <div className="w-16 h-16 bg-cream-light rounded-full flex items-center justify-center mx-auto mb-4 text-terracotta-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-charcoal-DEFAULT mb-2">
            {isThai ? "ยังไม่มีอาหารในตะกร้า" : "Your cart is empty"}
          </h3>
          <p className="text-muted-foreground mb-6 text-sm">
            {isThai
              ? "เลือกอาหารเม็กซิกันจานโปรดของคุณแล้วเพิ่มลงในตะกร้าได้เลยครับ"
              : "Browse our authentic Mexican dishes and add your favorites to the cart."}
          </p>
          <Link
            href="/order/menu"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-terracotta-600 px-8 text-sm font-semibold text-white transition-colors hover:bg-terracotta-700 shadow-sm"
          >
            {isThai ? "ดูรายการเมนูอาหาร (Browse Menu)" : "Browse Menu"}
          </Link>
        </div>
      </div>
    );
  }

  // ACTIVE CART SCREEN
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header with Back to Menu */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="font-serif text-3xl text-charcoal-DEFAULT">
            {isThai ? "รายการอาหารของคุณ" : "Your Order Cart"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isThai
              ? "ตรวจสอบรายการ และระบุโต๊ะที่ต้องการให้ไปเสิร์ฟ"
              : "Review your selected items and specify your delivery table"}
          </p>
        </div>
        <Link
          href="/order/menu"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-white text-sm font-medium text-charcoal-DEFAULT hover:bg-cream-light hover:text-terracotta-600 transition-colors shadow-2xs"
        >
          <span>←</span> {isThai ? "กลับไปเลือกเมนูอาหาร" : "Back to Menu"}
        </Link>
      </div>

      <form onSubmit={handleProceedToCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Items List & Table Delivery Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Table Selection Box */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-terracotta-500/30 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🪑</span>
              <div>
                <h3 className="font-serif text-lg font-bold text-charcoal-DEFAULT">
                  {isThai ? "เลือกโต๊ะที่จะให้ไปส่งอาหาร" : "Select Delivery Table"}{" "}
                  <span className="text-red-500">*</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isThai
                    ? "พนักงานจะนำอาหารไปเสิร์ฟตามโต๊ะที่คุณเลือก"
                    : "Our staff will deliver freshly prepared dishes to your chosen table"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {RESTAURANT_TABLES.map((table) => (
                <button
                  type="button"
                  key={table.id}
                  onClick={() => setSelectedTable(table.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedTable === table.id
                      ? "bg-terracotta-50 border-terracotta-600 text-terracotta-700 ring-2 ring-terracotta-500/30 font-bold shadow-xs"
                      : "bg-white border-border text-charcoal-DEFAULT hover:border-terracotta-300 hover:bg-cream-light/40 font-medium"
                  }`}
                >
                  <div className="text-xs">{isThai ? table.labelTh : table.labelEn}</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-charcoal-DEFAULT mb-1">
                  {isThai ? "ชื่อลูกค้า (ระบุหรือไม่ก็ได้)" : "Customer Name (Optional)"}
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={isThai ? "เช่น คุณสมชาย" : "e.g. John Smith"}
                  className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:ring-2 focus:ring-terracotta-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-charcoal-DEFAULT mb-1">
                  {isThai ? "หมายเหตุเพิ่มเติมถึงครัว" : "Special Instructions"}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isThai ? "เช่น เผ็ดน้อย, ขอช้อนเพิ่ม..." : "e.g. Mild spice, extra sauce..."}
                  className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:ring-2 focus:ring-terracotta-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="space-y-3">
            <h3 className="font-serif text-lg font-bold text-charcoal-DEFAULT">
              {isThai
                ? `รายการที่เลือก (${items.reduce((s, i) => s + i.quantity, 0)} ชิ้น)`
                : `Selected Items (${items.reduce((s, i) => s + i.quantity, 0)})`}
            </h3>
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 bg-white p-4 rounded-xl border border-border shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-cream-dark flex-shrink-0 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1541288039-445e5d32b5ca?q=80&w=800&auto=format&fit=crop";
                    }}
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-charcoal-DEFAULT text-base">{item.name}</h4>
                      <p className="text-sm font-medium text-terracotta-600 font-mono">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                      title={isThai ? "ลบเมนูนี้" : "Remove item"}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-md bg-cream-light border border-border flex items-center justify-center hover:bg-cream-DEFAULT font-bold text-base transition-colors"
                    >
                      −
                    </button>
                    <span className="font-bold w-5 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-md bg-cream-light border border-border flex items-center justify-center hover:bg-cream-DEFAULT font-bold text-base transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Order Summary & Proceed Button */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-border sticky top-24 shadow-sm space-y-6">
            <h3 className="font-serif text-xl font-bold text-charcoal-DEFAULT">
              {isThai ? "สรุปคำสั่งซื้อ" : "Order Summary"}
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isThai ? "ยอดรวมค่าอาหาร" : "Subtotal"}</span>
                <span className="font-mono font-medium">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isThai ? "ภาษีมูลค่าเพิ่ม (7%)" : "VAT (7%)"}</span>
                <span className="font-mono font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isThai ? "โต๊ะที่จัดส่ง" : "Delivery Table"}</span>
                <span className="font-bold text-terracotta-600">{selectedTable}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                <span>{isThai ? "ยอดรวมทั้งสิ้น" : "Total Amount"}</span>
                <span className="text-terracotta-600 font-mono">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 flex items-center justify-center rounded-xl bg-terracotta-600 text-white font-semibold hover:bg-terracotta-700 transition-colors shadow-sm disabled:opacity-60 text-base"
            >
              {isSubmitting
                ? isThai
                  ? "กำลังส่งออเดอร์..."
                  : "Sending order..."
                : isThai
                ? "ยืนยันการสั่งอาหาร (ส่งเข้าครัว)"
                : "Confirm Order (Send to Kitchen)"}
            </button>

            <Link
              href="/order/menu"
              className="w-full py-2.5 flex items-center justify-center rounded-lg border border-border text-charcoal-DEFAULT text-xs font-medium hover:bg-cream-light transition-colors text-center"
            >
              + {isThai ? "เลือกรายการอาหารเพิ่ม" : "Add More Items"}
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
