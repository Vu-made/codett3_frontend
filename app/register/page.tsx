"use client";

import { useState } from "react";
import api from "@/lib/api";
import { AxiosError } from "axios";
import Link from "next/link";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự.";
    if (!/[a-z]/.test(pwd)) return "Mật khẩu phải chứa ít nhất một chữ thường.";
    if (!/[A-Z]/.test(pwd)) return "Mật khẩu phải chứa ít nhất một chữ hoa.";
    if (!/[0-9]/.test(pwd)) return "Mật khẩu phải chứa ít nhất một chữ số.";
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(pwd))
      return "Mật khẩu phải chứa ít nhất một ký tự đặc biệt.";
    return null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    try {
      await api.post("/auth/register", {
        username,
        email,
        password,
      });

      setSuccess("Đăng ký thành công! Bạn có thể đăng nhập ngay.");
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      const axiosError = err as AxiosError<{ detail?: string }>;
      if (axiosError.response?.data?.detail) {
        setError(axiosError.response.data.detail);
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full overflow-auto bg-[#f3f3f3] font-mono">
      <form
        onSubmit={handleRegister}
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

        <div className="mb-6 flex items-center gap-3">
          <i className="fas fa-envelope"></i>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
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
        {success && (
          <p className="text-green-600 text-sm mb-4 text-center">{success}</p>
        )}

        <div className="flex justify-between items-center">
          <Link
            href="/login"
            className="text-[#007acc] hover:text-[#005a9e] hover:underline transition text-sm"
          >
            Đăng nhập
          </Link>
          <button
            type="submit"
            disabled={loading}
            className={`px-2 py-1 text-[14px] rounded-sm border border-black cursor-pointer text-white transition ${
              loading
                ? "bg-[#005a9e] opacity-70 cursor-not-allowed"
                : "bg-[#005a9e] hover:bg-[#007acc]"
            }`}
          >
            {loading ? "Đang đăng ký..." : "Đăng ký!"}
          </button>
        </div>
      </form>
    </div>
  );
}
