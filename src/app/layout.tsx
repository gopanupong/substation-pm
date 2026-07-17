import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth/context";
import { I18nProvider } from "@/i18n/context";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ระบบติดตามงานก่อสร้างสถานีไฟฟ้า | Substation PM",
  description: "ระบบจัดการโปรเจกต์ ติดตามความคืบหน้า และรายงานผลงานก่อสร้างสถานีไฟฟ้าย่อย",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <I18nProvider>
              {children}
              <Toaster position="top-right" richColors closeButton />
            </I18nProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
