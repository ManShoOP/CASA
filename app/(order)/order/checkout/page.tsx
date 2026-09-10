"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

function CheckoutContent() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("orderId");
  const { items, clearCart, totalPrice } = useCart();
  const { locale } = useI18n();
  const isThai = locale === "th";
  const supabase = createClient();

  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [selectedTable, setSelectedTable] = useState(RESTAURANT_TABLES[0].id);
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const tax = totalPrice * 0.07;
  const total = totalPrice + tax;

  useEffect(() => {
    // Attempt to load order by orderId param or from localStorage
    try {
      if (orderIdParam) {
        const storedOrders = localStorage.getItem("casasol_admin_orders");
        if (storedOrders) {
          const list = JSON.parse(storedOrders);
          const found = list.find((o: any) => o.id === orderIdParam);
          if (found) {
            setCompletedOrder(found);
            setIsLoaded(true);
            return;
          }
        }
      }

      const lastOrderStr = localStorage.getItem("casasol_last_order");
      if (lastOrderStr) {
        const lastOrder = JSON.parse(lastOrderStr);
        if (lastOrder && (!orderIdParam || lastOrder.id === orderIdParam)) {
          setCompletedOrder(lastOrder);
          setIsLoaded(true);
          return;
        }
      }
    } catch (e) {
      console.error("Error loading order:", e);
    }
    setIsLoaded(true);
  }, [orderIdParam]);

  // Handle direct submission if someone visits /order/checkout with items in cart
  const handleSubmitOrder = async (e: React.FormEvent) => {
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

    try {
      const existing = localStorage.getItem("casasol_admin_orders");
      const list = existing ? JSON.parse(existing) : [];
      localStorage.setItem("casasol_admin_orders", JSON.stringify([newOrder, ...list]));
      localStorage.setItem("casasol_last_order", JSON.stringify(newOrder));
    } catch (err) {
      console.error("Local storage error:", err);
    }

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

    setCompletedOrder(newOrder);
    clearCart();
    setIsSubmitting(false);
  };

  if (!isLoaded) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="w-8 h-8 border-3 border-terracotta-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">{isThai ? "กำลังโหลดข้อมูล..." : "Loading..."}</p>
      </div>
    );
  }

  // CASE 1: ORDER COMPLETED SCREEN
  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white border border-border rounded-2xl p-8 sm:p-12 text-center shadow-lg animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-xs">
            ✓
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-cream-dark text-terracotta-700 text-xs font-mono font-bold mb-3">
            {isThai ? `รหัสออเดอร์ #${completedOrder.id}` : `Order Reference #${completedOrder.id}`}
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal-DEFAULT mb-3">
            {isThai ? "สั่งอาหารเรียบร้อยแล้ว!" : "Order Sent to Kitchen!"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {isThai
              ? "ออเดอร์ของคุณถูกส่งไปยังห้องครัวเรียบร้อยแล้ว กำลังเตรียมเสิร์ฟไปที่ "
              : "Your order has been sent to the kitchen and is being freshly prepared for "}
            <strong className="text-terracotta-600 font-bold text-base">
              {completedOrder.tableOrTime}
            </strong>
          </p>

          {/* Order Summary Card */}
          <div className="bg-cream-light/60 p-5 rounded-xl text-left border border-border mb-8 space-y-3 text-sm">
            <div className="flex justify-between font-medium border-b border-border/60 pb-2">
              <span>{isThai ? "สถานที่จัดส่ง / โต๊ะ" : "Delivery Location / Table"}</span>
              <span className="text-terracotta-600 font-bold">{completedOrder.tableOrTime}</span>
            </div>
            <div className="space-y-1.5 py-1">
              {completedOrder.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-xs text-charcoal-DEFAULT">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-mono">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-border/60">
              <span>{isThai ? "ยอดรวมทั้งสิ้น (รวมภาษี 7%)" : "Total Amount (incl. 7% tax)"}</span>
              <span className="text-terracotta-600 font-mono">
                ${Number(completedOrder.total || 0).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <Link
              href="/order/menu"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-terracotta-600 text-white font-semibold hover:bg-terracotta-700 transition-colors shadow-sm text-sm"
            >
              + {isThai ? "สั่งอาหารเพิ่ม (กลับไปหน้าเมนู)" : "Order More (Back to Menu)"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // CASE 2: CART HAS ITEMS - FILL DETAILS & PLACE ORDER
  if (items.length > 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b border-border pb-4">
          <div>
            <h1 className="font-serif text-3xl text-charcoal-DEFAULT">
              {isThai ? "ยืนยันการสั่งอาหาร (Checkout)" : "Checkout"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isThai
                ? "ขั้นตอนที่ 3: ระบุโต๊ะที่ต้องการให้ไปส่ง และยืนยันการสั่ง"
                : "Step 3: Specify your delivery table and confirm your order"}
            </p>
          </div>
          <Link
            href="/order/cart"
            className="text-sm font-medium text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1.5"
          >
            ← {isThai ? "กลับไปที่ตะกร้า" : "Back to Cart"}
          </Link>
        </div>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
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
                      : "Staff will deliver your freshly prepared food to this table"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                {RESTAURANT_TABLES.map((t) => {
                  const isSelected = selectedTable === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTable(t.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-terracotta-600 bg-terracotta-50 text-terracotta-900 font-bold ring-2 ring-terracotta-500/30 shadow-xs"
                          : "border-border bg-white text-charcoal-DEFAULT hover:border-terracotta-300 hover:bg-cream-light/50"
                      }`}
                    >
                      <div className="text-sm">{isThai ? t.labelTh : t.labelEn}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {isSelected
                          ? isThai
                            ? "✓ เลือกโต๊ะนี้"
                            : "✓ Selected"
                          : isThai
                          ? "คลิกเพื่อเลือก"
                          : "Click to select"}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-border pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-DEFAULT mb-1">
                    {isThai ? "ชื่อลูกค้า (หรือเบอร์โต๊ะ)" : "Customer Name (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={isThai ? "เช่น คุณสมชาย หรือ ลูกค้าโต๊ะ 3" : "e.g. John Smith"}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-DEFAULT mb-1">
                    {isThai ? "หมายเหตุถึงครัว (ไม่บังคับ)" : "Kitchen Instructions"}
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={isThai ? "เช่น ไม่ใส่ผักชี, เผ็ดน้อย" : "e.g. Mild spice, extra lime..."}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Summary */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-xs h-fit space-y-4">
            <h3 className="font-serif text-lg font-bold text-charcoal-DEFAULT border-b border-border pb-3">
              {isThai ? "สรุปรายการสั่งซื้อ" : "Order Summary"}
            </h3>
            <div className="space-y-2 text-sm max-h-48 overflow-y-auto">
              {items.map((i) => (
                <div key={i.id} className="flex justify-between text-xs">
                  <span>
                    {i.name} x{i.quantity}
                  </span>
                  <span className="font-mono font-medium">
                    ${(i.price * i.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>{isThai ? "ยอดรวมอาหาร" : "Subtotal"}</span>
                <span className="font-mono">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{isThai ? "ภาษี (7%)" : "VAT (7%)"}</span>
                <span className="font-mono">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-charcoal-DEFAULT pt-2 border-t border-border">
                <span>{isThai ? "ยอดสุทธิ" : "Total"}</span>
                <span className="text-terracotta-600 font-mono">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-3 rounded-lg bg-terracotta-600 text-white font-semibold text-sm hover:bg-terracotta-700 transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  {isThai ? "กำลังส่งออเดอร์..." : "Sending order..."}
                </>
              ) : (
                <>{isThai ? `ยืนยันการสั่งอาหาร (ส่งไปโต๊ะ: ${selectedTable})` : `Confirm Order (Deliver to: ${selectedTable})`}</>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // CASE 3: NO ITEMS & NO COMPLETED ORDER
  return (
    <div className="max-w-md mx-auto py-16 text-center">
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
        {isThai ? "ยังไม่มีรายการสั่งซื้อ" : "No active orders"}
      </h3>
      <p className="text-muted-foreground mb-6 text-sm">
        {isThai
          ? "เลือกอาหารเม็กซิกันจานโปรดของคุณเพื่อเริ่มการสั่งซื้อ"
          : "Browse our Mexican dishes to start placing your order."}
      </p>
      <Link
        href="/order/menu"
        className="inline-flex h-11 items-center justify-center rounded-lg bg-terracotta-600 px-6 text-sm font-semibold text-white hover:bg-terracotta-700 transition-colors"
      >
        {isThai ? "ไปยังหน้าเลือกเมนูอาหาร" : "Go to Menu"}
      </Link>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto py-16 text-center text-muted-foreground">
          กำลังโหลด...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
