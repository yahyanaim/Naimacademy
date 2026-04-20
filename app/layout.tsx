import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { StoreProvider } from "@/components/providers/store-provider";
import { SupportChat } from "@/components/course/support-chat";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Naim Academy - Master AI & Automation",
  description: "Learn practical tech skills. Not theory. Real working projects. Skills that generate income.",
  metadataBase: new URL("https://naimacademy.com"),
  openGraph: {
    title: "Naim Academy - Master AI & Automation",
    description: "Not theory. Real working projects. Skills that generate income. Learn by building, not watching.",
    url: "https://naimacademy.com",
    siteName: "Naim Academy",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Naim Academy - Master AI & Automation",
    description: "Not theory. Real working projects. Skills that generate income.",
  },
  robots: {
    index: true,
    follow: true,
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
      className={`${inter.variable} h-full antialiased`}
    >
      <body className={`min-h-full flex flex-col font-sans`}>
        <StoreProvider>
          {children}
          <Toaster />
          <SupportChat />
        </StoreProvider>
      </body>
    </html>
  );
}
