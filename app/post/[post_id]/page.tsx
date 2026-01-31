"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Send, X, Smile, Loader2, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import UserComment from "@/components/UserComment";
import MarkdownScreen from "@/components/MarkdownScreen";
import type { EmojiClickData } from "emoji-picker-react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import Split from "react-split";
import UserAvatar from "@/components/Avatar";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

interface Comment {
  id: string;
  username: string;
  email: string;
  content: string;
  created_at: string;
  replied: number;
  likes?: string[];
  liked?: boolean;
}

interface FeedType {
  id: string;
  author: string;
  category: string;
  title: string;
  content: string;
  created_at: string;
  email: string;
  tags: string[];
}

function CommentPanel({
  onClose,
  value,
  onChange,
  textareaRef,
}: {
  onClose: () => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showInput, setShowInput] = useState(true);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { post_id } = useParams();

  const fetchComments = useCallback( async () => {
    try {
      setLoading(true);
      const res = await api.get(`/post/${post_id}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  },[post_id]);

  useEffect(() => {
    if (post_id) fetchComments();
  }, [post_id,fetchComments]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  const handleSubmit = async () => {
    if (!value.trim()) return;
    const tempId = Date.now().toString();
    const optimisticComment: Comment = {
      id: tempId,
      username: "Bạn",
      email: "",
      content: value.trim(),
      created_at: "2026-01-21 20:47:18.382 +0700",
      replied: 0,
    };
    setComments((prev) => [...prev, optimisticComment]);
    const contentToSubmit = value.trim();
    const fakeEvent = { target: { value: "" } } as unknown as React.ChangeEvent<HTMLTextAreaElement>;
    onChange(fakeEvent);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    try {
      setSubmitting(true);
      const res = await api.post(`/post/comments`, { post_id, content: contentToSubmit });
      setComments((prev) => prev.map((c) => (c.id === tempId ? res.data : c)));
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      const restoreEvent = { target: { value: contentToSubmit } } as unknown as React.ChangeEvent<HTMLTextAreaElement>;
      onChange(restoreEvent);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = Math.min(scrollHeight, 160) + "px";
      textarea.style.overflowY = scrollHeight > 160 ? "auto" : "hidden";
    }
    onChange(e);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const updated = value.substring(0, start) + emojiData.emoji + value.substring(end);
      const event = { target: { value: updated } } as unknown as React.ChangeEvent<HTMLTextAreaElement>;
      onChange(event);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emojiData.emoji.length, start + emojiData.emoji.length);
      }, 0);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node) && !buttonRef.current?.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full h-full bg-[#cdcdcd20] flex flex-col border-l border-[#e5e5e5]">
      <div className="flex justify-between items-center px-4 py-2 bg-[#eeeeee] border-b border-[#dcdcdc]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-[#6a6a6a]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6a6a6a]">
            Bình luận
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInput((prev) => !prev)}
            className="p-1 hover:bg-[#e1e1e1] rounded text-[#6a6a6a] transition-colors"
          >
            {showInput ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#e1e1e1] rounded text-[#6a6a6a] hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 scroll-smooth">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length > 0 ? (
          comments.map((c) => <UserComment 
              key={c.id} 
              comment={c}
              onDeleteComment={(id) => {
                setComments((prev) => prev.filter((x) => x.id !== id));
              }}
              refreshComments={fetchComments}
            />
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-xs">Chưa có bình luận nào.</p>
          </div>
        )}
      </div>

      {showInput && (
        <div className="p-3 bg-[#f6f6f6] border-t border-[#ccc] shadow-2xl">
          <div className="relative flex flex-col bg-white border border-[#ccc] rounded shadow-sm focus-within:border-[#007acc] focus-within:ring-1 focus-within:ring-[#007acc]/20 transition-all">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleInput}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Viết bình luận... (Shift + Enter để xuống dòng)"
              className="w-full p-2.5 text-sm bg-transparent outline-none resize-none min-h-5.5 max-h-40 text-[#333] placeholder-gray-400"
            />
            <div className="flex items-center justify-between px-2 pb-2">
              <div className="relative">
                <button
                  ref={buttonRef}
                  type="button"
                  onClick={() => setShowEmoji((p) => !p)}
                  className="p-1.5 text-gray-500 hover:text-[#007acc] hover:bg-gray-100 rounded transition-colors"
                >
                  <Smile className="w-4 h-4" />
                </button>
                {showEmoji && (
                  <div ref={pickerRef} className="absolute bottom-full left-0 mb-2 z-50 shadow-2xl">
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      searchDisabled
                      previewConfig={{ showPreview: false }}
                      width={280}
                      height={320}
                    />
                  </div>
                )}
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting || !value.trim()}
                className={`p-1.5 rounded-md transition-all ${
                  !value.trim()
                    ? "text-gray-300"
                    : "text-[#007acc] hover:bg-blue-50 active:scale-95"
                }`}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VSCodeDashboard() {
  const { post_id } = useParams();
  const [feed, setFeed] = useState<FeedType | null>(null);
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    const getPost = async () => {
      try {
        const res = await api.get<FeedType>(`/post?post_id=${post_id}`);
        setFeed(res.data);
      } catch {}
    };
    if (post_id) getPost();
  }, [post_id]);

  if (!feed)
    return (
      <div className="flex flex-col justify-center items-center h-full text-gray-600 bg-[#f5f5f5]">
        <div className="loader mb-3"></div>
        <p className="text-sm font-mono text-[#007acc]">Đang tải dữ liệu...</p>
      </div>
    );

  return (
    <div className="h-full w-full bg-[#fbfbfb] text-[#24292e] overflow-hidden">
      <Split
        sizes={[60, 40]}
        minSize={[400, 300]}
        gutterSize={2}
        gutterAlign="center"
        direction="horizontal"
        cursor="col-resize"
        className="flex h-full"
      >
        <div className="h-full overflow-y-auto custom-scrollbar">
          <div className="w-full mx-auto p-10">
            <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6 uppercase tracking-widest">
              <span>Posts</span>
              <span>/</span>
              <span className="text-[#007acc] font-semibold">{feed.title}</span>
            </nav>
            <h1 className="text-3xl font-bold mb-4 leading-tight text-[#1f2328]">{feed.title}</h1>
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200">
              <UserAvatar email={feed.email}/>
              <div>
                <p className="text-sm font-semibold">{feed.author}</p>
                <p className="text-xs text-gray-500">{new Date(feed.created_at).toLocaleString("vi-VN")}</p>
              </div>
            </div>
            <div className="prose prose-slate max-w-none leading-relaxed text-[15px]">
              <MarkdownScreen content={feed.content} />
            </div>
            {feed.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2">
                {feed.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[12px] font-medium bg-[#e5e5e5] hover:bg-[#d1d1d1] px-3 py-1 rounded-full text-[#434343] transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <CommentPanel
          onClose={() => router.push("/")}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          textareaRef={textareaRef}
        />
      </Split>
    </div>
  );
}
