import type { Metadata } from "next";
import { Anton_SC, Instrument_Sans } from "next/font/google";
import "./globals.css";

const anton = Anton_SC({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-anton",
  display: "swap",
});

const instrument_sans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ethereal Techno — Curated Sound Library & Producer Circle",
    template: "%s | Ethereal Techno",
  },
  description:
    "A curated sound library and creative circle for producers and listeners who value depth, emotion, and artistic identity. Access premium samples, construction kits, and join verified producers.",
  keywords: [
    "ethereal techno",
    "techno samples",
    "sample packs",
    "construction kits",
    "melodic techno",
    "producer community",
    "sound library",
    "music production",
  ],
  authors: [{ name: "Ethereal Techno" }],
  creator: "Ethereal Techno",
  metadataBase: new URL("https://etherealtechno.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Ethereal Techno",
    title: "Ethereal Techno — Curated Sound Library & Producer Circle",
    description:
      "A curated sound library and creative circle for producers and listeners who value depth, emotion, and artistic identity.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ethereal Techno — Curated Sound Library & Producer Circle",
    description:
      "A curated sound library and creative circle for producers and listeners who value depth, emotion, and artistic identity.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
import Navbar from "@/app/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${anton.variable} ${instrument_sans.variable} antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
