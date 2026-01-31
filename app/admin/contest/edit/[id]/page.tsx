"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import MarkdownEditor from "@/components/MarkdownEditor";
import api from "@/lib/api";
import clsx from "clsx";
import { toast } from "sonner";

export default function EditContest() {
  const router = useRouter();
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [password, setPassword] = useState("");
  const [realtimeRank, setRealtimeRank] = useState(true);
  const [status, setStatus] = useState(false);
  const [timeMode, setTimeMode] = useState<"unlimited" | "fixed">("unlimited");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const res = await api.get(`/admin/contests/${id}`);
        const data = res.data;
        setTitle(data.title || "");
        setDescription(data.description || "");
        setStartTime(data.start_time ? data.start_time.slice(0, 16) : "");
        setEndTime(data.end_time ? data.end_time.slice(0, 16) : "");
        setPassword(data.password || "");
        setRealtimeRank(data.realtime_rank);
        setStatus(data.status);
        setTimeMode(data.time_mode || "unlimited");
      } catch {
        setMessage("Không thể tải dữ liệu kỳ thi!");
      } finally {
        setLoading(false);
      }
    };
    fetchContest();
  }, [id]);

  const validate = useMemo(() => {
    const errs: string[] = [];
    if (!title.trim()) errs.push("Vui lòng nhập tiêu đề");
    if (!description.trim()) errs.push("Vui lòng nhập mô tả");
    if (timeMode === "fixed") {
      if (!startTime) errs.push("Chưa chọn thời gian bắt đầu");
      if (!endTime) errs.push("Chưa chọn thời gian kết thúc");
      if (startTime && endTime && new Date(startTime) >= new Date(endTime))
        errs.push("Thời gian kết thúc phải sau thời gian bắt đầu");
    }
    setErrors(errs);
    return errs;
  }, [title, description, startTime, endTime, timeMode]);

  const handleSave = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (validate.length > 0) {
        toast.error("⚠️ Không thể lưu vì có lỗi trong biểu mẫu!", { position: "top-center" });
        return;
      }

      const payload = {
        title,
        description,
        time_mode: timeMode,
        start_time: timeMode === "unlimited" ? null : startTime,
        end_time: timeMode === "unlimited" ? null : endTime,
        password: password || null,
        realtime_rank: realtimeRank,
        status,
      };

      try {
        setSaving(true);
        setMessage("");
        await api.put(`/admin/contests/${id}/update`, payload);
        toast.success("Cập nhật kỳ thi thành công!", { position: "top-center" });
        setMessage("✅ Cập nhật kỳ thi thành công!");
        // router.push("/admin/contests");
      } catch {
        toast.error("❌ Không thể lưu thay đổi!", { position: "top-center" });
        setMessage("❌ Không thể lưu thay đổi!");
      } finally {
        setSaving(false);
      }
    },
    [id, title, description, startTime, endTime, password, realtimeRank, status, timeMode, validate]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  if (loading)
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center font-mono">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#ccc] border-t-[#007acc] mb-4"></div>
          <p className="text-[#616161] text-sm">Đang tải thông tin kỳ thi...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f3f3f3] font-mono">
      <div className="bg-[#f3f3f3] border-b border-[#ccc] px-4 py-2 sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-3 text-sm">
          <button onClick={() => router.push("/admin/contests")} className="text-[#616161] hover:text-[#007acc]">
            <i className="fas fa-arrow-left mr-2"></i>Quay lại
          </button>
          <span className="text-[#8c8c8c]">›</span>
          <span className="text-[#616161]">Chỉnh sửa kỳ thi</span>
        </div>
        <button
          type="submit"
          onClick={handleSave}
          disabled={saving || validate.length > 0}
          className={clsx(
            "flex items-center gap-2 px-4 py-1.5 text-xs transition-colors",
            validate.length === 0 && !saving
              ? "bg-[#007acc] hover:bg-[#005a9e] text-white"
              : "bg-[#ccc] text-[#8c8c8c] cursor-not-allowed"
          )}
        >
          <i className="fas fa-save"></i>
          <span>{saving ? "Đang lưu..." : "Lưu thay đổi (ctrl+s)"}</span>
        </button>
      </div>

      <div className="mx-auto px-6 py-6 space-y-4">
        {message && (
          <div
            className={clsx(
              "px-4 py-2 text-xs border-l-4 font-mono",
              message.startsWith("✅")
                ? "bg-[#dff6dd] border-[#4ec9b0] text-[#24613b]"
                : "bg-[#f48771]/10 border-[#f48771] text-[#a1260d]"
            )}
          >
            {message}
          </div>
        )}

        <div className="bg-white border border-[#ccc]">
          <div className="px-4 py-2 bg-[#f3f3f3] border-b border-[#ccc] text-xs uppercase text-[#616161] font-semibold">
            Thông tin kỳ thi
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs text-[#616161] mb-1.5">Tiêu đề *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tên kỳ thi"
                className="w-full border border-[#d4d4d4] px-3 py-1.5 text-sm focus:border-[#007acc] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#ccc]">
          <div className="px-4 py-2 bg-[#f3f3f3] border-b border-[#ccc] text-xs uppercase text-[#616161] font-semibold">
            Mô tả
          </div>
          <MarkdownEditor value={description} onChange={setDescription} height="350px" />
        </div>

        <div className="bg-white border border-[#ccc]">
          <div className="px-4 py-2 bg-[#f3f3f3] border-b border-[#ccc] text-xs uppercase text-[#616161] font-semibold">
            Kiểu thời gian
          </div>
          <div className="p-4 text-sm text-[#616161] flex gap-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={timeMode === "fixed"} onChange={() => setTimeMode("fixed")} className="accent-[#007acc]" />
              <span>Giới hạn thời gian</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={timeMode === "unlimited"} onChange={() => setTimeMode("unlimited")} className="accent-[#007acc]" />
              <span>Vô thời hạn</span>
            </label>
          </div>
        </div>

        {timeMode === "fixed" && (
          <div className="bg-white border border-[#ccc]">
            <div className="px-4 py-2 bg-[#f3f3f3] border-b border-[#ccc] text-xs uppercase text-[#616161] font-semibold">
              Thời gian
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#616161] mb-1.5">Thời gian bắt đầu *</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border border-[#d4d4d4] px-3 py-1.5 text-sm focus:border-[#007acc] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-[#616161] mb-1.5">Thời gian kết thúc *</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full border border-[#d4d4d4] px-3 py-1.5 text-sm focus:border-[#007acc] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white border border-[#ccc]">
          <div className="px-4 py-2 bg-[#f3f3f3] border-b border-[#ccc] text-xs uppercase text-[#616161] font-semibold">
            Tuỳ chọn khác
          </div>
          <div className="p-4 grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[#616161] mb-1.5">Mật khẩu</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="(nếu có)"
                className="w-full border border-[#d4d4d4] px-3 py-1.5 text-sm focus:border-[#007acc] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-[#616161] mb-1.5">Realtime Rank</label>
              <select
                value={realtimeRank ? "true" : "false"}
                onChange={(e) => setRealtimeRank(e.target.value === "true")}
                className="border border-[#d4d4d4] px-3 py-1.5 text-sm w-full focus:border-[#007acc] focus:outline-none"
              >
                <option value="true">Bật</option>
                <option value="false">Tắt</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#616161] mb-1.5">Trạng thái</label>
              <select
                value={status ? "true" : "false"}
                onChange={(e) => setStatus(e.target.value === "true")}
                className="border border-[#d4d4d4] px-3 py-1.5 text-sm w-full focus:border-[#007acc] focus:outline-none"
              >
                <option value="true">Hiển thị</option>
                <option value="false">Ẩn</option>
              </select>
            </div>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="bg-[#f48771]/10 border border-[#f48771] text-[#a1260d] p-3 text-xs font-mono">
            <ul className="list-disc pl-5 space-y-1">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
