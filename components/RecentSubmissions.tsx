"use client";

import React, { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Submission {
  uuid: string;
  problem: string;
  result: string;
  time: string;
}

interface SubmissionPage {
  page_number: number;
  page_size: number;
  total_count: number;
  data: Submission[];
}

export default function RecentSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<SubmissionPage>(
        `/user/submissions?page=${currentPage}&page_size=${pageSize}`
      );
      setSubmissions(res.data.data);
      setTotal(res.data.total_count);
    } catch (err) {
      console.error("Lỗi khi load submissions:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const pageCount = Math.ceil(total / pageSize);

  const nextPage = () => {
    if (currentPage < pageCount) setCurrentPage((p) => p + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const getVerdictStyle = (verdict: string) => {
    const styles: Record<string, { bg: string; text: string; icon: string }> = {
      AC: { bg: "#DFF6DD", text: "#0E8A16", icon: "check-circle" },
      WA: { bg: "#FFEEF0", text: "#D73A49", icon: "times-circle" },
      TLE: { bg: "#FFF8E5", text: "#E36209", icon: "clock" },
      MLE: { bg: "#F3E5F5", text: "#6F42C1", icon: "memory" },
      RE: { bg: "#FFF4E5", text: "#C27D17", icon: "exclamation-triangle" },
      CE: { bg: "#FFF3CD", text: "#856404", icon: "code" },
      Pending: { bg: "#E3F2FD", text: "#0D47A1", icon: "hourglass-half" },
    };
    return styles[verdict] || { bg: "#F3F3F3", text: "#666", icon: "question-circle" };
  };

  return (
    <div className="h-150 flex flex-col bg-[#FAFAFA] text-[#333] border border-[#ddd] rounded shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#F3F3F3] border-b border-[#D0D0D0]">
        <h2 className="text-base font-semibold">Bài gửi gần đây</h2>
        <span className="text-sm text-[#666]">
          Tổng cộng <strong>{total}</strong> bài nộp
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-[#F9F9F9] border-b border-[#ccc]">
            <tr className="text-xs font-semibold text-[#666] uppercase tracking-wide text-left">
              <th className="px-4 py-2 w-12">#</th>
              <th className="px-4 py-2">Bài tập</th>
              <th className="px-4 py-2">Kết quả</th>
              <th className="px-4 py-2">Thời gian</th>
              <th className="px-4 py-2 text-center">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0E0E0]">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-[#666]">
                  <i className="fas fa-spinner fa-spin mr-2 text-[#007ACC]" />
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : submissions.length > 0 ? (
              submissions.map((s, idx) => {
                const verdictStyle = getVerdictStyle(s.result);
                return (
                  <tr
                    key={s.uuid || idx}
                    className="hover:bg-[#F8F8F8] transition text-sm border-b border-[#ccc]"
                  >
                    <td className="px-4 py-2 text-[#666] font-mono">#{idx + 1}</td>
                    <td className="px-4 py-2 font-medium">{s.problem}</td>
                    <td className="px-4 py-2">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: verdictStyle.bg,
                          color: verdictStyle.text,
                        }}
                      >
                        <i className={`fas fa-${verdictStyle.icon}`} />
                        {s.result}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-[#666]">
                      <i className="fas fa-calendar-alt text-xs mr-1" />
                      {new Date(s.time).toLocaleString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Link
                        href={`/submission/${s.uuid}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#007ACC] hover:bg-[#0D89E5] text-white text-xs rounded transition"
                      >
                        <i className="fas fa-eye" />
                        Xem
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-6 text-center text-[#999] italic">
                  <i className="fas fa-inbox text-3xl mb-2 text-[#D0D0D0]" />
                  <p>Chưa có bài nộp nào gần đây</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Pagination */}
      <footer className="bg-[#F3F3F3] border-t border-[#D0D0D0] flex items-center justify-between px-4 py-1 text-[12px]">
        <div className="flex items-center gap-3">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-[#e0e0e0] transition ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <ChevronLeft size={14} />
            Trước
          </button>
          <button
            onClick={nextPage}
            disabled={currentPage === pageCount || total === 0}
            className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-[#e0e0e0] transition ${
              currentPage === pageCount || total === 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            Sau
            <ChevronRight size={14} />
          </button>
          <span className="text-[#666] italic">
            Trang {currentPage}/{Math.max(1, pageCount)}
          </span>
        </div>
        <span className="font-bold text-[#555] text-[11px] tracking-tight">
          UTF-8
        </span>
      </footer>
    </div>
  );
}
