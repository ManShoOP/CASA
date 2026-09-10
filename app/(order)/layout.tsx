import { OrderNavbar } from "@/components/order/OrderNavbar";
import { CartProvider } from "@/components/providers/CartProvider";

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-[#F9F8F6]">
        <OrderNavbar />
        <main className="flex-1 container py-8">
          {children}
        </main>
      </div>
    </CartProvider>
  );
}
