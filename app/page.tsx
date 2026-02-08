"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  FileText,
  GitBranch,
  Clock,
  TrendingUp,
  MessageSquare,
  Share2,
  Heart,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import MarkdownScreen from "@/components/MarkdownScreen";
import api from "@/lib/api";
import { useProfile } from "@/hooks/useProfile";
import UserList from "@/components/UserList";
import dayjs from "dayjs";
import "dayjs/locale/vi";

type Post = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  author?: string | null;
  comments?: number;
  likes?: string[];
};

export default function VSCodeDashboard() {
  const router = useRouter();
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const { profile } = useProfile();

  const [posts, setPosts] = useState<Post[]>([]);

  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = useCallback(async (currentPage: number) => {
    try {
      setLoadingPosts(true);
      const res = await api.get("/post/list/", { params: { page: currentPage, size: 5 } });
      const { items, pages } = res.data;

      setTotalPages(pages);
      if (items?.length) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newPosts = items.filter((p: Post) => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });
        if (currentPage >= pages) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.log(err);
      setError("Không thể tải bài viết.");
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  const [hasMore, setHasMore] = useState(true);


  useEffect(() => {
    fetchPosts(page);
  }, [page, fetchPosts]);

  useEffect(() => {
    if (!loaderRef.current || !hasMore || loadingPosts) return;

    const node = loaderRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loadingPosts && page < totalPages) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(node);
    return () => observer.unobserve(node);
  }, [hasMore, loadingPosts, page, totalPages]);


  const upcomingEvents = [
    {
      name: "Cuộc thi CodeTT3 Challenge #1",
      description: "Giải thuật và lập trình sáng tạo",
      date: "2026-02-10T09:00:00",
      icon: TrendingUp,
    },
    {
      name: "Livestream: Build App với FastAPI",
      description: "Hướng dẫn backend cơ bản đến nâng cao",
      date: "2026-02-05T19:30:00",
      icon: FileText,
    },
    {
      name: "Workshop: UI/UX trong VSCode Style",
      description: "Thiết kế giao diện giống VSCode cho Next.js",
      date: "2026-02-03T15:00:00",
      icon: GitBranch,
    },
  ];

  if (loadingPosts && posts.length === 0)
    return (
      <div className="flex flex-col justify-center items-center h-full text-gray-600 bg-[#f5f5f5]">
        <div className="loader mb-3"></div>
        <p className="text-sm font-mono text-[#007acc]">Đang tải dữ liệu...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        {error}
      </div>
    );

  return (
    <div className="relative h-full w-full bg-[#f3f3f3] text-[#383a42] font-mono">
      <main className="p-6 w-full h-full mx-auto overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.5fr_1fr] gap-6 max-w-full">
          {/* Left Column - Events */}
          <div className="space-y-6 lg:sticky top-0 self-start">
            <div className="bg-white border border-[#d4d4d4] shadow-sm">
              <div className="px-4 py-3 border-b border-[#d4d4d4] flex items-center justify-between bg-[#fafafa]">
                <h2 className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#007acc]" />
                  Sự kiện sắp diễn ra
                </h2>
                <Plus className="w-4 h-4 text-[#6a6a6a] cursor-pointer" />
              </div>
              <div className="divide-y divide-[#ececec]">
                {upcomingEvents.map((event, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-3 hover:bg-[#f3f3f3] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <event.icon className="w-4 h-4 text-[#007acc] mt-1" />
                      <div>
                        <div className="text-sm font-medium text-[#007acc]">
                          {event.name}
                        </div>
                        <div className="text-xs text-[#6a6a6a] mt-0.5">
                          {event.description}
                        </div>
                        <div className="text-[10px] text-[#9a9a9a] mt-1 uppercase font-bold">
                          {dayjs(event.date)
                            .locale("vi")
                            .format("HH:mm [Thứ] d, DD/MM")}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border border-dashed border-[#ccc] rounded text-center">
              <p className="text-xs text-[#9a9a9a]">
                CodeTT3 {new Date().getFullYear()}
              </p>
            </div>
          </div>

          {/* Middle Column - Posts */}
          <div className="w-full space-y-6">
            <div className="bg-white border border-[#ccc] p-6 shadow-sm flex items-center justify-between">
              <div>
                <h1 className="text-[#007acc] text-2xl font-bold">
                  Chào mừng đến với CodeTT3 ^^
                </h1>
                <p className="text-[#6a6a6a] text-xs mt-1">
                  Hiện có {posts.length} bài viết hiển thị.
                </p>
              </div>
              <div className="text-4xl font-bold text-[#007acc] opacity-20">
                2026
              </div>
            </div>

            <div className="flex flex-col gap-10">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white min-h-[40vh] border border-[#d4d4d4] hover:border-[#007acc] hover:shadow-md transition-all duration-200 flex flex-col group relative"
                >
                  <div className="px-4 py-2 border-b border-[#ececec] flex justify-between items-center bg-[#fafafa]">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#007acc]">
                      {post.author || "Ẩn danh"}
                    </span>
                    <span className="text-xs text-[#6a6a6a]">
                      {new Date(post.created_at).toLocaleString("vi-VN")}
                    </span>
                  </div>

                  <div className="p-4 flex-1">
                    <h3
                      onClick={() => router.push(`/comment/${post.id}`)}
                      className="font-bold text-lg mb-2 group-hover:text-[#007acc] cursor-pointer line-clamp-1"
                    >
                      {post.title}
                    </h3>
                    <MarkdownScreen content={post.content} />
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags?.map((tag) => (
                        <span
                          key={`${post.id}-${tag}`}
                          className="text-[11px] bg-[#f0f0f0] px-2 py-0.5 rounded text-[#6a6a6a]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="px-4 py-3 border-t border-[#ececec] flex items-center justify-between text-[#6a6a6a]">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={async () => {
                          const res = await api.put(`/post/hand_like?post_id=${post.id}`);
                          const data = res.data;
                          setPosts((prevPosts) =>
                            prevPosts.map((p) =>
                              p.id === post.id ? { ...p, likes: data } : p
                            )
                          );
                        }}
                        className="flex items-center gap-1 hover:text-[#e45649] transition-colors cursor-pointer"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            post.likes?.includes(profile?.username || "")
                              ? "text-[#e45649] fill-[#e45649]"
                              : ""
                          }`}
                        />
                        <span className="text-xs">
                          {post.likes?.length || 0}
                        </span>
                      </button>
                      <button
                        onClick={() => router.push(`/post/${post.id}`)}
                        className="flex items-center gap-1 hover:text-[#007acc] transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs">{post.comments || 0}</span>
                      </button>
                    </div>
                    <button className="hover:text-[#007acc]">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {hasMore && (
                <div
                  ref={loaderRef}
                  className="flex flex-col justify-center items-center h-full text-gray-600 bg-[#f5f5f5]"
                >
                  <div className="loader mb-3"></div>
                  <p className="text-sm font-mono text-[#007acc]">
                    Đang tải dữ liệu...
                  </p>
                </div>
              )}
            </div>
          </div>

          <UserList />
        </div>
      </main>
    </div>
  );
}
