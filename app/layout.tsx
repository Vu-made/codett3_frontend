import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TooltipProvider } from "@/components/ui/base-tooltip";
import { headers } from "next/headers";
import { Toaster } from "sonner";
import PageTransition from "@/components/PageTransitionRootLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeTT3",
  description: "Tiếp nối và Phát Triển",
  icons: {
    icon: "/favicon/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/manifest.json",
  themeColor: "#ffffff",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const ua = headersList.get("user-agent") || "";
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);

  return (
    <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TooltipProvider delay={300}>
          <div className="flex flex-col h-full w-full">
            <Header />

            {isMobile && (
              <div className="bg-yellow-100 text-yellow-900 text-center py-2 text-sm">
                ⚠️ Ứng dụng này được tối ưu cho máy tính — bạn đang dùng điện thoại.
              </div>
            )}
            <div className="h-full overflow-auto"> 
              <PageTransition>
                {children}
              </PageTransition>
            </div>
            <Footer />
          </div>
        </TooltipProvider>
        <Toaster /> 
      </body>
    </html>
  );
}
