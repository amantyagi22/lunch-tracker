import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import { LunchProvider } from "./contexts/LunchContext";
import ThemeProvider from "./contexts/ThemeProvider";

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <LunchProvider>{children}</LunchProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
