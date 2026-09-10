"use client";

import { useState, useEffect } from "react";

type Table = {
  id: string;
  name: string;
  capacity: number;
  status: "available" | "occupied" | "reserved";
};

const INITIAL_TABLES: Table[] = [
  { id: "t1", name: "โต๊ะ 1", capacity: 2, status: "available" },
  { id: "t2", name: "โต๊ะ 2", capacity: 2, status: "occupied" },
  { id: "t3", name: "โต๊ะ 3", capacity: 4, status: "reserved" },
  { id: "t4", name: "โต๊ะ 4", capacity: 4, status: "available" },
  { id: "t5", name: "โต๊ะ 5", capacity: 6, status: "available" },
  { id: "t6", name: "โต๊ะ 6", capacity: 2, status: "available" },
  { id: "t7", name: "โต๊ะ 7", capacity: 8, status: "reserved" },
  { id: "t8", name: "โต๊ะ 8", capacity: 4, status: "occupied" },
];

export default function AdminTablesPage() {
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("casasol_tables");
    if (saved) {
      try {
        setTables(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("casasol_tables", JSON.stringify(tables));
    }
  }, [tables, isMounted]);

  const handleStatusChange = (id: string, newStatus: Table["status"]) => {
    setTables(tables.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const statusColors = {
    available: "bg-green-50 text-green-800 border-green-200",
    occupied: "bg-red-50 text-red-800 border-red-200",
    reserved: "bg-amber-50 text-amber-800 border-amber-200",
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl text-charcoal-DEFAULT">ผังโต๊ะและการจัดการสถานะ</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ดูสถานะโต๊ะในร้านแบบเรียลไทม์ และปรับสถานะโต๊ะว่าง/ไม่ว่าง
          </p>
        </div>
        <div className="flex gap-4 bg-white p-2 rounded-lg border border-border shadow-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-charcoal-DEFAULT px-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span> โต๊ะว่าง (Available)
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-charcoal-DEFAULT px-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span> จองแล้ว (Reserved)
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-charcoal-DEFAULT px-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span> มีลูกค้านั่ง (Occupied)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tables.map(table => (
          <div 
            key={table.id} 
            className={`flex flex-col p-6 rounded-xl border-2 transition-all shadow-sm hover:shadow-md ${statusColors[table.status]}`}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-serif text-2xl font-bold">{table.name}</h3>
              <div className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-white/80 font-medium text-sm shadow-xs border border-border/50" title="ที่นั่ง">
                <span className="text-[10px] text-muted-foreground leading-none mb-0.5">ที่นั่ง</span>
                <span className="font-bold text-charcoal-DEFAULT">{table.capacity}</span>
              </div>
            </div>
            
            <div className="mt-auto pt-4 space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wider opacity-75">สถานะปัจจุบัน</p>
              <select 
                value={table.status}
                onChange={(e) => handleStatusChange(table.id, e.target.value as Table["status"])}
                className="w-full text-sm font-medium rounded-lg bg-white border border-border/80 py-2 px-3 text-charcoal-DEFAULT focus:ring-2 focus:ring-terracotta-500 shadow-xs cursor-pointer transition-colors outline-none"
              >
                <option value="available">🟢 โต๊ะว่าง (Available)</option>
                <option value="reserved">🟠 จองแล้ว (Reserved)</option>
                <option value="occupied">🔴 มีลูกค้านั่ง (Occupied)</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
