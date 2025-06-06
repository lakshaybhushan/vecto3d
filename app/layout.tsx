import type React from "react";
import "@/styles/globals.css";
import { Geist_Mono, Instrument_Serif } from "next/font/google";
import LocalFont from "next/font/local";
import { ThemeProvider } from "@/components/layouts/theme-provider";
import { Toaster as SonnerToaster } from "sonner";
import Script from "next/script";
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <meta property="og:image" content="/opengraph-image.png" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="675" />
      <meta
        property="og:site_name"
        content="Vecto3d | Transform Your Vectors in a New Dimension"
      />
      <meta property="og:url" content="https://vecto3d.xyz/" />
      <meta name="twitter:image" content="/twitter-image.png" />
      <meta name="twitter:image:type" content="image/png" />
      <meta name="twitter:image:width" content="1200" />
      <meta name="twitter:image:height" content="675" />
      <Script
        src="https://cloud.umami.is/script.js"
        defer
        data-website-id="237f1de7-ab04-44dd-a7b4-6b0b819b7991"
      />
      <body
        className={cn(
          clashGrotesk.className,
          instrumentSerif.variable,
          geistMono.variable,
        )}
        suppressHydrationWarning>
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
