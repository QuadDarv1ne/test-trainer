import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { translations } from "@/lib/translations";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: translations.ru.layout_title,
  description: translations.ru.layout_description,
  keywords: [translations.ru.topic_ec, translations.ru.topic_bv, "тест-кейсы", "программное обеспечение"],
  authors: [{ name: translations.ru.header_title }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: translations.ru.layout_og_title,
    description: translations.ru.layout_og_description,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
