"use client";

import { useProfile } from "@/hooks/useProfile";
import { SocketProvider } from "@/contexts/SocketContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function MainContent({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useProfile();
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);

  if (loading) {
    return (
      <main className="h-full overflow-auto flex items-center justify-center p-4">
        <div className="text-gray-500">Đang tải...</div>
      </main>
    );
  }

  return (
    <SocketProvider token={profile?.ws_token}>
      <div className="flex flex-col h-full w-full">
        <Header />

        {isMobile && (
          <div className="bg-yellow-100 text-yellow-900 text-center py-2 text-sm">
            ⚠️ Ứng dụng này được tối ưu cho máy tính — bạn đang dùng điện thoại.
          </div>
        )}

        <div className="h-full overflow-auto">
          {children}
        </div>

        <Footer />
      </div>
    </SocketProvider>
  );
}
