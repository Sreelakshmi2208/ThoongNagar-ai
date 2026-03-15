import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import ThoongaAssistant from "@/components/ThoongaAssistant";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ThoongaNagaram AI",
  description: "AI That Never Sleeps for a Cleaner Madurai.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased text-white min-h-screen flex flex-col`}>
        <AuthProvider>
          {children}
          <ThoongaAssistant />
        </AuthProvider>
      </body>
    </html>
  );
}
