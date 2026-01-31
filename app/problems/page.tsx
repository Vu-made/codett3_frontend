"use client";
import React, { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/base-tooltip";

const Icons = {
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  Tag: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H2v10l9.29 9.29a2.42 2.42 0 0 0 3.42 0l6.58-6.58a2.42 2.42 0 0 0 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),
  ChevronRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
};

interface Problem {
  id: number;
  display_id: string;
  title: string;
  difficulty: string;
  tags: string[];
  best_score?: number;
  max_score?: number;
  max_submission_attempts: number;
}

export default function ProblemTablePage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/problem/list?Class=public&page=${currentPage}&page_size=${pageSize}`);
        setProblems(res.data.listings || []);
        setTotalCount(res.data.totalCount || 0);
        setPageCount(res.data.totalPages || 1);
      } catch (err) {
        console.error("Lỗi tải danh sách bài:", err);
        setError("Không thể tải danh sách bài. Vui lòng thử lại sau.");
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    };
    fetchProblems();
  }, [currentPage, pageSize]);

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = !selectedTag || p.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [problems, searchTerm, selectedTag]);

  const allTags = useMemo(() => Array.from(new Set(problems.flatMap((p) => p.tags))), [problems]);

  const prevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const nextPage = () => setCurrentPage((p) => Math.min(pageCount, p + 1));

  return (
    <div className="h-full flex flex-col bg-white text-[#333333] font-mono select-none overflow-hidden">
      {/* HEADER */}
      <header className="h-9 border-b border-[#ccc] bg-[#F3F3F3] flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#616161]">
            Trình khám phá: Danh sách bài
          </span>
          <div className="flex items-center gap-1 bg-white border border-[#CECECE] px-2 py-0.5 rounded-sm">
            <Icons.Search />
            <input
              type="text"
              placeholder="Tìm kiếm (Ctrl + F)"
              className="bg-transparent outline-none text-[12px] w-48 placeholder:italic"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="h-full text-[11px] uppercase tracking-wider text-[#616161]
            border border-[#CECECE] px-2 py-0.5 rounded-sm outline-none"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value="7">7 problem/page</option>
            <option value="10">10 problem/page</option>
            <option value="20">20 problem/page</option>
            <option value="30">30 problem/page</option>
          </select>
        </div>
        <div className="text-[11px] text-[#616161]">
          Hiển thị {filteredProblems.length}/{totalCount} bài
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* ASIDE */}
        <aside className="w-56 border-r border-[#ccc] bg-[#F3F3F3] flex flex-col shrink-0">
          <div className="px-3 py-2 text-[11px] font-bold uppercase text-[#616161]">TỔNG QUAN</div>
          <div className="px-4 py-1 text-[13px] text-[#333]">
            <div className="flex justify-between mb-1">
              <span>Tổng số bài:</span>
              <span className="font-bold text-[#005FB8]">{totalCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Tổng tag:</span>
              <span className="font-bold text-[#005FB8]">{allTags.length}</span>
            </div>
          </div>

          <div className="px-3 py-2 text-[11px] font-bold uppercase text-[#616161] border-t border-[#ccc] mt-2">
            LỌC THEO TAG
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {allTags.length === 0 ? (
              <div className="px-4 text-[12px] italic text-[#999]">Không có tag nào</div>
            ) : (
              allTags.map((tag) => (
                <div
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`group flex items-center px-4 py-1 text-[13px] cursor-pointer hover:bg-[#E8E8E8] transition-colors ${
                    selectedTag === tag ? "bg-[#D9D9D9] text-[#005FB8] font-semibold" : "text-[#424242]"
                  }`}
                >
                  <span className={`mr-2 ${selectedTag === tag ? "text-[#005FB8]" : "text-[#616161]"}`}>
                    <Icons.Tag />
                  </span>
                  <span className="truncate">{tag}</span>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#F3F3F3]">
          <div className="h-full w-full overflow-auto">
            {loading ? (
              <ProblemListSkeleton />
            ) : error ? (
              <div className="p-8 text-center text-red-600 text-[13px]">{error}</div>
            ) : (
              <ProblemList problems={filteredProblems} />
            )}
          </div>

          <footer className="h-7 bg-[#F3F3F3] border-t border-[#ccc] flex items-center px-3 justify-between text-[11px] shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={prevPage} disabled={currentPage === 1}
                className="flex items-center gap-1 hover:bg-[#63636322] px-2 h-full disabled:opacity-40">
                <Icons.ChevronLeft /> Trước
              </button>
              <button onClick={nextPage} disabled={currentPage === pageCount}
                className="flex items-center gap-1 hover:bg-[#63636322] px-2 h-full disabled:opacity-40">
                Sau <Icons.ChevronRight />
              </button>
              <span className="opacity-80 italic">Trang {currentPage}/{Math.max(1, pageCount)}</span>
            </div>
            <div className="flex items-center gap-4 uppercase font-bold tracking-tighter">
              <span>UTF-8</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

function ProblemList({ problems }: { problems: Problem[] }) {
  return (
    <div className="flex-1 overflow-auto px-3 py-3 space-y-2">
      {problems.length > 0 ? (
        problems.map((p, idx) => (
          <div
            key={p.id}
            className="group bg-white border border-[#ccc] rounded-md px-4 py-3 flex justify-between items-start hover:border-[#005FB8] hover:shadow-sm transition-all"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#616161] font-mono">#{idx + 1}</span>
                <Link href={`/problems/public/${p.id}`} className="font-semibold text-[#005FB8] hover:underline text-[14px]">
                  {p.title} <span className="text-[11px] text-[#616161]">({p.display_id})</span>
                </Link>
              </div>

              <div className="flex flex-wrap gap-1">
                {p.tags.length > 0 ? (
                  <Tooltip>
                    <TooltipTrigger className="px-1.5 py-0.5 flex items-center rounded-sm bg-[#F0F0F0] border border-[#CCC] text-[#424242] text-[11px]">
                      <i className="fas fa-tags"></i>
                    </TooltipTrigger>
                    <TooltipContent className="flex gap-2 bg-white! border border-[#ccc] p-2 rounded-md">
                      {p.tags.map((t) => (
                        <span key={t}
                          className="text-[10px] bg-[#E8E8E8] text-[#424242] px-1.5 py-0.5 rounded-sm uppercase">
                          {t}
                        </span>
                      ))}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <span className="px-1.5 py-0.5 text-[11px] text-[#999] italic">Không có tag</span>
                )}

                <div className="px-1.5 py-0.5 flex items-center rounded-sm bg-[#F0F0F0] border border-[#CCC] text-[#424242] text-[11px]">
                  <i className="fas fa-star mr-1"></i><b>{p.max_score ?? 100}</b>
                </div>
                <div className="px-1.5 py-0.5 flex items-center rounded-sm bg-[#F0F0F0] border border-[#CCC] text-[#424242] text-[11px]">
                  <i className="fas fa-upload mr-1"></i>
                  {p.max_submission_attempts > -1 ? (
                    <b>{p.max_submission_attempts}</b>
                  ) : (
                    <i className="fas fa-infinity"></i>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end min-w-52 shrink-0">
              <DifficultyBadge difficulty={p.difficulty} />
              <div className="flex flex-col items-end mt-1 w-52">
                <span className="font-bold text-[#005FB8] text-[13px]">{p.best_score ?? 0}</span>
                <div className="w-full h-1 mt-1 bg-[#ccc] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#005FB8] transition-all"
                    style={{
                      width: `${Math.min((p.best_score ?? 0) / (p.max_score ?? 100), 1) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="py-20 text-center text-[#616161] italic">Không tìm thấy kết quả phù hợp.</div>
      )}
    </div>
  );
}

function ProblemListSkeleton() {
  return (
    <div className="px-3 py-2 space-y-2 animate-pulse">
      {[...Array(7)].map((_, i) => (
        <div key={i} className="h-16 bg-white border border-[#ccc] rounded-md"></div>
      ))}
    </div>
  );
}

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
        colors[difficulty.toLowerCase()] || "text-gray-500 border-gray-200 bg-gray-50"
      }`}
    >
      {labels[difficulty.toLowerCase()] || difficulty}
    </span>
  );
}
