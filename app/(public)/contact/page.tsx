"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useI18n } from "@/components/providers/I18nProvider";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { dict } = useI18n();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream-light">
      <Navbar />
      
      <main className="flex-1">
        <section className="py-20 md:py-24">
          <div className="container max-w-6xl">
            <div className="text-center mb-16">
              <span className="text-terracotta-400 font-medium tracking-[0.2em] uppercase text-sm mb-4 block">
                {dict.contactPage.subtitle}
              </span>
              <h1 className="font-serif text-5xl md:text-6xl text-charcoal-DEFAULT mb-6">
                {dict.contactPage.title}
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {dict.contactPage.description}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              
              {/* Contact Information & Map Area */}
              <div className="space-y-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-serif text-xl text-charcoal-DEFAULT mb-4">{dict.contactPage.location}</h3>
                    <address className="not-italic text-muted-foreground space-y-1">
                      <p>123 Culinary Avenue</p>
                      <p>Food District, NY 10001</p>
                    </address>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-charcoal-DEFAULT mb-4">{dict.contactPage.hours}</h3>
                    <div className="text-muted-foreground space-y-1">
                      <p>{dict.contactPage.weekdays}</p>
                      <p>{dict.contactPage.weekends}</p>
                      <p>{dict.contactPage.sunday}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-charcoal-DEFAULT mb-4">{dict.contactPage.contact}</h3>
                    <div className="text-muted-foreground space-y-1">
                      <p>Phone: +1 (555) 123-4567</p>
                      <p>Email: hello@casasol.com</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-charcoal-DEFAULT mb-4">{dict.contactPage.followUs}</h3>
                    <div className="text-muted-foreground space-y-1">
                      <a href="#" className="block hover:text-terracotta-600 transition-colors">Instagram</a>
                      <a href="#" className="block hover:text-terracotta-600 transition-colors">Facebook</a>
                    </div>
                  </div>
                </div>

                {/* Decorative Map Placeholder */}
                <div className="w-full h-[300px] bg-cream-dark rounded-xl overflow-hidden border border-border relative">
                  <div 
                    className="absolute inset-0 opacity-50 bg-cover bg-center"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop")' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-md shadow-sm border border-border font-medium text-charcoal-DEFAULT text-sm flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-terracotta-600"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      View on Google Maps
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-border">
                {isSuccess ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-500 py-12">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                    <h3 className="font-serif text-2xl text-charcoal-DEFAULT">{dict.contactPage.form.successTitle}</h3>
                    <p className="text-muted-foreground">{dict.contactPage.form.successDesc}</p>
                    <button 
                      onClick={() => setIsSuccess(false)}
                      className="mt-6 text-sm font-medium text-terracotta-600 hover:text-terracotta-700 underline underline-offset-4"
                    >
                      {dict.contactPage.form.sendAnother}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <h3 className="font-serif text-2xl text-charcoal-DEFAULT mb-6">{dict.contactPage.form.title}</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="text-sm font-medium text-charcoal-DEFAULT">{dict.contactPage.form.firstName}</label>
                        <input id="firstName" required type="text" className="w-full h-12 rounded-md border border-border px-3 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="text-sm font-medium text-charcoal-DEFAULT">{dict.contactPage.form.lastName}</label>
                        <input id="lastName" required type="text" className="w-full h-12 rounded-md border border-border px-3 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-charcoal-DEFAULT">{dict.contactPage.form.email}</label>
                      <input id="email" required type="email" className="w-full h-12 rounded-md border border-border px-3 focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium text-charcoal-DEFAULT">{dict.contactPage.form.subject}</label>
                      <select id="subject" className="w-full h-12 rounded-md border border-border bg-white px-3 focus:outline-none focus:ring-2 focus:ring-terracotta-500">
                        <option>General Inquiry</option>
                        <option>Private Events & Catering</option>
                        <option>Feedback</option>
                        <option>Careers</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-charcoal-DEFAULT">{dict.contactPage.form.message}</label>
                      <textarea 
                        id="message" 
                        required 
                        className="w-full rounded-md border border-border px-3 py-3 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-terracotta-500 resize-y" 
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 rounded-md bg-charcoal-DEFAULT text-white font-medium hover:bg-charcoal-light disabled:opacity-70 transition-colors flex items-center justify-center"
                    >
                      {isSubmitting ? dict.contactPage.form.sending : dict.contactPage.form.submit}
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
