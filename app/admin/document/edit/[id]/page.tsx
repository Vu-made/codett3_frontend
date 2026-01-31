"use client";

import { useEffect, useState, useCallback } from "react";
import MarkdownEditor from "@/components/MarkdownEditor";
import api from "@/lib/api";
import clsx from "clsx";
import { useParams, useRouter } from "next/navigation";
import {
  Sortable,
  SortableItem,
  SortableItemHandle,
} from "@/components/ui/sortable";
import { toast } from "sonner";

interface Chapter {
  id: string;
  title: string;
  content: string;
}

interface Documents {
  id: number;
  title: string;
  content: Chapter[];
  created_at: string;
}

export default function EditDocument() {
  const router = useRouter();
  const { id } = useParams();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState<Documents>({
    id: 0,
    title: "",
    content: [],
    created_at: new Date().toISOString(),
  });

  useEffect(() => {
    const getInfoDocument = async () => {
      try {
        setLoading(true);
        const res = await api.get<Documents>(`/admin/documents/${id}`);
        const withIds: Chapter[] = res.data.content.map((c: Chapter) => ({
          id: c.id || crypto.randomUUID(),
          title: c.title,
          content: c.content,
        }));
        setDocument({ ...res.data, content: withIds });
      } catch (err) {
        console.error("Lỗi lấy thông tin document:", err);
        toast.error("Không thể tải tài liệu!", { position: "top-center" });
      } finally {
        setLoading(false);
      }
    };
    getInfoDocument();
  }, [id]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await api.put(`/admin/documents/${document.id}/update`, document);
      toast.success("Lưu tài liệu thành công!", { position: "top-center" });
      // router.push("/admin/documents");
    } catch (err) {
      console.error("Lỗi khi lưu:", err);
      toast.error("❌ Không thể lưu tài liệu!", { position: "top-center" });
    } finally {
      setSaving(false);
    }
  }, [document]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

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

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#fafafa] text-[#555] font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#ccc] border-t-[#0078d4]" />
          <p className="text-sm text-[#777]">Đang tải tài liệu...</p>
        </div>
      </div>
    );

  return (
    <div className="h-full flex flex-col bg-[#fafafa] text-[#1e1e1e]">
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
            {saving ? "Đang lưu..." : "Lưu tài liệu (ctrl+s)"}
          </button>
        </div>
      </header>

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
                  onChange={(value) => updateChapter(c.id, "content", value)}
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
