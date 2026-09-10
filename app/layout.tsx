import type { Metadata } from "next";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "./globals.css";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { getLocale } from "@/lib/i18n/actions";

export const metadata: Metadata = {
  title: "CASA SOL | Mexican Restaurant & Bar",
  description: "Experience authentic Mexican cuisine with a modern twist at CASA SOL.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body className="font-sans">
        <I18nProvider locale={locale}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
