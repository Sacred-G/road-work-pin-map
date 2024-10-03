import type { Metadata } from "next";
import "@mantine/core/styles.css";
import { ColorSchemeScript } from "@mantine/core";
import Script from "next/script";
import ClientProviders from "./ClientProviders";

export const metadata: Metadata = {
  title: "Pin-Map",
  description: "Pin any location!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Pin-Map</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <ColorSchemeScript />
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}