import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Moon Agent",
  description: "Foundational Next.js app with Tailwind, Shadcn UI, and Supabase"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gradient-to-br from-[#FFF5F7] to-[#FAF5FF] overflow-x-hidden`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

