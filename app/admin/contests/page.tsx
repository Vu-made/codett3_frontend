"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/base-context-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Contest {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  status: boolean;
  created_at: string;
}

type FilterStatus = "all" | "active" | "hidden";

const PAGE_SIZE = 6;

export default function ContestManager() {
  const router = useRouter();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await api.get("/admin/contests/");
        setContests(res.data as Contest[]);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  const handleEdit = (id: number) => router.push(`/admin/contest/edit/${id}`);
  const handleProblems = (id: number) => router.push(`/admin/problems/${id}`);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xoá kỳ thi này không?")) return;
    try {
      await api.delete(`/admin/contests/${id}/delete`);
      setContests((prev) => prev.filter((c) => c.id !== id));
    } catch {
    }
  };

  const toggleVisible = async (id: number) => {
    try {
      await api.post(`/admin/contests/${id}/toggle_status`);
      setContests((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: !c.status } : c))
      );
    } catch {
    }
  };

  const filteredContests = useMemo(() => {
    return contests
      .slice()
      .reverse()
      .filter((c) => {
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
          filterStatus === "all" ||
          (filterStatus === "active" && c.status) ||
          (filterStatus === "hidden" && !c.status);
        return matchesSearch && matchesFilter;
      });
  }, [contests, searchQuery, filterStatus]);

  const totalPages = Math.ceil(filteredContests.length / PAGE_SIZE);
  const paginatedContests = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredContests.slice(start, start + PAGE_SIZE);
  }, [filteredContests, page]);

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-full text-gray-600 bg-[#f5f5f5]">
        <div className="loader mb-3"></div>
        <p className="text-sm font-mono text-[#007acc]">Đang tải dữ liệu...</p>
      </div>
    );

  return (
    <div className="flex flex-col h-full bg-white text-[#1e1e1e] font-mono">
      <div className="bg-[#f3f3f3] border-b border-[#e0e0e0] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[#1e1e1e]">
          <i className="fas fa-trophy text-[#007acc]"></i>
          <span className="font-semibold">Kỳ thi</span>
          <span className="text-[#aaaaaa]">›</span>
          <span className="text-[#666666] text-sm">Quản lý</span>
        </div>
        <button
          onClick={() => router.push("/admin/contest/new")}
          className="flex items-center gap-2 bg-[#007acc] hover:bg-[#0a84d0] text-white px-3 py-1.5 text-xs rounded transition-colors"
        >
          <i className="fas fa-plus"></i>
          <span>Kỳ thi mới</span>
        </button>
      </div>

      <div className="bg-[#fafafa] border-b border-[#e0e0e0] px-4 py-3 flex items-center gap-3">
        <div className="flex-1 relative">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[#888] text-xs"></i>
          <input
            type="text"
            placeholder="Tìm kiếm kỳ thi..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white border border-[#d0d0d0] rounded pl-9 pr-3 py-1.5 text-sm focus:border-[#007acc] focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1">
          {([
            { label: `Tất cả (${contests.length})`, value: "all" },
            { label: "Hiển thị", value: "active" },
            { label: "Ẩn", value: "hidden" },
          ] as { label: string; value: FilterStatus }[]).map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setFilterStatus(f.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs rounded ${
                filterStatus === f.value
                  ? "bg-[#007acc]/20 text-[#007acc] font-semibold"
                  : "text-[#666] hover:text-[#1e1e1e]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {paginatedContests.length === 0 ? (
          <div className="text-center text-[#888] mt-12">
            <i className="fas fa-inbox text-4xl opacity-50 mb-3"></i>
            <p className="text-sm">
              {searchQuery || filterStatus !== "all"
                ? "Không tìm thấy kỳ thi nào phù hợp."
                : "Chưa có kỳ thi nào. Hãy tạo kỳ thi đầu tiên của bạn!"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {paginatedContests.map((contest) => (
              <ContextMenu key={contest.id}>
                <ContextMenuTrigger>
                  <div className="flex items-center justify-between border border-[#ddd] rounded-lg px-4 py-3 bg-white hover:bg-[#f8f9fa] shadow-sm transition-all cursor-pointer">
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          onClick={() => handleProblems(contest.id)}
                          className="font-semibold text-[#0451a5] hover:underline truncate"
                        >
                          {contest.title}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            contest.status
                              ? "bg-[#e8f5e9] text-[#2e7d32]"
                              : "bg-[#ffebee] text-[#c62828]"
                          }`}
                        >
                          {contest.status ? "Hiển thị" : "Ẩn"}
                        </span>
                      </div>
                      <div className="text-xs text-[#555] mt-1 flex flex-wrap gap-x-6">
                        <span>
                          <i className="far fa-clock mr-1"></i>
                          {contest.start_time
                            ? new Date(contest.start_time).toLocaleString("vi-VN")
                            : "Không xác định"}
                        </span>
                        <span>
                          <i className="far fa-flag mr-1"></i>
                          {contest.end_time
                            ? new Date(contest.end_time).toLocaleString("vi-VN")
                            : "Không xác định"}
                        </span>
                        <span>
                          <i className="far fa-calendar-plus mr-1"></i>
                          Tạo lúc:{" "}
                          {new Date(contest.created_at).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <button
                        onClick={() => handleDelete(contest.id)}
                        className="text-[#a31515] text-xs hover:underline"
                      >
                        <i className="fas fa-trash mr-1" />
                        Xoá
                      </button>
                    </div>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48 bg-white border border-[#ddd] rounded-md shadow-lg">
                  <ContextMenuItem
                    onClick={() => handleEdit(contest.id)}
                    className="px-3 py-2 hover:bg-[#f0f0f0]"
                  >
                    <i className="fas fa-edit text-[#007acc] w-4 mr-1"></i> Chỉnh sửa
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => handleProblems(contest.id)}
                    className="px-3 py-2 hover:bg-[#f0f0f0]"
                  >
                    <i className="fas fa-bars text-[#267f99] w-4 mr-1"></i> Bài tập
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    onClick={() => toggleVisible(contest.id)}
                    className="px-3 py-2 hover:bg-[#fff8e1]"
                  >
                    <i
                      className={`fas ${
                        contest.status
                          ? "fa-eye-slash text-[#a31515]"
                          : "fa-eye text-[#388e3c]"
                      } w-4 mr-1`}
                    ></i>
                    {contest.status ? "Ẩn kỳ thi" : "Hiển thị kỳ thi"}
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => handleDelete(contest.id)}
                    className="px-3 py-2 text-[#a31515] hover:bg-[#ffebee]"
                  >
                    <i className="fas fa-trash w-4 mr-1"></i> Xoá kỳ thi
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="border-t border-[#e0e0e0] py-1">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="ghost"
                  mode="icon"
                  disabled={page === 1}
                  onClick={() => setPage(1)}
                >
                  <ChevronFirst />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="ghost"
                  mode="icon"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft />
                </Button>
              </PaginationItem>
              {Array.from({ length: totalPages })
                .map((_, i) => i + 1)
                .filter((i) => i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2))
                .map((i, index, arr) => (
                  <div key={i} className="flex items-center">
                    <PaginationItem>
                      <Button
                        variant={page === i ? "outline" : "ghost"}
                        mode="icon"
                        onClick={() => setPage(i)}
                      >
                        {i}
                      </Button>
                    </PaginationItem>
                    {index < arr.length - 1 && arr[index + 1] - i > 1 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                  </div>
                ))}
              <PaginationItem>
                <Button
                  variant="ghost"
                  mode="icon"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="ghost"
                  mode="icon"
                  disabled={page === totalPages}
                  onClick={() => setPage(totalPages)}
                >
                  <ChevronLast />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
