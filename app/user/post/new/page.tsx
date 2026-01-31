"use client";

import React, { useState, useEffect, useCallback } from "react";
import MarkdownEditor from "@/components/MarkdownEditor";
import api from "@/lib/api";
import { Save, FileText, Tag, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminPostManager() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const handleSave = useCallback(async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Vui lòng nhập tiêu đề và nội dung!", {
        position: "top-center",
        duration: 1200,
      });
      return;
    }

    setSaving(true);
    const payload = { title, content, tags };

    try {
      await api.post(`/user/post/`, payload);
      toast.success("Tạo bài viết thành công!", {
        position: "top-center",
        duration: 1200,
      });
      router.back();
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error("Lưu bài viết thất bại!", {
        position: "top-center",
        duration: 1500,
      });
    } finally {
      setSaving(false);
    }
  }, [title, content, tags,router]);

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

  const addTag = () => {
    const newTag = tagInput.trim().toLowerCase();
    if (newTag && !tags.includes(newTag)) setTags([...tags, newTag]);
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  return (
    <div className="flex h-full w-full bg-[#f3f3f3] text-[#333] font-sans relative">
      <main className="w-full h-full flex flex-col bg-[#f9f9f9] text-[#333]">
        <div className="flex items-center justify-between px-5 py-2 border-b border-[#ddd] bg-[#ffffff] shadow-sm">
          <div className="flex items-center gap-2 text-sm text-[#555]">
            <FileText size={14} />
            <span>
                Tạo bài viết mới
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="px-3 py-1 text-sm bg-[#eee] hover:bg-[#ddd] rounded text-[#333]"
            >
              Quay lại
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm text-white transition ${
                saving
                  ? "bg-[#007acc]/70 cursor-not-allowed"
                  : "bg-[#007acc] hover:bg-[#005a9e]"
              }`}
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {saving ? "Đang lưu..." : "Lưu (Ctrl+S)"}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề bài viết..."
            className="w-full bg-white text-[#333] border border-[#ccc] rounded px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-[#007acc]"
          />

          <div className="bg-white border border-[#ddd] rounded-lg p-3">
            <label className="text-sm text-[#555] flex items-center gap-2 mb-2 font-medium">
              <Tag size={14} /> Thẻ (tags)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-sm"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
                placeholder="Thêm tag mới..."
                className="flex-1 border border-[#ccc] rounded px-2 py-1 text-sm focus:ring-1 focus:ring-[#007acc] outline-none"
              />
              <button
                onClick={addTag}
                className="bg-[#007acc] text-white text-sm px-3 py-1 rounded hover:bg-[#005a9e]"
              >
                Thêm
              </button>
            </div>
          </div>

          <MarkdownEditor
            value={content}
            onChange={setContent}
            height="480px"
            className="bg-white border border-[#ddd]"
          />
        </div>
      </main>
    </div>
  );
}
