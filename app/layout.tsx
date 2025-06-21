// File: app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

// --- SEO METADATA IN ENGLISH ---
export const metadata: Metadata = {
  title: {
    default: "Minimal Icons - Free SVG icons for popular brands",
    template: "%s | Minimal Icons",
  },
  description: "Over 3300+ SVG icons for popular brands, easy to search, copy, and download.",
  keywords: ["simple icons", "minimal icons", "svg icons", "free icons", "brand logos", "vector icons", "logo svg", "facebook logo svg", "tiktok logo svg", "youtube logo svg", "google logo svg"],
  openGraph: {
    title: "Minimal Icons - Free SVG icons for popular brands",
    description: "A collection of over 3300+ free SVG icons for popular brands.",
    url: "https://www.minimalicons.store/",
    siteName: "Minimal Icons",
    images: [
      {
        url: "https://www.minimalicons.store/icon.png", // <<<< REPLACE WITH YOUR PREVIEW IMAGE LINK
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US", // Changed to English (US)
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Minimal Icons - Free SVG icons for popular brands",
    description: "A collection of over 3300+ free SVG icons for popular brands.",
    images: ["https://www.minimalicons.store/icon.png"], // <<<< REPLACE WITH YOUR PREVIEW IMAGE LINK
  },
};
// ------------------------------------

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // --- CHANGE LANGUAGE TO ENGLISH ---
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-K6LWGW9X');
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-K6LWGW9X"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}