import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kareixo — The Glass Box IDE",
  description:
    "The AI coding IDE that shows its work and never asks for a credit card. Free multi-model routing, visible agent reasoning, and pre-commit security checks.",
  keywords: [
    "AI IDE",
    "coding assistant",
    "free AI",
    "open source",
    "code editor",
    "transparent AI",
    "glass box",
  ],
  openGraph: {
    title: "Kareixo — The Glass Box IDE",
    description:
      "Free AI coding with full transparency. See every reasoning step, review every diff, pass every security check — before code lands.",
    type: "website",
    siteName: "Kareixo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kareixo — The Glass Box IDE",
    description:
      "The IDE that shows its work — and never asks for a credit card.",
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
      className={`${spaceGrotesk.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
