import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DarkModeProvider } from "../components/LandingPage/DarkMode";
import { StarknetProvider } from "@/components/StarknetProvider";
import { ToastContainer } from 'react-toastify'
import { Toaster } from 'react-hot-toast';
import { Analytics } from "@vercel/analytics/react";
import 'react-toastify/dist/ReactToastify.css'

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
      <StarknetProvider>
        <DarkModeProvider>
          <Analytics />
          <body className={inter.className}>
            {children}
            <ToastContainer />
            <Toaster />
          </body>
        </DarkModeProvider>
      </StarknetProvider>
    </html>
  );
}