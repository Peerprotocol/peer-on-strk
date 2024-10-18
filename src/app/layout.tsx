import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DarkModeProvider } from "../components/LandingPage/DarkMode";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Peer Protocol",
  description: "Peer Protocol is a decentralized, peer-to-peer lending and borrowing solution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <DarkModeProvider>
          <body className={inter.className}>{children}</body>
        </DarkModeProvider>
    </html>
  );
}
