import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-charcoal-DEFAULT text-cream-light py-16">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/" className="font-serif text-3xl font-bold tracking-tight text-terracotta-500 block">
              CASA SOL
            </Link>
            <Link 
              href="/admin/dashboard" 
              target="_blank"
              className="text-xs font-medium text-cream-dark/50 hover:text-terracotta-400 border border-cream-dark/30 hover:border-terracotta-400 px-3 py-1 rounded-full transition-colors"
            >
              Admin
            </Link>
          </div>
          <p className="text-cream-dark/80 max-w-sm mb-6">
            Authentic Mexican flavors, crafted with passion. Experience the warmth of modern Mexican cuisine in every bite.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-cream-dark hover:text-terracotta-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </Link>
            <Link href="#" className="text-cream-dark hover:text-terracotta-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </Link>
          </div>
        </div>
        
        <div>
          <h4 className="font-serif text-lg mb-4 text-white">Explore</h4>
          <ul className="space-y-3 text-sm text-cream-dark/80">
            <li><Link href="/menu" className="hover:text-terracotta-400 transition-colors">Our Menu</Link></li>
            <li><Link href="/reserve" className="hover:text-terracotta-400 transition-colors">Reserve a Table</Link></li>
            <li><Link href="/about" className="hover:text-terracotta-400 transition-colors">Our Story</Link></li>
            <li><Link href="/contact" className="hover:text-terracotta-400 transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-4 text-white">Visit Us</h4>
          <ul className="space-y-3 text-sm text-cream-dark/80">
            <li>123 Culinary Avenue</li>
            <li>Food District, NY 10001</li>
            <li className="pt-4 text-white">Open Daily</li>
            <li>11:00 AM – 10:00 PM</li>
          </ul>
        </div>
      </div>
      <div className="container mt-16 pt-8 border-t border-cream-dark/20 text-sm text-cream-dark/60 flex flex-col md:flex-row justify-between items-center">
        <p>© 2026 CASA SOL. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Link href="/privacy-policy" className="hover:text-cream-light">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-cream-light">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
