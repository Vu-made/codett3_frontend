"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import api from "@/lib/api";

export default function ContestInfoPage() {
  const { id_contest } = useParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingBackground, setLoadingBackground] = useState(true);
  const [joined, setJoined] = useState(false);
  const router = useRouter();

  async function handleJoin() {
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/contest/auth/join", {
        id_contest,
        password,
      });

      if (res.data?.success) {
        setJoined(true);
        setTimeout(() => router.push(`/contests/gui/`), 1000);
      } else {
        throw new Error(res.data?.message || "Không thể tham gia kỳ thi");
      }
    }finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const checkJoined = async () => {
      let redirected = false;
      try {
        const res = await api.get(`/contest/auth/is_joined/${id_contest}`);
        if (res.data?.is_joined) {
          redirected = true;
          router.push(`/contests/gui/`);
        }
      } catch (err) {
        console.error("Check join failed:", err);
      } finally {
        if (!redirected) {
          setLoadingBackground(false);
        }
      }
    };

    void checkJoined();
  }, [id_contest, router]);



  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleJoin();
    }
  };


  if (loadingBackground) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 font-mono bg-white">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-3"></div>
        <p className="text-sm">Đang kiểm tra trạng thái tham gia...</p>
      </div>
    );
  }

  if (joined) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-[#e5e5e5] shadow-sm">
          <div className="border-b border-[#e5e5e5] bg-[#f8f8f8] px-6 py-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#059669]" />
              <h2 className="text-base font-semibold text-[#1e1e1e]">
                Tham gia thành công
              </h2>
            </div>
          </div>
          <div className="px-6 py-8 space-y-4">
            <div className="bg-[#e7f3ef] border border-[#059669]/20 px-4 py-3">
              <p className="text-sm text-[#1e1e1e] leading-relaxed">
                Chào mừng bạn đến với kỳ thi. Chuẩn bị sẵn sàng nhé!
              </p>
            </div>
            <p className="text-xs text-[#6b6b6b]">
              Hệ thống sẽ chuyển bạn đến trang thông tin ngay...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#e5e5e5] shadow-sm">
        <div className="border-b border-[#e5e5e5] bg-[#f8f8f8] px-6 py-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-[#007acc]" />
            <h2 className="text-base font-semibold text-[#1e1e1e]">
              Tham gia kỳ thi
            </h2>
          </div>
        </div>

        <div className="px-6 py-8 space-y-6">
          <div className="bg-[#e8f4fd] border border-[#007acc]/20 px-4 py-3">
            <p className="text-xs text-[#1e1e1e]">
              Nhập mật khẩu để tiếp tục. Nếu kỳ thi không yêu cầu mật khẩu, hãy để trống.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="contest-password"
              className="block text-xs font-medium text-[#1e1e1e] uppercase tracking-wide"
            >
              Mật khẩu
            </label>
            <input
              id="contest-password"
              type="password"
              value={password}
              placeholder="Nhập mật khẩu kỳ thi"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
              className="w-full border border-[#cecece] bg-white px-3 py-2.5 text-sm text-[#1e1e1e]
                placeholder:text-[#999999] focus:outline-none focus:border-[#007acc]
                focus:ring-1 focus:ring-[#007acc] disabled:bg-[#f3f3f3]
                disabled:text-[#999999] disabled:cursor-not-allowed transition-colors"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="bg-[#fef2f2] border border-[#dc2626]/20 px-4 py-3 flex items-start gap-3"
            >
              <AlertCircle className="w-4 h-4 text-[#dc2626] shrink-0 mt-0.5" />
              <p className="text-xs text-[#1e1e1e] leading-relaxed">{error}</p>
            </div>
          )}

          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full bg-[#007acc] text-white text-sm font-medium py-2.5 px-4
              hover:bg-[#005a9e] active:bg-[#004578] focus:outline-none
              focus:ring-2 focus:ring-[#007acc] focus:ring-offset-2 disabled:bg-[#cecece]
              disabled:text-[#999999] disabled:cursor-not-allowed transition-colors
              flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? "Đang xử lý..." : "Tham gia ngay"}</span>
          </button>
        </div>

        <div className="border-t border-[#e5e5e5] bg-[#f8f8f8] px-6 py-3">
          <p className="text-xs text-[#6b6b6b]">
            Bằng việc tham gia, bạn đồng ý tuân thủ quy định của kỳ thi.
          </p>
        </div>
      </div>
    </div>
  );
}
