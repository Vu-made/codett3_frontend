"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";

interface ProblemSource {
  id: number;
  display_id: string;
  title: string;
  author: string;
  origin_class: string[];
  created_at: string;
}

export default function ImportProblemsPage() {
  const { Class } = useParams();
  const router = useRouter();
  const [problems, setProblems] = useState<ProblemSource[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [originFilter, setOriginFilter] = useState<string>("Tất cả");
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchProblems = async (page: number) => {
      setLoading(true);
      try {
        const res = await api.get("/admin/problems/source_list", {
          params: {
            page,
            page_size: pageSize,
            search: searchQuery,
            origin_class: originFilter === "Tất cả" ? "" : originFilter,
          },
        });
        setProblems(res.data.list_problem);
        setPageCount(Math.ceil(res.data.count / pageSize));
      } catch {
        alert("Không thể tải danh sách bài tập nguồn!");
      } finally {
        setLoading(false);
      }
    };
    fetchProblems(currentPage);
  }, [currentPage, searchQuery, originFilter]);

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleImport = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Bạn có chắc muốn import ${selectedIds.length} bài này không?`))
      return;
    try {
      await api.post(`/admin/problems/import`, {
        Class,
        problem_ids: selectedIds,
      });
      router.push(`/admin/problems/${Class}`);
    } catch {
      alert("Lỗi khi import bài tập!");
    }
  };

  const allContests = Array.from(new Set(problems.flatMap((p) => p.origin_class)));

  const prevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const nextPage = () => setCurrentPage((p) => Math.min(pageCount, p + 1));

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#ffffff]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#ddd] border-t-[#007acc] mb-4"></div>
          <p className="text-[#444] font-mono text-sm">Đang tải danh sách bài tập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#ffffff] text-[#1e1e1e] font-[JetBrains_Mono,monospace]">
      <div className="bg-[#f3f3f3] border-b border-[#e0e0e0] px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-[#1e1e1e]">
          <button
            onClick={() => router.back()}
            className="text-[#007acc] hover:text-[#005a9e]"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <span className="font-semibold">Thêm bài tập từ nguồn khác</span>
          <span className="text-[#aaaaaa]">›</span>
          <span className="text-[#666666] text-sm">{Class}</span>
        </div>
        <button
          onClick={handleImport}
          className="flex items-center gap-2 bg-[#007acc] hover:bg-[#0a84d0] text-white px-3 py-1.5 text-xs transition-colors rounded"
        >
          <i className="fas fa-download"></i>
          <span>Import đã chọn ({selectedIds.length})</span>
        </button>
      </div>

      <div className="bg-[#fafafa] border-b border-[#e0e0e0] px-4 py-3 flex items-center gap-3 shrink-0 relative">
        <div className="flex-1 relative">
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-[#888888] text-xs"></i>
          <input
            type="text"
            placeholder="Tìm kiếm bài tập..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#ffffff] text-[#1e1e1e] pl-9 pr-3 py-1.5 text-sm border border-[#d0d0d0] rounded focus:border-[#007acc] focus:outline-none"
          />
        </div>

        <div
          className="relative"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <button className="px-3 py-1.5 border border-[#d0d0d0] rounded text-sm bg-white hover:bg-[#f3f3f3] flex items-center gap-2">
            <i className="fas fa-filter text-[#007acc]"></i>
            {originFilter}
            <i className="fas fa-chevron-down text-xs"></i>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-1 bg-white border border-[#d0d0d0] rounded shadow-md z-10 w-52 max-h-60 overflow-y-auto">
              <div
                className={`px-3 py-2 text-sm hover:bg-[#eaf4ff] cursor-pointer ${
                  originFilter === "Tất cả" ? "bg-[#eaf4ff]" : ""
                }`}
                onClick={() => setOriginFilter("Tất cả")}
              >
                Tất cả
              </div>
              {allContests.map((cName) => (
                <div
                  key={cName}
                  className={`px-3 py-2 text-sm hover:bg-[#eaf4ff] cursor-pointer ${
                    originFilter === cName ? "bg-[#eaf4ff]" : ""
                  }`}
                  onClick={() => setOriginFilter(cName)}
                >
                  {cName}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {problems.length === 0 ? (
          <div className="w-full text-center text-[#888] py-16">
            <i className="fas fa-inbox text-4xl opacity-50 mb-2"></i>
            <p>Không có bài tập nào phù hợp.</p>
          </div>
        ) : (
          problems.map((p) => (
            <div
              key={p.id}
              className={`border border-[#ccc] flex justify-between rounded-lg shadow-sm px-4 py-2 hover:shadow-md transition cursor-pointer w-full items-center ${
                selectedIds.includes(p.id) ? "bg-[#eaf4ff]" : "bg-white"
              }`}
              onClick={() => handleToggleSelect(p.id)}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="truncate">
                  <div className="font-mono text-[#0451a5] text-sm">
                    {p.display_id}
                  </div>
                  <div className="font-semibold truncate">{p.title}</div>
                  <div className="text-[#267f99] text-sm truncate">
                    {p.author}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex flex-wrap justify-end gap-1">
                  {p.origin_class.map((cName, i) => (
                    <span
                      key={i}
                      className="bg-[#007acc] text-white text-xs px-2 py-0.5 rounded truncate"
                      title={cName}
                    >
                      {cName}
                    </span>
                  ))}
                </div>
                <div className="text-[#666] text-xs italic">
                  {new Date(p.created_at).toLocaleString("vi-VN", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <footer className="h-7 bg-[#F3F3F3] border-t border-[#ccc] flex items-center px-3 justify-between text-[11px] shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="flex items-center gap-1 hover:bg-[#63636322] px-2 h-full disabled:opacity-50"
          >
            <i className="fas fa-chevron-left"></i> Trước
          </button>
          <button
            onClick={nextPage}
            disabled={currentPage === pageCount}
            className="flex items-center gap-1 hover:bg-[#63636322] px-2 h-full disabled:opacity-50"
          >
            Sau <i className="fas fa-chevron-right"></i>
          </button>
          <span className="opacity-80 italic">
            Trang {currentPage}/{Math.max(1, pageCount)}
          </span>
        </div>
        <div className="flex items-center gap-4 uppercase font-bold tracking-tighter">
          <span>UTF-8</span>
        </div>
      </footer>
    </div>
  );
}
