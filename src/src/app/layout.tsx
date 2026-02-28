import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TopBar, Header, Footer } from "@/components/layout";
import { OrganizationJsonLd } from "@/components/seo";
import { AnalyticsProviders } from "@/components/analytics/AnalyticsProviders";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["cyrillic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DanMax — Вывоз строительных отходов в Москве",
    template: "%s | DanMax",
  },
  description: "Вывоз и утилизация грунта, бетона, кирпича, асфальта в Москве и МО",
  metadataBase: new URL("https://danmax.moscow"),
  openGraph: {
    locale: "ru_RU",
    type: "website",
    siteName: "DanMax",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <OrganizationJsonLd />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {/* Аналитика */}
        <AnalyticsProviders
          yandexId={process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID}
          gaId={process.env.NEXT_PUBLIC_GA_ID}
        />

        <TopBar promoText="Скидка 10% на первый вывоз!" />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
