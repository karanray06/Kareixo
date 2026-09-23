import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#F7F7F5",
};

export const metadata: Metadata = {
  title: "Kareixo — Free AI Code Review",
  description:
    "Free AI code review for every pull request. No credit card required.",
  openGraph: {
    title: "Kareixo — Free AI Code Review",
    description: "Free AI code review for every pull request.",
    type: "website",
    siteName: "Kareixo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kareixo — Free AI Code Review",
    description: "Free AI code review for every pull request.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased min-h-screen bg-canvas-default text-fg-default">{children}</body>
    </html>
  );
}
