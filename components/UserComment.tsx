"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  ChevronDown,
  ChevronRight,
  Loader2,
  Heart,
  Edit3,
  Trash2,
  Flag,
  X,
  Check,
} from "lucide-react";
import api from "@/lib/api";
import UserAvatar from "./Avatar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/base-tooltip";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "./ui/base-context-menu";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";

export interface Comment {
  id: string;
  username: string;
  email: string;
  content: string;
  created_at: string;
  replied: number;
  likes?: string[];
  liked?: boolean;
}

interface UserCommentProps {
  comment: Comment;
  level?: number;
  refreshComments: () => Promise<void>;
  onDeleteComment?: (id: string) => void;
}

export default function UserComment({
  comment,
  level = 0,
  refreshComments,
  onDeleteComment,
}: UserCommentProps) {
  const [replies, setReplies] = useState<Comment[]>([]);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [sending, setSending] = useState(false);
  const [liked, setLiked] = useState(comment.liked);
  const [likes, setLikes] = useState(comment.likes?.length || 0);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const { profile } = useProfile();

  useEffect(() => {
    if (showReplyInput && textareaRef.current) textareaRef.current.focus();
  }, [showReplyInput]);

  useEffect(() => {
    if (editing && editRef.current) editRef.current.focus();
  }, [editing]);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const res = await api.post<Comment>("/post/comments", {
        replied: comment.id,
        content: replyText.trim(),
      });
      setReplies((prev) => [...prev, res.data]);
      setReplyText("");
      setShowReplyInput(false);
      setShowReplies(true);
      toast.success("Đã phản hồi bình luận.");
    } catch {
      toast.error("Lỗi khi gửi phản hồi.");
    } finally {
      setSending(false);
    }
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    setSending(true);
    try {
      await api.put(`/post/comments/${comment.id}`, { content: editText.trim() });
      comment.content = editText.trim();
      setEditing(false);
      toast.success("Đã lưu chỉnh sửa.");
    } catch {
      toast.error("Không thể lưu thay đổi.");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Xóa bình luận này và các phản hồi của nó?")) return;
    await api.delete(`/post/comments/${comment.id}`);
    onDeleteComment?.(comment.id);
    toast.success("Đã xóa bình luận.");
  };

  const handleReport = async () => {
    await api.post(`/post/comments/${comment.id}/report`);
    toast.info("Đã báo cáo bình luận này.");
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "0px";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
    setReplyText(e.target.value);
  };

  const handleToggleReplies = async () => {
    if (showReplies) return setShowReplies(false);
    setLoadingReplies(true);
    try {
      const res = await api.get<Comment[]>(`/post/comments/${comment.id}/replies`);
      setReplies(res.data);
      setShowReplies(true);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikes((p) => (newLiked ? p + 1 : p - 1));
    try {
      await api.post(`/post/comments/${comment.id}/like`);
    } catch {
      setLiked(!newLiked);
      setLikes((p) => (newLiked ? p - 1 : p + 1));
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  };

  const isNested = level > 0;

  return (
    <div className="w-full animate-in fade-in duration-300 text-[14px] relative">
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="flex gap-3 py-3 px-1 group">
            <div className="shrink-0 pt-1">
              <UserAvatar size={40} email={comment.email} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="transition-all duration-200 rounded-xl px-4 py-3 border border-transparent bg-white/90 hover:bg-white shadow-sm hover:shadow-md">
                <div className="flex justify-between items-center mb-1">
                  <p
                    className={`font-semibold text-sm ${
                      isNested ? "text-[#555]" : "text-[#333]"
                    }`}
                  >
                    {comment.username}
                  </p>
                </div>
                {editing ? (
                  <div className="mt-2">
                    <textarea
                      ref={editRef}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 rounded-md bg-[#f9fafb] focus:outline-none focus:ring-1 focus:ring-[#007acc]"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => setEditing(false)}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-3.5 h-3.5" /> Hủy
                      </button>
                      <button
                        onClick={handleEdit}
                        disabled={sending || !editText.trim()}
                        className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md ${
                          sending || !editText.trim()
                            ? "bg-gray-200 text-gray-400"
                            : "bg-[#007acc] text-white hover:bg-[#005fa3]"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" /> Lưu
                      </button>
                    </div>
                  </div>
                ) : (
                  <MarkdownScreen content={comment.content} />
                )}
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-600 border-t pt-2 border-gray-200">
                  <Tooltip>
                    <TooltipTrigger>
                      <span>{formatTime(comment.created_at)}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {new Date(comment.created_at).toLocaleString("vi-VN")}
                    </TooltipContent>
                  </Tooltip>
                  <button
                    onClick={() => setShowReplyInput((p) => !p)}
                    className="hover:text-[#007acc] font-medium transition"
                  >
                    {showReplyInput ? "✕ Hủy" : "↩ Trả lời"}
                  </button>
                  {comment.replied > 0 && (
                    <button
                      onClick={handleToggleReplies}
                      className="flex items-center gap-1 font-medium hover:text-[#007acc] transition"
                    >
                      {loadingReplies ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Đang tải...</span>
                        </>
                      ) : showReplies ? (
                        <>
                          <ChevronDown className="w-3 h-3" />
                          <span>Ẩn {comment.replied} phản hồi</span>
                        </>
                      ) : (
                        <>
                          <ChevronRight className="w-3 h-3" />
                          <span>{comment.replied} phản hồi</span>
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1 font-medium transition-all ${
                      liked ? "text-red-500 scale-105" : "text-gray-600 hover:text-red-500"
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 transition-transform ${
                        liked ? "fill-red-500 scale-110" : "scale-100"
                      }`}
                    />
                    <p>{likes}</p>
                  </button>
                </div>
                {showReplyInput && (
                  <div className="flex items-end gap-2 mt-3 pl-1">
                    <textarea
                      ref={textareaRef}
                      value={replyText}
                      onChange={handleInput}
                      placeholder="Viết phản hồi của bạn..."
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleReply();
                        }
                      }}
                      disabled={sending}
                      className="flex-1 text-sm bg-white border border-[#d4d4d4] p-2.5 resize-none rounded-md outline-none transition-all focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc]/30 disabled:opacity-60"
                    />
                    <button
                      onClick={handleReply}
                      disabled={sending || !replyText.trim()}
                      className={`p-2.5 rounded-md flex items-center justify-center transition-all ${
                        sending || !replyText.trim()
                          ? "bg-[#f2f2f2] text-gray-400 cursor-not-allowed"
                          : "bg-[#007acc] text-white hover:bg-[#005fa3]"
                      }`}
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>
              {showReplies && replies.length > 0 && (
                <div className="mt-3 pl-3 border-l border-[#e5e5e5] space-y-2 animate-in fade-in duration-300">
                  {replies.map((r) => (
                    <UserComment
                      key={r.id}
                      comment={r}
                      level={level + 1}
                      refreshComments={refreshComments}
                      onDeleteComment={(id) =>
                        setReplies((prev) => prev.filter((c) => c.id !== id))
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="z-50 min-w-36 rounded-md border border-gray-200 bg-white/95 backdrop-blur-sm shadow-lg text-sm text-gray-800 p-1 animate-in fade-in-0 zoom-in-95">
          {comment.username == profile?.username && (
            <ContextMenuItem
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-100 transition text-sm text-gray-700"
            >
              <Edit3 className="w-3.5 h-3.5 text-gray-600" /> Sửa
            </ContextMenuItem>
          )}
          <ContextMenuItem
            onClick={handleReport}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-100 transition text-sm text-gray-700"
          >
            <Flag className="w-3.5 h-3.5 text-orange-500" /> Báo cáo
          </ContextMenuItem>
          {comment.username === profile?.username  && (
            <>
              <ContextMenuSeparator className="my-1 h-px bg-gray-200" />
              <ContextMenuItem
                variant="destructive"
                onClick={handleDelete}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-red-600 hover:bg-red-50 transition text-sm"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" /> Xóa
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}

interface MarkdownScreenProps {
  content: string;
}

function MarkdownScreen({ content }: MarkdownScreenProps) {
  return (
    <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <pre className="rounded-md bg-[#f6f8fa] border border-[#e5e5e5] shadow-inner p-3 overflow-x-auto font-mono text-[13px] leading-5">
                <code className={`language-${match[1]}`} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="bg-[#eaeaea] text-[#222] rounded px-1 py-0.5 font-mono text-[13px]">
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
