import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import { LunchProvider } from "./contexts/LunchContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lunch Tracker",
  description: "Track daily lunch preferences for your team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <LunchProvider>{children}</LunchProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
