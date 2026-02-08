"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { useContest } from "@/hooks/useContest";

interface Problem {
  id: number;
  display_id?: string;
  title: string;
  difficulty?: string;
  score?: number;
  best_score?: number;
  max_score?:number;
  max_submission_attempts:number;
}

interface PageData {
  page_number: number;
  page_size: number;
  totalCount: number;
  listings: Problem[];
}

/* ------------------ Component ------------------ */
export default function ContestProblemsPage() {
  const { contest } = useContest();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const PAGE_SIZE = 9;


  useEffect(() => {
    if (!contest) return;
    const fetchProblems = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<PageData>(
          `/problem/list?Class=${contest?.id}&page=${page}&page_size=${PAGE_SIZE}`
        );
        const d = res.data;
        setProblems(d.listings || []);
        setTotal(d.totalCount || 0);
      } catch (err) {
        console.error("Lỗi tải danh sách bài:", err);
        setError("Không thể tải danh sách bài. Vui lòng thử lại sau.");
        setProblems([]);
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    };
    fetchProblems();
  }, [contest, page]);

  /* -------- Filtering -------- */
  const filtered = useMemo(
    () => problems.filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase())
    ),
    [problems, search]
  );

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-full text-gray-600 bg-[#f5f5f5]">
        <div className="loader mb-3"></div>
        <p className="text-sm font-mono text-[#007acc]">Đang tải dữ liệu...</p>
      </div>
    );

  return (
    <div className="flex h-full flex-col bg-white border border-[#ccc] text-[#333333] font-mono select-none overflow-hidden">
      <header className="h-9 border-b border-[#ccc] bg-[#F3F3F3] flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#616161]">
            Danh sách bài trong contest
          </span>

          <div className="flex items-center gap-1 bg-white border border-[#CECECE] px-2 py-0.5 rounded-sm">
            <SearchIcon />
            <input
              type="text"
              placeholder="Tìm kiếm bài..."
              className="bg-transparent outline-none text-[12px] w-48 placeholder:italic"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="text-[11px] text-[#616161]">
          Hiển thị {filtered.length}/{total} bài
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        {error ? (
          <div className="flex items-center justify-center h-full text-red-600 text-[13px]">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#777] italic">
            Không có bài phù hợp.
          </div>
        ) : (
          <table className="w-full text-[13px] border-collapse">
            <thead className="bg-[#F3F3F3] border-b border-[#ccc] sticky top-0 z-10">
              <tr className="text-[#616161]">
                <th className="font-normal px-4 py-2 text-left w-12">#</th>
                <th className="font-normal px-4 py-2 text-left">Tên bài</th>
                <th className="font-normal px-4 py-2 text-left w-28">
                  <i className="fa fa-upload"></i>
                </th>
                <th className="font-normal px-4 py-2 text-left w-28">Mức độ</th>
                <th className="font-normal px-4 py-2 text-right w-40">Điểm cao nhất</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => {
                const maxScore = p.score ?? 100;
                const userScore = p.best_score ?? 0;
                const percent = Math.min((userScore / maxScore) * 100, 100);
                return (
                  <tr
                    key={p.id}
                    className="hover:bg-[#F0F7FF] transition-colors border-b border-[#ddd]"
                  >
                    <td className="px-4 py-2 text-[#616161] text-[12px]">{idx + 1}</td>
                    <td className="px-4 py-2 font-bold truncate">
                      <Link
                        href={`/problems/${contest?.id}/${p.id}`}
                        className="text-[#005FB8] hover:underline decoration-[#005FB8]/30 underline-offset-2"
                      >
                        {p.title}
                      </Link>
                      {p.display_id && (
                        <span className="ml-1 text-[11px] text-[#999]">
                          ({p.display_id})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {p.max_submission_attempts > -1 ? (
                        <b className="text-[14px]">{p.max_submission_attempts}</b>
                      ) : (
                        <i className="fas fa-infinity"></i>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <DifficultyBadge difficulty={p.difficulty || "normal"} />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end">
                        <span className="font-bold text-[#005FB8] text-[12px]">
                          {userScore}
                        </span>
                      </div>
                      <div className="w-full h-1 mt-1 bg-[#ccc] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#005FB8] transition-all"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </main>

      <footer className="h-7 bg-[#F3F3F3] border-t border-[#ccc] flex items-center px-3 justify-between text-[11px]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 hover:bg-[#63636322] px-2 h-full disabled:opacity-40"
          >
            <ChevronLeft /> Trước
          </button>
          <button
            onClick={() => setPage((p) => (p * PAGE_SIZE < total ? p + 1 : p))}
            disabled={page * PAGE_SIZE >= total}
            className="flex items-center gap-1 hover:bg-[#63636322] px-2 h-full disabled:opacity-40"
          >
            Sau <ChevronRight />
          </button>
          <span className="opacity-80 italic">
            Trang {page}/{Math.max(1, Math.ceil(total / PAGE_SIZE))}
          </span>
        </div>

        <div className="uppercase font-bold tracking-tighter">UTF-8</div>
      </footer>
    </div>
  );
}

/* ------------------ Sub Components ------------------ */

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors: Record<string, string> = {
    easy: "text-green-800 border-green-600 bg-green-100",
    normal: "text-lime-800 border-lime-600 bg-lime-100",
    hard: "text-red-700 border-red-500 bg-red-100",
  };
  const labels: Record<string, string> = {
    easy: "Dễ",
    normal: "Trung bình",
    hard: "Khó",
  };
  return (
    <span
      className={`text-[10px] px-2 py-0.5 border rounded-md font-medium ${
        colors[difficulty.toLowerCase()] ||
        "text-gray-500 border-gray-300 bg-gray-100"
      }`}
    >
      {labels[difficulty.toLowerCase()] || difficulty}
    </span>
  );
}

/* ------------------ Icons ------------------ */
function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
