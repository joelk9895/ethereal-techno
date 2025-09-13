import type { Metadata } from "next";
import { Anton_SC, Instrument_Sans } from "next/font/google";
import "./globals.css";

const anton = Anton_SC({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-anton",
});

const instrument_sans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ethereal Techno",
  description:
    "A sample library for cinematic and ethereal techno music production.",
};

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
        {children}
      </body>
    </html>
  );
}
