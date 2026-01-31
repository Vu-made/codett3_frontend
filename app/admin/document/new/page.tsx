"use client";

import { useState } from "react";
import MarkdownEditor from "@/components/MarkdownEditor";
import api from "@/lib/api";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import {
  Sortable,
  SortableItem,
  SortableItemHandle,
} from "@/components/ui/sortable";

interface Chapter {
  id: string;
  title: string;
  content: string;
}

interface Documents {
  title: string;
  content: Chapter[];
  created_at: string;
}

export default function CreateNewDocument() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [document, setDocument] = useState<Documents>({
    title: "Tài liệu mới",
    content: [
      {
        id: crypto.randomUUID(),
        title: "Chương 1",
        content: "# Chương 1\nNội dung chương 1...",
      },
    ],
    created_at: new Date().toISOString(),
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("/admin/documents/create", document);
      router.push("/admin/documents");
    } catch (err) {
      console.error("Lỗi khi lưu:", err);
      alert("Không thể lưu tài liệu. Vui lòng thử lại!");
    } finally {
      setSaving(false);
    }
  };

  const addChapter = () => {
    setDocument((prev) => ({
      ...prev,
      content: [
        ...prev.content,
        {
          id: crypto.randomUUID(),
          title: `Chương ${prev.content.length + 1}`,
          content: "# Chương mới...",
        },
      ],
    }));
  };

  const handleReorder = (newOrder: Chapter[]) => {
    setDocument((prev) => ({
      ...prev,
      content: newOrder,
    }));
  };

  const deleteChapter = (chapterId: string) => {
    setDocument((prev) => ({
      ...prev,
      content: prev.content.filter((ch) => ch.id !== chapterId),
    }));
  };

  const updateChapter = (
    chapterId: string,
    field: "title" | "content",
    value: string
  ) => {
    setDocument((prev) => ({
      ...prev,
      content: prev.content.map((ch) =>
        ch.id === chapterId ? { ...ch, [field]: value } : ch
      ),
    }));
  };

  return (
    <div className="h-full flex flex-col bg-[#fafafa] text-[#1e1e1e]">
      {/* HEADER */}
      <header className="flex items-center justify-between px-5 py-1 border-b border-[#e0e0e0] bg-[#f5f5f5] sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/admin/documents`)}
            className="flex items-center gap-1 text-sm text-[#444] hover:text-[#0078d4] transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Quay lại
          </button>
          <span className="text-[#bdbdbd]">|</span>
          <span className="font-medium text-sm text-[#616161] text-wrap">
            {document.title || "Untitled Document"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={addChapter}
            className="px-3 py-1 text-sm font-medium border border-[#dcdcdc] rounded-md hover:bg-[#f0f0f0] transition"
          >
            + Thêm chương
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={clsx(
              "px-4 py-1 text-sm font-medium rounded-md transition",
              saving
                ? "bg-[#cccccc] text-[#777] cursor-not-allowed"
                : "bg-[#0078d4] hover:bg-[#006cbe] text-white"
            )}
          >
            {saving ? "Đang lưu..." : "Tạo tài liệu"}
          </button>
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        <main className="w-full h-full flex flex-col overflow-y-auto">
          <div className="px-8 py-2 border-b border-[#ccc] bg-[#f5f5f5] border-r">
            <input
              className="text-xl font-semibold w-full bg-transparent border-none outline-none placeholder-[#aaa]"
              value={document.title}
              onChange={(e) =>
                setDocument((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Nhập tiêu đề tài liệu..."
            />
          </div>

          <div className="w-full h-full flex flex-col gap-6 p-6 border-r border-[#ccc] overflow-auto scroll-smooth">
            {document.content.map((c) => (
              <section
                key={c.id}
                id={c.id}
                className="border border-[#ccc] bg-white hover:shadow-md transition scroll-mt-5"
              >
                <header className="flex justify-between items-center px-5 py-3 border-b border-[#ccc] bg-[#fafafa]">
                  <input
                    className="text-base font-semibold flex-1 bg-transparent border-none outline-none"
                    value={c.title}
                    onChange={(e) =>
                      updateChapter(c.id, "title", e.target.value)
                    }
                    placeholder="Tiêu đề chương..."
                  />
                  <button
                    onClick={() => deleteChapter(c.id)}
                    className="text-[#d13438] hover:text-[#a5262a] transition text-sm"
                  >
                    Xóa
                  </button>
                </header>
                <MarkdownEditor
                  height="480px"
                  value={c.content}
                  onChange={(value) =>
                    updateChapter(c.id, "content", value)
                  }
                />
              </section>
            ))}
            {document.content.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center text-[#888]">
                <p className="text-lg mb-3 font-medium">Chưa có chương nào</p>
                <button
                  onClick={addChapter}
                  className="px-4 py-2 bg-[#0078d4] text-white rounded-md hover:bg-[#006cbe] transition"
                >
                  + Thêm chương đầu tiên
                </button>
              </div>
            )}
          </div>
        </main>

        {/* SIDEBAR */}
        <aside className="w-64 border-l border-[#ccc] bg-[#f8f8f8] overflow-y-auto">
          <div className="px-4 py-3 border-b border-[#ccc] bg-[#f5f5f5] font-semibold text-sm text-[#444] uppercase tracking-wide">
            Mục lục
          </div>
          <nav className="p-3 space-y-1">
            {document.content.length === 0 ? (
              <p className="text-xs text-[#aaa] italic">Chưa có chương nào</p>
            ) : (
              <Sortable
                value={document.content}
                onValueChange={handleReorder}
                getItemValue={(item) => item.id}
              >
                {document.content.map((c, index) => (
                  <SortableItem
                    key={c.id}
                    value={c.id}
                    className="flex items-center rounded-md text-sm text-[#444] hover:bg-[#e8f2fc] hover:text-[#0078d4] truncate transition cursor-grab"
                  >
                    <a
                      href={`#${c.id}`}
                      className="flex-1 truncate px-1 py-2 flex gap-2"
                    >
                      <SortableItemHandle>
                        <i className="fas fa-grip-vertical cursor-grab" />
                      </SortableItemHandle>
                      {index + 1}. {c.title}
                    </a>
                  </SortableItem>
                ))}
              </Sortable>
            )}
          </nav>
        </aside>
      </div>
    </div>
  );
}
