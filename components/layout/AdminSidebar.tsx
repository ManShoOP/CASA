import Link from "next/link";
import { usePathname } from "next/navigation";

const adminNav = [
  { name: "แดชบอร์ด", href: "/admin/dashboard", icon: "📊" },
  { name: "รายการจองโต๊ะ", href: "/admin/reservations", icon: "📅" },
  { name: "จัดการโต๊ะ", href: "/admin/tables", icon: "🪑" },
  { name: "จัดการเมนูอาหาร", href: "/admin/menu", icon: "🍔" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-charcoal-DEFAULT text-cream-light flex-shrink-0 min-h-screen border-r border-charcoal-light flex flex-col">
      <div className="h-20 flex items-center px-6 border-b border-charcoal-light">
        <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-terracotta-500">
          CASA SOL
          <span className="text-xs uppercase tracking-widest text-cream-dark/60 block font-sans">ระบบแอดมิน</span>
        </Link>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-1">
        {adminNav.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${
                isActive 
                  ? "bg-terracotta-600/20 text-terracotta-400 font-semibold" 
                  : "text-cream-dark/80 hover:bg-charcoal-light hover:text-cream-light"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-charcoal-light">
        <div className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-charcoal-light cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-cream-dark flex items-center justify-center text-charcoal-DEFAULT font-bold text-sm">
            แอดมิน
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-cream-light truncate">ผู้ดูแลระบบ</p>
            <p className="text-xs text-cream-dark/60 truncate">admin@casasol.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
