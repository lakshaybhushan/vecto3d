import "@/lib/polyfills";
import type React from "react";
import "@/styles/globals.css";
import { Geist_Mono, Instrument_Serif } from "next/font/google";
import LocalFont from "next/font/local";
import { ThemeProvider } from "@/components/layouts/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mono",
});

const clashGrotesk = LocalFont({
  src: "../public/fonts/ClashGrotesk-Variable.woff2",
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Vecto3d - Convert SVGs to 3D",
  description: "A super simple tool to convert SVG logos to 3D models",
  icons: {
    icon: [
      { media: "(prefers-color-scheme: light)", url: "/logo_light.svg" },
      { media: "(prefers-color-scheme: dark)", url: "/logo_dark.svg" },
    ],
  },
  openGraph: {
    title: "Vecto3d - Convert SVGs to 3D",
    description: "A super simple tool to convert SVG logos to 3D models",
    url: "https://vecto3d.xyz/",
    siteName: "Vecto3d - Convert SVGs to 3D",
    images: [
      {
        url: "/opengraph-image-v1.png",
        width: 1200,
        height: 675,
        alt: "Vecto3d - Convert SVGs to 3D",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vecto3d - Convert SVGs to 3D",
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
      <head>
        {/* <script
          crossOrigin="anonymous"
          src="//unpkg.com/react-scan/dist/auto.global.js"
          defer
        /> */}
        <script
          src="https://cloud.umami.is/script.js"
          defer
          data-website-id="237f1de7-ab04-44dd-a7b4-6b0b819b7991"
        />
      </head>
      <body
        className={cn(
          clashGrotesk.className,
          instrumentSerif.variable,
          geistMono.variable,
          "overflow-x-hidden",
        )}
        suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          {children}
          <Analytics />
          <Toaster position="top-center" theme="system" />
        </ThemeProvider>
      </body>
    </html>
  );
}
