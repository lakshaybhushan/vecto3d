import type React from "react";
import "@/styles/globals.css";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster as SonnerToaster } from "sonner";
import Script from "next/script";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
});
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = {
  title: "Vecto3d | Transform Your Vectors in a New Dimension",
  description: "A super simple tool to convert SVG logos to 3D models",
  icons: {
    icon: [
      { media: "(prefers-color-scheme: light)", url: "/logo_light.svg" },
      { media: "(prefers-color-scheme: dark)", url: "/logo_dark.svg" },
    ],
  },
  openGraph: {
    title: "Vecto3d | Transform Your Vectors in a New Dimension",
    description: "A super simple tool to convert SVG logos to 3D models",
    url: "https://vecto3d.xyz/",
    siteName: "Vecto3d | Transform Your Vectors in a New Dimension",
    images: [
      {
        url: "/opengraph-image-v1.png",
        width: 1200,
        height: 675,
        alt: "Vecto3d - Transform Your Vectors in a New Dimension",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vecto3d | Transform Your Vectors in a New Dimension",
    description: "A super simple tool to convert SVG logos to 3D models",
    images: ["/twitter-image-v1.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Script
        src="https://cloud.umami.is/script.js"
        defer
        data-website-id="237f1de7-ab04-44dd-a7b4-6b0b819b7991"
      />
      <body className={cn(instrumentSans.className, instrumentSerif.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          {children}
          <Analytics />
          <SonnerToaster
            position="top-center"
            richColors
            closeButton
            theme="system"
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
