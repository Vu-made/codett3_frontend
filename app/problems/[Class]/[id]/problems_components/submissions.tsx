"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Submission {
  id: number;
  uuid: string;
  problem_id: number;
  username: string;
  language: string;
  score: number;
  verdict: string;
  submitted_at: string;
}

export default function ProblemSubmissionsPage( { reloadTrigger }: { reloadTrigger: number }) {
  const { id } = useParams();
  const { Class } = useParams() ;
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const payload = {
          id : id ,
          class_ : Class 
        };
        const res = await api.post(`/problem/submissions`,payload);
        setSubmissions(res.data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách bài nộp!");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [reloadTrigger,id,Class]);

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

  const getScoreColor = (score: number) => {
    if (score >= 100) return "#0E8A16";
    if (score >= 70) return "#28A745";
    if (score >= 40) return "#E36209";
    return "#D73A49";
  };

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-full text-gray-600 bg-[#f5f5f5]">
        <div className="loader mb-3"></div>
        <p className="text-sm font-mono text-[#007acc]">Đang tải dữ liệu...</p>
      </div>
    );


  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-[#FAFAFA] text-[#333]">
        <div className="flex flex-col items-center gap-3">
          <i className="fas fa-exclamation-circle text-4xl text-[#D73A49]" />
          <p className="text-lg">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-[#007ACC] hover:bg-[#0D89E5] text-white text-sm rounded transition"
          >
            <i className="fas fa-arrow-left mr-2" />
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#FAFAFA] text-[#333]">
      <div className="flex-1">
        {submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#777]">
            <i className="fas fa-inbox text-5xl mb-4 text-[#D0D0D0]" />
            <p className="text-lg mb-2">Chưa có submission nào</p>
            <p className="text-sm">Hãy thử nộp bài đầu tiên của bạn!</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-[#007ACC] hover:bg-[#0D89E5] text-white text-sm rounded transition"
            >
              Quay lại bài tập
            </button>
          </div>
        ) : (
          <div className="w-full mx-auto">
            <div className="bg-white rounded shadow-sm overflow-hidden">
              <table className="min-w-full border-collapse">
                <thead className="bg-[#F3F3F3] border-b border-[#D0D0D0]">
                  <tr className="text-xs font-semibold text-[#666] uppercase tracking-wide text-left">
                    <th className="px-4 py-2 w-12">#</th>
                    <th className="px-4 py-2">Ngôn ngữ</th>
                    <th className="px-4 py-2">Điểm</th>
                    <th className="px-4 py-2">Kết quả</th>
                    <th className="px-4 py-2">Thời gian nộp</th>
                    <th className="px-4 py-2 text-center">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E0E0]">
                  {submissions.map((s, index) => {
                    const verdictStyle = getVerdictStyle(s.verdict);
                    return (
                      <tr
                        key={s.uuid}
                        className="hover:bg-[#F8F8F8] transition text-sm"
                      >
                        <td className="px-4 py-2 text-[#666] font-mono text-left">
                          #{index + 1}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{s.language}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-left">
                          <span
                            className="font-bold text-base"
                            style={{ color: getScoreColor(s.score) }}
                          >
                            {s.score}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-left">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor: verdictStyle.bg,
                              color: verdictStyle.text,
                            }}
                          >
                            <i className={`fas fa-${verdictStyle.icon}`} />
                            {s.verdict}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-[#666] text-left">
                          <i className="fas fa-calendar-alt text-xs mr-1" />
                          {new Date(s.submitted_at).toLocaleString("vi-VN", {
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
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer Stats */}
            <div className="flex items-center justify-between px-4 py-2  border-[#D0D0D0] text-sm">
              <div className="flex items-center gap-4">
                <span className="text-[#666]">
                  <i className="fas fa-list mr-2" />
                  Tổng số submissions: <strong>{submissions.length}</strong>
                </span>
                <span className="text-[#666]">
                  <i className="fas fa-check-circle mr-2 text-[#0E8A16]" />
                  AC:{" "}
                  <strong>
                    {submissions.filter((s) => s.verdict === "AC").length}
                  </strong>
                </span>
              </div>
              <div className="text-xs text-[#999]">
                <i className="fas fa-info-circle mr-1" />
                Click vào “Xem” để xem chi tiết submission
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
