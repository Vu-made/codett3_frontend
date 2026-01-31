"use client";

import { useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const res = await api.post<{
        success: boolean;
        message: string;
      }>("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        withCredentials: true,
      });

      if (res.data.success) {
        window.location.href = "/";
      } else {
        switch (res.data.message) {
          case "inactive":
            setError("Tài khoản chưa được kích hoạt!");
            break;
          case "banned":
            setError("Tài khoản của bạn đã bị khóa!");
            break;
          case "wrong":
            setError("Sai tên đăng nhập hoặc mật khẩu!");
            break;
          default:
            setError(res.data.message || "Đã xảy ra lỗi khi đăng nhập!");
        }
      }
    } catch {
      setError("Đã xảy ra lỗi khi đăng nhập!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full overflow-auto bg-[#f3f3f3] font-mono">
      <form
        onSubmit={handleLogin}
        className="max-w-sm m-auto p-8 mt-20 bg-white border border-[#ccc]"
      >
        <div className="mb-6 flex items-center gap-3">
          <i className="fas fa-user"></i>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tên đăng nhập"
            className="w-full text-[14px] border-b border-gray-300 focus:outline-none focus:border-[#007acc] transition"
            required
          />
        </div>
        <div className="mb-6 relative flex items-center gap-3">
          <i className="fas fa-lock"></i>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu"
            className="w-full border-b text-[14px] border-gray-300 focus:outline-none focus:border-[#007acc] transition pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#007acc] transition"
          >
            <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
          </button>
        </div>
        {error && (
          <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
        )}
        <div className="flex justify-between items-center">
          <Link
            href="/register"
            className="text-[#007acc] hover:text-[#005a9e] hover:underline transition text-sm"
          >
            Đăng ký
          </Link>
          <button
            type="submit"
            disabled={loading}
            className={`max-w-sm px-2 py-1 text-[14px] rounded-sm border border-black cursor-pointer text-white transition ${
              loading
                ? "bg-[#005a9e] opacity-70 cursor-not-allowed"
                : "bg-[#005a9e] hover:bg-[#005a9e]"
            }`}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập!"}
          </button>
        </div>
      </form>
    </div>
  );
}
