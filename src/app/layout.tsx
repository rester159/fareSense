import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://faresense-production.up.railway.app";

export const metadata: Metadata = {
  title: {
    default: "FareSense — Know Before You Book",
    template: "%s | FareSense",
  },
  description:
    "Flight fare predictions that help you decide when to buy and when to wait. Analyze pricing trends, seasonality, and route competition to find the best deals.",
  keywords: [
    "flight fare prediction",
    "cheap flights",
    "when to buy flights",
    "airfare deals",
    "flight price tracker",
    "fare comparison",
    "buy or wait flights",
  ],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "FareSense",
    title: "FareSense — Know Before You Book",
    description:
      "Flight fare predictions that help you decide when to buy and when to wait.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FareSense — Flight Fare Predictions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FareSense — Know Before You Book",
    description:
      "Flight fare predictions that help you decide when to buy and when to wait.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A0F1C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {plausibleDomain && (
          <script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "FareSense",
              url: siteUrl,
              description:
                "Flight fare predictions that help you decide when to buy and when to wait.",
              potentialAction: {
                "@type": "SearchAction",
                target: `${siteUrl}/results?origin={origin}&destination={destination}`,
                "query-input":
                  "required name=origin required name=destination",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-dvh overflow-x-hidden">{children}</body>
    </html>
  );
}
