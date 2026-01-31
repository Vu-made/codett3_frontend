"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Sortable, SortableItem, SortableItemHandle } from "@/components/ui/sortable";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/base-tooltip";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react";

interface Problem {
  id: number;
  display_id: string;
  title: string;
  author: string;
  created_at: string;
  problem_visible: boolean;
  group_visible: boolean;
  max_submission_attempts: number;
}


function ProblemList({
  problems,
  page,
  onEdit,
  onDelete,
  onToggleVisible,
  onToggleGroupVisible,
  onReorder,
  onSaveLimit,
  MAX_LOAD_PROBLEM
}: {
  problems: Problem[];
  page: number;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleVisible: (id: number) => void;
  onToggleGroupVisible: (id: number) => void;
  onReorder: (newOrder: Problem[]) => void;
  onSaveLimit: (id: number, newLimit: number) => void;
  MAX_LOAD_PROBLEM : number;
}) {
  const [editingLimit, setEditingLimit] = useState<number | null>(null);
  const [tempLimit, setTempLimit] = useState<number>(0);

  if (problems.length === 0)
    return <div className="text-center text-gray-500 py-10">Không có bài tập nào phù hợp.</div>;

  return (
    <Sortable
      value={problems}
      getItemValue={(p) => String(p.id)}
      onValueChange={onReorder}
      className="flex flex-col gap-1"
    >
      {problems.map((p, index) => (
        <SortableItem
          key={p.id}
          value={String(p.id)}
          className="grid grid-cols-[30px_1fr_auto_auto_auto_auto] items-center gap-5 bg-white border border-[#ddd] rounded px-3 py-2 hover:bg-[#f9f9f9]"
        >
          <div className="flex items-center gap-2 w-10 text-[#999]">
            <SortableItemHandle>
              <i className="fas fa-grip-vertical cursor-grab" />
            </SortableItemHandle>
            <span className="text-xs text-[#555]">
              {(page - 1) * MAX_LOAD_PROBLEM + index + 1}
            </span>
          </div>
          <div className="truncate">
            <div className="font-medium text-[#0451a5] truncate">
              {p.display_id} — {p.title}
            </div>
            <div className="text-xs text-[#267f99] truncate">{p.author}</div>
          </div>
          <div className="text-xs text-[#666] text-right min-w-36">
            {new Date(p.created_at).toLocaleString("vi-VN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="flex items-center justify-center w-20">
            {editingLimit === p.id ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  value={tempLimit}
                  onChange={(e) => setTempLimit(Number(e.target.value))}
                  className="w-14 text-xs px-1 py-0.5 border border-[#ccc] rounded text-center focus:border-[#007acc]"
                />
                <button
                  onClick={() => {
                    onSaveLimit(p.id, tempLimit);
                    setEditingLimit(null);
                  }}
                  className="text-[#007acc] hover:text-[#005fa3]"
                >
                  <i className="fas fa-check" />
                </button>
              </div>
            ) : (
              <Tooltip>
                <TooltipTrigger>
                  <div
                    onClick={() => {
                      setEditingLimit(p.id);
                      setTempLimit(p.max_submission_attempts || 0);
                    }}
                    className="text-xs px-2 py-1 border rounded bg-[#f0f0f0] border-[#f0f0f0] hover:bg-[#e0e0e0] hover:border-blue-400"
                  >
                    {p.max_submission_attempts <= 0 ? (
                      <i className="fas fa-infinity" />
                    ) : (
                      p.max_submission_attempts
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-white! border border-[#ccc] text-xs">
                  <p>
                    Số lượt chấm bài:{" "}
                    {p.max_submission_attempts <= 0 ? (
                      <b>Không giới hạn</b>
                    ) : (
                      <b>{p.max_submission_attempts}</b>
                    )}
                  </p>
                  <p className="text-[10px] text-gray-500">Nhấp để thay đổi</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="flex gap-2 justify-center w-20">
            <Tooltip>
              <TooltipTrigger>
                <div
                  onClick={() => onToggleVisible(p.id)}
                  className={`text-xs px-2 py-1 rounded border border-[#f0f0f0] hover:border-blue-400 ${
                    p.problem_visible
                      ? "bg-[#007acc]/20 text-[#007acc]"
                      : "bg-[#ccc]/30 text-[#888]"
                  }`}
                >
                  {p.problem_visible ? "P" : "p"}
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-white! border border-[#ccc] text-xs">
                {p.problem_visible ? "Ẩn bài tập toàn cục" : "Hiển thị bài tập toàn cục"}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <div
                  onClick={() => onToggleGroupVisible(p.id)}
                  className={`text-xs px-2 py-1 rounded ${
                    p.group_visible
                      ? "bg-[#28a745]/20 text-[#28a745]"
                      : "bg-[#ccc]/30 text-[#888]"
                  }`}
                >
                  {p.group_visible ? "G" : "g"}
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-white! border border-[#ccc] text-xs">
                {p.group_visible ? "Ẩn bài tập khỏi nhóm này" : "Hiển thị bài tập trong nhóm này"}
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex gap-2 justify-end w-20">
            <Tooltip>
              <TooltipTrigger>
                <div onClick={() => onEdit(p.id)} className="hover:text-[#007acc]">
                  <i className="fas fa-edit" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-white! border border-[#ccc] text-xs">
                Chỉnh sửa bài tập
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <div onClick={() => onDelete(p.id)} className="hover:text-[#a31515]">
                  <i className="fas fa-trash" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-white! border border-[#ccc] text-xs">
                Xóa bài tập này
              </TooltipContent>
            </Tooltip>
          </div>
        </SortableItem>
      ))}
    </Sortable>
  );
}

export default function ProblemManager() {
  const router = useRouter();
  const { Class } = useParams();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [Title, setTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState<"all" | "visible" | "hidden">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [MAX_LOAD_PROBLEM,setMaxLoadProblem] = useState(8);


  const fetchGroupInfo = useCallback(async () => {
    try {
      const res = await api.get(`/admin/problems/info/${Class}`);
      setTitle(res.data?.title || "");
    } catch {}
  }, [Class]);

  const fetchProblems = useCallback(
    async (pageNum: number) => {
      if (problems.length === 0) setLoading(true);
      try {
        const res = await api.get(
          `/admin/problems/list/${Class}?page=${pageNum}&limit=${MAX_LOAD_PROBLEM}`
        );
        const list = res.data?.list_problem || [];
        setProblems(list);
        setTotalPages(res.data?.total_pages || 1);
      } catch {
      } finally {
        setLoading(false);
      }
    },
    [Class, problems.length , MAX_LOAD_PROBLEM]
  );

  useEffect(() => {
    fetchGroupInfo();
  }, [fetchGroupInfo]);

  useEffect(() => {
    fetchProblems(page);
  }, [fetchProblems, page]);

  const handleEdit = (id: number) => router.push(`/admin/problem/${Class}/edit/${id}`);
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài tập này không?")) return;
    try {
      await api.delete(`/admin/problems/delete?problem_id=${id}&Class=${Class}`);
      setProblems((prev) => prev.filter((p) => p.id !== id));
    } catch {}
  };
  const toggleGroupVisible = async (id: number) => {
    try {
      await api.post(`/admin/problems/${id}/toggle_group_visible?Class=${Class}`);
      setProblems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, group_visible: !p.group_visible } : p))
      );
    } catch {}
  };
  const toggleVisible = async (id: number) => {
    try {
      await api.post(`/admin/problems/${id}/toggle_visible`);
      setProblems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, problem_visible: !p.problem_visible } : p))
      );
    } catch {}
  };
  const saveLimit = async (id: number, newLimit: number) => {
    try {
      await api.post(`/admin/problems/set_limit`, { problem_id: id, limit: newLimit, Class });
      setProblems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, max_submission_attempts: newLimit } : p))
      );
    } catch {
    }
  };
  const handleReorder = async (newOrder: Problem[]) => {
    setProblems(newOrder);
    try {
      await api.post(`/admin/problems/reorder`, {
        Class,
        order: newOrder.map((p) => p.id),
        page,
        limit: MAX_LOAD_PROBLEM,
      });
    } catch {
    }
  };
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.display_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchVisible =
        filterVisible === "all" ||
        (filterVisible === "visible" && p.problem_visible) ||
        (filterVisible === "hidden" && !p.problem_visible);
      return matchSearch && matchVisible;
    });
  }, [problems, searchQuery, filterVisible]);

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-full text-gray-600 bg-[#f5f5f5]">
        <div className="loader mb-3"></div>
        <p className="text-sm font-mono text-[#007acc]">Đang tải dữ liệu...</p>
      </div>
    );

  return (
    <div className="flex flex-col h-full bg-white font-mono">
      <div className="bg-[#f3f3f3] border-b border-[#e0e0e0] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#1e1e1e]">
          <i className="fas fa-code text-[#007acc]" />
          <span className="font-semibold">Bài tập ›</span>
          <span className="text-[#666]">{Title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/admin/problem/${Class}/new`)}
            className="flex items-center gap-2 bg-[#007acc] hover:bg-[#0a84d0] text-white px-3 py-1.5 text-xs rounded"
          >
            <i className="fas fa-plus"></i> <span>Tạo bài tập</span>
          </button>
          <button
            onClick={() => router.push(`/admin/problem/${Class}/import`)}
            className="flex items-center gap-2 bg-[#e0e0e0] hover:bg-[#d6d6d6] text-[#1e1e1e] px-3 py-1.5 text-xs rounded"
          >
            <i className="fas fa-download text-[#007acc]"></i> <span>Thêm nguồn khác</span>
          </button>
        </div>
      </div>

      <div className="bg-[#fafafa] border-b border-[#e0e0e0] px-4 py-3 flex items-center gap-3">
        <div className="flex-1 relative">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[#888888] text-xs"></i>
          <input
            type="text"
            placeholder="Tìm kiếm bài tập..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white text-[#1e1e1e] pl-9 pr-3 py-1.5 text-sm border border-[#d0d0d0] rounded focus:border-[#007acc] focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1">
          <select 
            value={MAX_LOAD_PROBLEM}
            onChange={(e)=>setMaxLoadProblem(Number(e.target.value))}
            className="text-xs px-3 py-1.5 border rounded-md border-[#ccc]">
            <option value="8">8 problem</option>
            <option value="12">12 problem</option>
            <option value="24">24 problem</option>
            <option value="58">58 problem</option>
          </select>
          {["all", "visible", "hidden"].map((v) => (
            <button
              key={v}
              onClick={() => {
                setFilterVisible(v as typeof filterVisible);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${
                filterVisible === v
                  ? "bg-[#007acc]/20 text-[#007acc] font-semibold"
                  : "text-[#666] hover:text-[#1e1e1e]"
              }`}
            >
              {v === "all" && `Tất cả (${problems.length})`}
              {v === "visible" && "Hiện"}
              {v === "hidden" && "Ẩn"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <ProblemList
          problems={filteredProblems}
          page={page}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleVisible={toggleVisible}
          onToggleGroupVisible={toggleGroupVisible}
          onReorder={handleReorder}
          onSaveLimit={saveLimit}
          MAX_LOAD_PROBLEM={MAX_LOAD_PROBLEM}
        />
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
                  <ChevronFirst className="rtl:rotate-180" />
                </Button>
              </PaginationItem>

              <PaginationItem>
                <Button
                  variant="ghost"
                  mode="icon"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="rtl:rotate-180" />
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
                  <ChevronRight className="rtl:rotate-180" />
                </Button>
              </PaginationItem>

              <PaginationItem>
                <Button
                  variant="ghost"
                  mode="icon"
                  disabled={page === totalPages}
                  onClick={() => setPage(totalPages)}
                >
                  <ChevronLast className="rtl:rotate-180" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
