"use client";

import { useState, useEffect, useCallback } from "react";
import { MASTER_MENU_ITEMS, SharedMenuItem } from "@/lib/data/menu";
import { createClient } from "@/lib/supabase/client";

type MenuItem = {
  id: string;
  name: string;
  category: "Starters" | "Tacos & Mains" | "Sides" | "Drinks & Desserts";
  price: number;
  description: string;
  image: string;
};

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

type CustomerOrder = {
  id: string;
  dbId?: string;
  customerName: string;
  type: "booking_preorder" | "online_order";
  bookingRef?: string;
  tableOrTime?: string;
  phone?: string;
  date: string;
  status: "preparing" | "ready" | "delivered" | "cancelled";
  items: OrderItem[];
  total: number;
  notes?: string;
};

// Map MASTER_MENU_ITEMS from the primary menu page
const INITIAL_MENU: MenuItem[] = MASTER_MENU_ITEMS.map((item) => ({
  id: String(item.id),
  name: item.name,
  category: item.category,
  price: item.price,
  description: item.description,
  image: item.image,
}));

const MENU_CATEGORIES = ["All", "Starters", "Tacos & Mains", "Sides", "Drinks & Desserts"] as const;

const CATEGORY_NAMES_TH: Record<string, string> = {
  All: "ทั้งหมด",
  Starters: "ของว่าง",
  "Tacos & Mains": "ทาโก้ & จานหลัก",
  Sides: "เครื่องเคียง",
  "Drinks & Desserts": "เครื่องดื่ม & ของหวาน",
};

export default function AdminMenuPage() {
  const [activeTab, setActiveTab] = useState<"menu" | "orders">("menu");

  // Menu State
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);

  // Orders State - loaded from Supabase on mount
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [orderFilter, setOrderFilter] = useState<"all" | "booking" | "online">("all");

  const [isMounted, setIsMounted] = useState(false);

  // Fetch orders from Supabase (source of truth) and merge with any local orders
  const fetchOrders = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .order("created_at", { ascending: false });

      const dbOrders: CustomerOrder[] = [];

      if (!error && data) {
        data.forEach((row: any) => {
          const req = row.special_requests || "";
          // Only process food orders (not regular reservations)
          if (!req.includes("[ออเดอร์โต๊ะ") && row.email !== "order@casasol.com") {
            return;
          }
          // Skip cancelled or deleted orders
          if (
            row.status === "cancelled" ||
            row.status === "deleted" ||
            req.includes("[DELETED") ||
            req.includes("[CANCELLED")
          ) {
            return;
          }

          const tableMatch = req.match(/\[ออเดอร์โต๊ะ\s*([^\]]+)\]/);
          const tableOrTime = tableMatch ? tableMatch[1].trim() : "โต๊ะในร้าน";

          const itemsMatch = req.match(/\]\s*([^|]+)\s*\|?/);
          const items: OrderItem[] = [];
          if (itemsMatch) {
            const rawItems = itemsMatch[1].split(",");
            for (const part of rawItems) {
              const trimmed = part.trim();
              if (!trimmed) continue;
              const m = trimmed.match(/^(.*?)\s*x(\d+)$/);
              if (m) {
                const name = m[1].trim();
                const matchMenu = MASTER_MENU_ITEMS.find(
                  (mi) => mi.name.toLowerCase() === name.toLowerCase()
                );
                items.push({
                  name,
                  quantity: parseInt(m[2], 10),
                  price: matchMenu ? matchMenu.price : 0,
                });
              } else {
                const matchMenu = MASTER_MENU_ITEMS.find(
                  (mi) => mi.name.toLowerCase() === trimmed.toLowerCase()
                );
                items.push({
                  name: trimmed,
                  quantity: 1,
                  price: matchMenu ? matchMenu.price : 0,
                });
              }
            }
          }

          const totalMatch = req.match(/ยอดรวม\s*\$([0-9.]+)/);
          const total = totalMatch ? parseFloat(totalMatch[1]) : 0;
          const notesMatch = req.match(/หมายเหตุ:\s*(.+)$/);
          const notes = notesMatch ? notesMatch[1].trim() : "";

          // Determine kitchen status from special_requests tag or fallback to preparing
          let orderStatus: CustomerOrder["status"] = "preparing";
          if (req.includes("[STATUS: ready]")) orderStatus = "ready";
          else if (req.includes("[STATUS: delivered]")) orderStatus = "delivered";
          else if (req.includes("[STATUS: preparing]")) orderStatus = "preparing";
          else if (row.status === "cancelled") orderStatus = "cancelled";

          dbOrders.push({
            id: `ORD-${row.id.slice(0, 4).toUpperCase()}`,
            dbId: row.id,
            customerName: row.name || "ลูกค้า",
            type: tableOrTime.includes("สั่งกลับบ้าน") ? "online_order" : "booking_preorder",
            tableOrTime: tableOrTime,
            phone: row.phone || "-",
            date: row.created_at || row.date,
            status: orderStatus,
            items,
            total,
            notes,
          });
        });
      }

      setOrders(dbOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  }, []);

  // Sync with Local Storage and database
  useEffect(() => {
    setIsMounted(true);
    const savedMenu = localStorage.getItem("casasol_admin_menu_v3");
    if (savedMenu) {
      try {
        const parsed: MenuItem[] = JSON.parse(savedMenu);
        if (parsed && parsed.length >= INITIAL_MENU.length) {
          // Merge images in case of local updates
          const updated = parsed.map((item) => {
            const match = INITIAL_MENU.find((m) => m.name === item.name);
            if (match && match.image.startsWith("/images/")) {
              return { ...item, image: match.image };
            }
            return item;
          });
          setMenuItems(updated);
        } else {
          setMenuItems(INITIAL_MENU);
        }
      } catch (e) {
        setMenuItems(INITIAL_MENU);
      }
    } else {
      setMenuItems(INITIAL_MENU);
      localStorage.setItem("casasol_admin_menu_v3", JSON.stringify(INITIAL_MENU));
    }

    // Initial fetch of orders from database
    fetchOrders();

    // Auto-poll orders every 3 seconds for live updates
    const interval = setInterval(fetchOrders, 3000);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "casasol_admin_orders") {
        fetchOrders();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [fetchOrders]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("casasol_admin_menu_v3", JSON.stringify(menuItems));
    }
  }, [menuItems, isMounted]);

  // Reset to Master Menu
  const handleResetToMaster = () => {
    if (confirm("ต้องการรีเซ็ตรายการอาหารให้ตรงกับหน้าเว็บจองโต๊ะทั้งหมด 9 รายการใช่หรือไม่?")) {
      setMenuItems(INITIAL_MENU);
      localStorage.setItem("casasol_admin_menu_v3", JSON.stringify(INITIAL_MENU));
      setSelectedCategory("All");
    }
  };

  // Menu Actions
  const handleDeleteMenu = (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบเมนูนี้?")) {
      setMenuItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleSaveMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.name || !editingItem?.price || !editingItem?.category) return;

    if (editingItem.id) {
      setMenuItems((prev) =>
        prev.map((item) => (item.id === editingItem.id ? (editingItem as MenuItem) : item))
      );
    } else {
      const newItem: MenuItem = {
        ...editingItem as MenuItem,
        id: `m${Date.now()}`,
        image:
          editingItem.image ||
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop",
      };
      setMenuItems((prev) => [...prev, newItem]);
    }

    setIsEditing(false);
    setEditingItem(null);
  };

  const openAddModal = () => {
    setEditingItem({ category: "Starters", price: 0, image: "" });
    setIsEditing(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setIsEditing(true);
  };

  // Order Actions
  const handleDeleteOrder = async (id: string) => {
    if (!confirm(`คุณต้องการลบออเดอร์ ${id} นี้ใช่หรือไม่?`)) return;
    
    const target = orders.find((o) => o.id === id);
    if (target?.dbId) {
      try {
        const supabase = createClient();
        // 1. Update in Supabase to cancelled + [DELETED_ORDER] tag so it works with RLS and is permanently filtered out
        await supabase
          .from("reservations")
          .update({
            status: "cancelled",
            special_requests: `[DELETED_ORDER] ลบโดยแอดมิน | ${target.tableOrTime || ""}`,
          })
          .eq("id", target.dbId);
        // 2. Also attempt delete in case RLS policy allows
        await supabase.from("reservations").delete().eq("id", target.dbId);
      } catch (err) {
        console.error("Delete DB error:", err);
      }
    }
    
    setOrders((prev) => prev.filter((order) => order.id !== id));
    
    try {
      const saved = localStorage.getItem("casasol_admin_orders");
      if (saved) {
        const parsed: CustomerOrder[] = JSON.parse(saved);
        localStorage.setItem(
          "casasol_admin_orders",
          JSON.stringify(parsed.filter((o) => o.id !== id))
        );
      }
    } catch (e) {}
  };

  const handleOrderStatusChange = async (id: string, newStatus: CustomerOrder["status"]) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, status: newStatus } : order))
    );

    const target = orders.find((o) => o.id === id);
    if (target?.dbId) {
      try {
        const supabase = createClient();
        const dbStatus = newStatus === "cancelled" ? "cancelled" : "confirmed";

        // Fetch current row special_requests to update kitchen status tag
        const { data: currentRow } = await supabase
          .from("reservations")
          .select("special_requests")
          .eq("id", target.dbId)
          .single();

        let sr = currentRow?.special_requests || "";
        sr = sr.replace(/\[STATUS:\s*\w+\]\s*/g, "");
        sr = `[STATUS: ${newStatus}] ${sr}`;

        await supabase
          .from("reservations")
          .update({
            status: dbStatus,
            special_requests: sr,
          })
          .eq("id", target.dbId);
      } catch (err) {
        console.error("Update DB status error:", err);
      }
    }

    try {
      const saved = localStorage.getItem("casasol_admin_orders");
      if (saved) {
        const parsed: CustomerOrder[] = JSON.parse(saved);
        const updated = parsed.map((o) => (o.id === id ? { ...o, status: newStatus } : o));
        localStorage.setItem("casasol_admin_orders", JSON.stringify(updated));
      }
    } catch (e) {}
  };

  // Filtered menu based on selected category
  const filteredMenuItems =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const filteredOrders = orders.filter((order) => {
    if (orderFilter === "booking") return order.type === "booking_preorder";
    if (orderFilter === "online") return order.type === "online_order";
    return true;
  });

  const getStatusBadge = (status: CustomerOrder["status"]) => {
    switch (status) {
      case "preparing":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "ready":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "delivered":
        return "bg-green-100 text-green-800 border border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="font-serif text-3xl text-charcoal-DEFAULT">จัดการเมนูอาหาร & รายการสั่งซื้อ</h1>
          <p className="text-sm text-muted-foreground mt-1">
            จัดการรายการอาหาร (อิงตามเว็บจองโต๊ะเป็นหลัก) และดูออเดอร์ที่ลูกค้าสั่งหรือจองไว้
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-cream-dark/60 p-1.5 rounded-xl border border-border">
          <button
            onClick={() => setActiveTab("menu")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "menu"
                ? "bg-white text-terracotta-600 shadow-sm font-semibold"
                : "text-charcoal-DEFAULT hover:text-terracotta-600"
            }`}
          >
            🍔 รายการเมนู ({menuItems.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "orders"
                ? "bg-white text-terracotta-600 shadow-sm font-semibold"
                : "text-charcoal-DEFAULT hover:text-terracotta-600"
            }`}
          >
            🛍️ ออเดอร์ลูกค้าที่จอง/สั่ง ({orders.length})
          </button>
        </div>
      </div>

      {/* ===================== TAB 1: MENU MANAGER ===================== */}
      {activeTab === "menu" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="font-serif text-2xl text-charcoal-DEFAULT">
                จัดการรายการเมนูอาหาร (ทั้งหมด {menuItems.length} รายการ)
              </h2>
              <p className="text-xs text-muted-foreground">
                เมนูทั้งหมดตรงกับหน้าเว็บจองโต๊ะและหน้าสั่งอาหาร
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleResetToMaster}
                className="bg-white border border-border text-charcoal-DEFAULT px-4 py-2.5 rounded-lg font-medium text-xs hover:bg-cream-light transition-colors shadow-xs flex items-center gap-1.5"
                title="รีเซ็ตรายการอาหารให้ตรงกับหน้าเว็บจองโต๊ะ 9 รายการ"
              >
                🔄 ซิงค์กับเว็บจองโต๊ะ
              </button>
              <button
                onClick={openAddModal}
                className="bg-terracotta-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-terracotta-700 transition-colors shadow-sm flex items-center gap-2"
              >
                <span>+</span> เพิ่มเมนูอาหารใหม่
              </button>
            </div>
          </div>

          {/* Category Filter Pills (matching public menu) */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
            {MENU_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-terracotta-600 text-white shadow-xs font-semibold"
                    : "bg-white border border-border text-charcoal-DEFAULT hover:bg-cream-light"
                }`}
              >
                {CATEGORY_NAMES_TH[category] || category}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenuItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-border shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="h-48 bg-cream-dark relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1541288039-445e5d32b5ca?q=80&w=800&auto=format&fit=crop";
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold text-charcoal-DEFAULT shadow-xs">
                    {CATEGORY_NAMES_TH[item.category] || item.category}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif text-lg font-bold text-charcoal-DEFAULT">{item.name}</h3>
                    <span className="font-medium text-terracotta-600">${item.price}</span>
                  </div>
                  <p className="text-sm text-muted-foreground flex-1 mb-4 leading-relaxed">{item.description}</p>

                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <button
                      onClick={() => openEditModal(item)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      ✏️ แก้ไข
                    </button>
                    <button
                      onClick={() => handleDeleteMenu(item.id)}
                      className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                    >
                      🗑️ ลบ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== TAB 2: CUSTOMER ORDERS ===================== */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-serif text-2xl text-charcoal-DEFAULT">
                รายการออเดอร์ที่ลูกค้าสั่ง / จองล่วงหน้า
              </h2>
              <p className="text-sm text-muted-foreground">
                สามารถดูรายการอาหารที่ลูกค้าเลือก และกดลบออเดอร์ได้
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex bg-white rounded-lg border border-border p-1 text-xs font-medium">
              <button
                onClick={() => setOrderFilter("all")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  orderFilter === "all"
                    ? "bg-terracotta-600 text-white"
                    : "text-charcoal-DEFAULT hover:bg-cream-light"
                }`}
              >
                ทั้งหมด ({orders.length})
              </button>
              <button
                onClick={() => setOrderFilter("booking")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  orderFilter === "booking"
                    ? "bg-terracotta-600 text-white"
                    : "text-charcoal-DEFAULT hover:bg-cream-light"
                }`}
              >
                🪑 จองโต๊ะพร้อมสั่งอาหาร
              </button>
              <button
                onClick={() => setOrderFilter("online")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  orderFilter === "online"
                    ? "bg-terracotta-600 text-white"
                    : "text-charcoal-DEFAULT hover:bg-cream-light"
                }`}
              >
                🛵 ออเดอร์สั่งกลับบ้าน/ออนไลน์
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-cream-light/60 text-muted-foreground uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4 font-medium">รหัสออเดอร์</th>
                    <th className="px-6 py-4 font-medium">ลูกค้า & การจอง</th>
                    <th className="px-6 py-4 font-medium">รายการอาหารที่สั่ง</th>
                    <th className="px-6 py-4 font-medium">ยอดรวม</th>
                    <th className="px-6 py-4 font-medium">สถานะ</th>
                    <th className="px-6 py-4 font-medium text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        ไม่พบรายการออเดอร์ในหมวดนี้
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-cream-light/30 transition-colors">
                        {/* Order ID */}
                        <td className="px-6 py-4 font-mono font-medium text-charcoal-DEFAULT align-top">
                          <div className="bg-cream-dark px-2.5 py-1 rounded inline-block text-xs font-bold text-terracotta-700">
                            {order.id}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(order.date).toLocaleDateString("th-TH", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </div>
                        </td>

                        {/* Customer & Booking */}
                        <td className="px-6 py-4 align-top">
                          <div className="font-semibold text-charcoal-DEFAULT text-base">
                            {order.customerName}
                          </div>
                          {order.phone && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              📞 {order.phone}
                            </div>
                          )}
                          <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs bg-cream-light text-charcoal-DEFAULT border border-border">
                            {order.type === "booking_preorder" ? "🪑 โต๊ะ / การจอง: " : "🛵 รูปแบบ: "}
                            <span className="font-medium text-terracotta-600">{order.tableOrTime}</span>
                          </div>
                          {order.bookingRef && (
                            <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                              Ref: {order.bookingRef}
                            </div>
                          )}
                          {order.notes && (
                            <div className="mt-1.5 text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded-md">
                              📝 หมายเหตุ: {order.notes}
                            </div>
                          )}
                        </td>

                        {/* Items */}
                        <td className="px-6 py-4 align-top">
                          <div className="bg-cream-light/50 p-3 rounded-lg border border-border/60 space-y-1.5 min-w-[200px]">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs">
                                <span className="font-medium text-charcoal-DEFAULT">
                                  <span className="inline-block w-5 h-5 bg-terracotta-100 text-terracotta-700 rounded-full text-center leading-5 font-bold mr-1.5">
                                    {item.quantity}
                                  </span>
                                  {item.name}
                                </span>
                                <span className="text-muted-foreground font-mono">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Total */}
                        <td className="px-6 py-4 font-semibold text-charcoal-DEFAULT align-top text-base">
                          ${order.total.toFixed(2)}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 align-top">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleOrderStatusChange(order.id, e.target.value as CustomerOrder["status"])
                            }
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer transition-colors shadow-sm outline-none ${getStatusBadge(
                              order.status
                            )}`}
                          >
                            <option value="preparing">⏳ กำลังเตรียม (Preparing)</option>
                            <option value="ready">🍽️ พร้อมเสิร์ฟ (Ready)</option>
                            <option value="delivered">✅ เรียบร้อย (Delivered)</option>
                            <option value="cancelled">❌ ยกเลิก (Cancelled)</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right align-top">
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-200 rounded-md transition-all shadow-sm"
                            title="ลบออเดอร์นี้"
                          >
                            🗑️ ลบออเดอร์
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== ADD / EDIT MODAL ===================== */}
      {isEditing && (
        <div className="fixed inset-0 bg-charcoal-DEFAULT/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 overflow-y-auto max-h-[90vh] border border-border">
            <h2 className="font-serif text-2xl text-charcoal-DEFAULT mb-6">
              {editingItem?.id ? "แก้ไขเมนูอาหาร" : "เพิ่มเมนูอาหารใหม่"}
            </h2>

            <form onSubmit={handleSaveMenu} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-DEFAULT mb-1">
                  ชื่อเมนูอาหาร
                </label>
                <input
                  type="text"
                  required
                  value={editingItem?.name || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="เช่น Al Pastor Tacos"
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-terracotta-500 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-DEFAULT mb-1">
                    หมวดหมู่
                  </label>
                  <select
                    value={editingItem?.category || "Starters"}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        category: e.target.value as MenuItem["category"],
                      })
                    }
                    className="w-full px-3.5 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-terracotta-500 text-sm outline-none"
                  >
                    <option value="Starters">ของว่าง (Starters)</option>
                    <option value="Tacos & Mains">ทาโก้ & จานหลัก (Tacos & Mains)</option>
                    <option value="Sides">เครื่องเคียง (Sides)</option>
                    <option value="Drinks & Desserts">เครื่องดื่ม & ของหวาน (Drinks & Desserts)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-DEFAULT mb-1">
                    ราคา ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={editingItem?.price ?? ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-terracotta-500 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-DEFAULT mb-1">
                  ลิงก์รูปภาพ (Image URL หรือ /images/...)
                </label>
                <input
                  type="text"
                  value={editingItem?.image || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                  placeholder="/images/guacamole.jpg หรือ https://..."
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-terracotta-500 text-sm outline-none"
                />
                {editingItem?.image && (
                  <div className="mt-2 h-28 rounded-lg overflow-hidden border border-border">
                    <img
                      src={editingItem.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-DEFAULT mb-1">
                  คำอธิบายเมนู
                </label>
                <textarea
                  rows={3}
                  value={editingItem?.description || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="รายละเอียดวัตถุดิบและรสชาติ..."
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-terracotta-500 resize-none text-sm outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 border border-border text-charcoal-DEFAULT rounded-lg hover:bg-cream-light transition-colors text-sm font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-terracotta-600 text-white rounded-lg hover:bg-terracotta-700 transition-colors text-sm font-medium shadow-sm"
                >
                  บันทึกเมนู
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
