"use client";

import React, { useEffect, useMemo, useState } from "react";
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

interface Post {
  id: string;
  title: string;
  author: string;
  tags: string[];
  content: string;
  created_at: string;
  updated_at?: string;
}

type FilterStatus = "all" | "tagged" | "untagged";

const PAGE_SIZE = 6;

export default function PostsManager() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get("/admin/posts");
        setPosts(res.data as Post[]);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleEdit = (id: string) => router.push(`/admin/post/edit/${id}`);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xoá bài viết này không?")) return;
    try {
      await api.delete(`admin/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
    }
  };

  const filteredPosts = useMemo(() => {
    return posts
      .slice()
      .reverse()
      .filter((p) => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
          filterStatus === "all" ||
          (filterStatus === "tagged" && p.tags.length > 0) ||
          (filterStatus === "untagged" && p.tags.length === 0);
        return matchesSearch && matchesFilter;
      });
  }, [posts, searchQuery, filterStatus]);

  const totalPages = Math.ceil(filteredPosts.length / PAGE_SIZE);
  const paginatedPosts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredPosts.slice(start, start + PAGE_SIZE);
  }, [filteredPosts, page]);

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
          <i className="fas fa-newspaper text-[#007acc]" />
          <span className="font-semibold">Bài viết</span>
          <span className="text-[#aaaaaa]">›</span>
          <span className="text-[#666666] text-sm">Quản lý</span>
        </div>
        <button
          onClick={() => router.push("/admin/post/new")}
          className="flex items-center gap-2 bg-[#007acc] hover:bg-[#0a84d0] text-white px-3 py-1.5 text-xs rounded transition-colors"
        >
          <i className="fas fa-plus"></i>
          <span>Bài viết mới</span>
        </button>
      </div>

      <div className="bg-[#fafafa] border-b border-[#e0e0e0] px-4 py-3 flex items-center gap-3">
        <div className="flex-1 relative">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[#888] text-xs"></i>
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
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
            { label: `Tất cả (${posts.length})`, value: "all" },
            { label: "Có tag", value: "tagged" },
            { label: "Không tag", value: "untagged" },
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
        {paginatedPosts.length === 0 ? (
          <div className="text-center text-[#888] mt-12">
            <i className="fas fa-inbox text-4xl opacity-50 mb-3"></i>
            <p className="text-sm">
              {searchQuery || filterStatus !== "all"
                ? "Không tìm thấy bài viết nào phù hợp."
                : "Chưa có bài viết nào. Hãy tạo bài viết đầu tiên của bạn!"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {paginatedPosts.map((post) => (
              <ContextMenu key={post.id}>
                <ContextMenuTrigger>
                  <div className="flex items-center justify-between border border-[#ddd] rounded-lg px-4 py-3 bg-white hover:bg-[#f8f9fa] shadow-sm transition-all cursor-pointer">
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          onClick={() => handleEdit(post.id)}
                          className="font-semibold text-[#0451a5] hover:underline truncate"
                        >
                          {post.title}
                        </h3>
                        <span className="text-xs text-[#666]">
                          — {post.author}
                        </span>
                      </div>
                      <div className="text-xs text-[#555] mt-1 flex flex-wrap gap-x-6">
                        <span>
                          <i className="far fa-calendar-alt mr-1"></i>
                          {new Date(post.created_at).toLocaleString("vi-VN")}
                        </span>
                        {post.updated_at && (
                          <span>
                            <i className="far fa-edit mr-1"></i>
                            Cập nhật:{" "}
                            {new Date(post.updated_at).toLocaleString("vi-VN")}
                          </span>
                        )}
                      </div>
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {post.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="bg-[#e3f2fd] text-[#1565c0] text-xs px-2 py-0.5 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <button
                        onClick={() => handleDelete(post.id)}
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
                    onClick={() => handleEdit(post.id)}
                    className="px-3 py-2 hover:bg-[#f0f0f0]"
                  >
                    <i className="fas fa-edit text-[#007acc] w-4 mr-1"></i> Chỉnh sửa
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    onClick={() => handleDelete(post.id)}
                    className="px-3 py-2 text-[#a31515] hover:bg-[#ffebee]"
                  >
                    <i className="fas fa-trash w-4 mr-1"></i> Xoá bài viết
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
