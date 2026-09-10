import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-cream-light">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-charcoal-DEFAULT">
          <div 
            className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2000&auto=format&fit=crop")' }}
          />
          <div className="container relative z-10 text-center px-4">
            <span className="text-terracotta-400 font-medium tracking-[0.2em] uppercase text-sm mb-4 block">
              Our Heritage
            </span>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-cream-light mb-6">
              The Story of CASA SOL
            </h1>
          </div>
        </section>

        {/* Story Content */}
        <section className="py-20 md:py-32">
          <div className="container max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              
              <div className="order-2 md:order-1 space-y-6">
                <h2 className="font-serif text-3xl md:text-4xl text-charcoal-DEFAULT mb-6">
                  Rooted in Tradition, Crafted for Today.
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  CASA SOL began with a simple belief: that the dining table is the heart of every home. Growing up in Oaxaca, our founders learned that cooking is not just about sustenance; it's a language of love, celebration, and connection.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  We brought those cherished family recipes to the city, blending authentic Mexican culinary traditions with a modern, earthy sensibility. Every dish we serve is a tribute to the vibrant street markets, sun-drenched agaves, and warm hospitality of our heritage.
                </p>
                <div className="pt-8">
                  <h3 className="font-serif text-xl text-charcoal-DEFAULT mb-2">Our Philosophy</h3>
                  <p className="text-muted-foreground">
                    Fresh ingredients, slow-cooked meats, handmade tortillas daily, and a commitment to sustainable, local sourcing whenever possible.
                  </p>
                </div>
              </div>

              <div className="order-1 md:order-2">
                <div className="relative h-[600px] w-full rounded-tl-[100px] rounded-br-[100px] overflow-hidden bg-cream-dark">
                  <img 
                    src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1000&auto=format&fit=crop" 
                    alt="Chef preparing fresh tortillas"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Gallery / Vibe */}
        <section className="py-20 bg-cream-DEFAULT">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl md:text-4xl text-charcoal-DEFAULT mb-4">
                The Space
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Designed to reflect the warmth of a Mexican sunset, our interior blends terracotta hues, natural woods, and lush greenery to create an approachable, elegant atmosphere.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-80 bg-cream-dark overflow-hidden group">
                <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop" alt="Restaurant Interior" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="h-80 bg-cream-dark overflow-hidden group md:mt-12">
                <img src="https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?q=80&w=800&auto=format&fit=crop" alt="Cocktail Bar" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="h-80 bg-cream-dark overflow-hidden group">
                <img src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?q=80&w=800&auto=format&fit=crop" alt="Culinary Details" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 text-center">
          <div className="container max-w-2xl">
            <h2 className="font-serif text-4xl text-charcoal-DEFAULT mb-6">Come Join Our Family</h2>
            <p className="text-muted-foreground text-lg mb-10">
              Whether it's a casual Tuesday dinner, an anniversary, or drinks with friends, we have a table waiting for you.
            </p>
            <Link 
              href="/reserve" 
              className="inline-flex h-14 items-center justify-center rounded-md bg-terracotta-600 px-10 text-base font-medium text-white shadow transition-colors hover:bg-terracotta-700"
            >
              Reserve Your Table
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
