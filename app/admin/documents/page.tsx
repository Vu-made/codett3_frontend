"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Sortable,
  SortableItem,
  SortableItemHandle,
} from "@/components/ui/sortable";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/base-tooltip";

interface DocumentItem {
  id: string;
  title: string;
  created_at: string;
  author: string;
  visible: boolean;
  content: { title: string; content: string }[];
}

export default function DocumentManager() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await api.get("/admin/documents/");
        setDocuments(res.data || []);
      } catch (err) {
        console.error("Lỗi khi tải danh sách tài liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const handleEdit = (id: string) => router.push(`/admin/document/edit/${id}`);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này không?")) return;
    try {
      await api.delete(`/admin/documents/${id}/delete`);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Xóa thất bại!", err);
    }
  };

  const toggleVisible = async (id: string) => {
    try {
      const res = await api.post(`/admin/documents/${id}/toggle_visible`);
      setDocuments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, visible: res.data.visible } : d))
      );
    } catch {
      alert("Không thể thay đổi trạng thái hiển thị!");
    }
  };

  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-full text-gray-600 bg-[#f5f5f5]">
        <div className="loader mb-3"></div>
        <p className="text-sm font-mono text-[#007acc]">Đang tải dữ liệu...</p>
      </div>
    );

  return (
    <div className="flex flex-col h-full bg-white font-mono">
      {/* Header */}
      <div className="bg-[#f3f3f3] border-b border-[#e0e0e0] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#1e1e1e]">
          <i className="fas fa-book text-[#007acc]" />
          <span className="font-semibold">Tài liệu</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/admin/document/new`)}
            className="flex items-center gap-2 bg-[#007acc] hover:bg-[#0a84d0] text-white px-3 py-1.5 text-xs transition-colors rounded"
          >
            <i className="fas fa-plus"></i> <span>Tài liệu mới</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#fafafa] border-b border-[#e0e0e0] px-4 py-3 flex items-center gap-3">
        <div className="flex-1 relative">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[#888888] text-xs"></i>
          <input
            type="text"
            placeholder="Tìm kiếm tài liệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#ffffff] text-[#1e1e1e] pl-9 pr-3 py-1.5 text-sm border border-[#d0d0d0] rounded focus:border-[#007acc] focus:outline-none"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredDocs.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            Không có tài liệu nào phù hợp.
          </div>
        ) : (
          <Sortable
            value={filteredDocs}
            getItemValue={(d) => d.id}
            onValueChange={(newOrder) => {
              setDocuments(newOrder);
              const payload = { order: newOrder.map((d) => d.id) };
              api.post(`/admin/documents/reorder`, payload);
            }}
            className="flex flex-col gap-1"
          >
            {filteredDocs.map((doc, index) => (
              <SortableItem
                key={doc.id}
                value={doc.id}
                className="flex items-center justify-between gap-3 bg-white border border-[#ddd] rounded px-3 py-2 hover:bg-[#f9f9f9] transition-all"
              >
                {/* Drag handle */}
                <div className="flex items-center gap-2 w-10 text-[#999]">
                  <SortableItemHandle>
                    <i className="fas fa-grip-vertical cursor-grab" />
                  </SortableItemHandle>
                  <span className="text-xs text-[#555]">{index + 1}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[#0451a5] truncate">
                    {doc.title}
                  </div>
                  <div className="text-xs text-[#267f99] truncate">
                    {doc.author}
                  </div>
                </div>

                {/* Meta */}
                <div className="flex flex-col text-right w-44">
                  <div className="text-xs text-[#666]">
                    {new Date(doc.created_at).toLocaleString("vi-VN", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="text-xs text-[#007acc]">
                    {doc.content?.length ?? 0} chương
                  </div>
                </div>

                {/* Toggle visible */}
                <div className="w-16 flex justify-center">
                  <Tooltip>
                    <TooltipTrigger>
                      <div
                        onClick={() => toggleVisible(doc.id)}
                        className={`text-xs px-2 py-1 rounded ${
                          doc.visible
                            ? "bg-[#007acc]/20 text-[#007acc]"
                            : "bg-[#ccc]/30 text-[#888]"
                        }`}
                      >
                        {doc.visible ? "V" : "H"}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white! border border-[#ccc] text-xs">
                      {doc.visible
                        ? "Tài liệu đang hiển thị với học sinh"
                        : "Tài liệu hiện đang bị ẩn"}
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Edit + Delete */}
                <div className="flex gap-2 w-16 justify-end text-[#666]">
                  <Tooltip>
                    <TooltipTrigger>
                      <div
                        onClick={() => handleEdit(doc.id)}
                        className="hover:text-[#007acc]"
                      >
                        <i className="fas fa-edit" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white! border border-[#ccc] text-xs">
                      Chỉnh sửa tài liệu
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger>
                      <div
                        onClick={() => handleDelete(doc.id)}
                        className="hover:text-[#a31515]"
                      >
                        <i className="fas fa-trash" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white! border border-[#ccc] text-xs">
                      Xóa tài liệu này
                    </TooltipContent>
                  </Tooltip>
                </div>
              </SortableItem>
            ))}
          </Sortable>
        )}
      </div>
    </div>
  );
}
