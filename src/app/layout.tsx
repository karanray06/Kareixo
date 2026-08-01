import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
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
  themeColor: "#606887",
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
      className={`${instrumentSerif.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
