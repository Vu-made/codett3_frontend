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

type Post = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  author?: string | null;
  comments?: number ;
  likes? : string[];
};

export default function VSCodeDashboard() {
  const router = useRouter();
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const { profile } = useProfile();

  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = useCallback(async (currentPage: number) => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchPosts(page);
  }, [page,fetchPosts]);

  useEffect(() => {
    if (!loaderRef.current || !hasMore || loading) return;

    const node = loaderRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loading && page < totalPages) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(node);
    return () => observer.unobserve(node);
  }, [hasMore, loading, page, totalPages]);


  const activities = [
    { action: "Commit", detail: "Fix auth bug", time: "10m", icon: GitBranch },
    { action: "Update", detail: "Package.json", time: "1h", icon: FileText },
    { action: "Deploy", detail: "Production", time: "3h", icon: TrendingUp },
  ];

  if (loading && posts.length === 0)
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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_25rem] gap-6">
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
                      <button onClick={
                        async ()=>{
                          const res = await api.put(`/post/hand_like?post_id=${post.id}`) ;
                          const data = res.data ;
                          setPosts((prevPosts) =>
                            prevPosts.map((p) =>
                              p.id === post.id
                                ? { ...p, likes: data }
                                : p
                            )
                          );
                        }
                      } className="flex items-center gap-1 hover:text-[#e45649] transition-colors cursor-pointer">
                        <Heart className={`w-4 h-4 ${
                            post.likes?.includes(profile?.username || "") ? "text-[#e45649] fill-[#e45649]" : ""
                          }`} />
                        <span className="text-xs">
                          {post.likes?.length || 0}
                        </span>
                      </button>
                      <button
                        onClick={() => router.push(`/post/${post.id}`)}
                        className="flex items-center gap-1 hover:text-[#007acc] transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs">
                          {post.comments || 0}
                        </span>
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
                    <p className="text-sm font-mono text-[#007acc]">Đang tải dữ liệu...</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 sticky top-0 self-start">
            <div className="bg-white border border-[#d4d4d4] shadow-sm">
              <div className="px-4 py-3 border-b border-[#d4d4d4] flex items-center justify-between bg-[#fafafa]">
                <h2 className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#007acc]" />
                  Hoạt động
                </h2>
                <Plus className="w-4 h-4 text-[#6a6a6a] cursor-pointer" />
              </div>
              <div className="divide-y divide-[#ececec]">
                {activities.map((activity, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-3 hover:bg-[#f3f3f3] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <activity.icon className="w-4 h-4 text-[#007acc] mt-1" />
                      <div>
                        <div className="text-sm font-medium">
                          {activity.action}
                        </div>
                        <div className="text-xs text-[#6a6a6a] mt-0.5">
                          {activity.detail}
                        </div>
                        <div className="text-[10px] text-[#9a9a9a] mt-1 uppercase font-bold">
                          {activity.time} ago
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border border-dashed border-[#ccc] rounded text-center">
              <p className="text-xs text-[#9a9a9a]">CodeTT3 Dashboard v2.0.4</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
