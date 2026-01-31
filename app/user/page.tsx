"use client";

import { useEffect, useState } from "react";
import UserAvatar from "@/components/Avatar";
import api from "@/lib/api";
import {
  Pencil,
  Heart,
  MessageSquare,
  Share2,
  Trash2,
  Check,
  Copy,
  RefreshCw,
  PlusSquare,
  Edit,
  X,
  Save,
} from "lucide-react";
import HeatTable from "@/components/HeatTable";
import MarkdownScreen from "@/components/MarkdownScreen";
import { useRouter } from "next/navigation";

type Problem = { id: number; title: string; solved: boolean };
type Submission = { problem: string; result: string; time: string };

type UserProfile = {
  username: string;
  email: string;
  full_name?: string;
  timezone?: string;
  rating: number;
  solved: number;
  submissions: number;
  problems: Problem[];
  recentSubmissions: Submission[];
};

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

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [editData, setEditData] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingKey, setLoadingKey] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const getProfile = async () => {
    try {
      const res = await api.get("/user/profile_detail");
      setUser({
        ...res.data,
        problems: res.data.problems || [],
        recentSubmissions: res.data.recentSubmissions || [],
      });
    } catch {
      setError("Lỗi khi load user profile");
    }
  };

  const getApiKey = async () => {
    try {
      const res = await api.get("/apikey/me");
      setApiKey(res.data.api_key);
      localStorage.setItem("api_key", res.data.api_key);
    } catch {
      setApiKey(null);
      localStorage.removeItem("api_key");
    }
  };

  const createApiKey = async () => {
    setLoadingKey(true);
    try {
      const res = await api.post("/apikey/create");
      setApiKey(res.data.api_key);
      localStorage.setItem("api_key", res.data.api_key);
    } finally {
      setLoadingKey(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user/post/list/");
      setPosts(res.data.items || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const ListButtonProfile = [
    {
      icon: <Pencil className="w-4 h-4" />,
      function: () => {
        if (user) {
          setEditData({ ...user });
          setIsEditing(true);
        }
      },
    },
    { icon: <Heart className="w-4 h-4" />, function: () => {} },
    { icon: <MessageSquare className="w-4 h-4" />, function: () => {} },
    {
      icon: <PlusSquare className="w-4 h-4" />,
      function: () => {
        router.push("/user/post/new");
      },
    },
  ];

  const handleCopy = async () => {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSaveEdit = async () => {
    if (!editData) return;
    setSaving(true);
    try {
      const res = await api.put("/user/profile_detail", {
        full_name: editData.full_name,
        timezone: editData.timezone,
      });
      setUser((prev) => (prev ? { ...prev, ...res.data } : res.data));
      setIsEditing(false);
    } catch {
      alert("Lỗi khi lưu chỉnh sửa!");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    Promise.all([getProfile(), getApiKey()]);
  }, []);

  useEffect(() => {
    if (user?.username) fetchPosts();
  }, [user]);

  if (error)
    return (
      <div className="max-w-4xl mx-auto p-6 text-red-600">
        Lỗi khi load user profile: {error}
      </div>
    );

  if (!user)
    return (
      <div className="w-full flex flex-col justify-center items-center h-full text-gray-600 bg-[#f5f5f5]">
        <div className="loader mb-3"></div>
        <p className="text-sm font-mono text-[#007acc]">Đang tải dữ liệu...</p>
      </div>
    );

  const timezones = [
    "Asia/Ho_Chi_Minh",
    "Asia/Tokyo",
    "Asia/Bangkok",
    "Europe/London",
    "America/New_York",
    "UTC",
  ];

  return (
    <div className="w-full h-full overflow-auto text-[#333] font-sans">
      <div className="max-w-screen mx-auto pt-5 px-4 sm:px-10 lg:px-20 flex flex-col md:flex-row gap-8">
        <div className="md:w-1/4 w-full sticky top-4 self-start space-y-6">
          <div className="bg-white border border-[#d1d1d1] text-center">
            <div className="flex flex-col items-center p-6">
              <UserAvatar email={user.email} size={120} />

              {!isEditing ? (
                <div className="mt-3 space-y-1">
                  <h1 className="text-2xl font-semibold">{user.full_name}</h1>
                  <p className="text-sm text-[#333] font-medium">
                    {user.username || "Chưa có tên đầy đủ"}
                  </p>
                  {/* <p className="text-gray-500 text-sm">{user.email}</p> */}
                  <p className="text-xs text-gray-500">
                    Múi giờ: {user.timezone || "Asia/Ho_Chi_Minh"}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 w-full mt-2 text-left">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      Họ và tên
                    </label>
                    <input
                      className="border px-2 py-1 text-sm w-full"
                      value={editData?.full_name || ""}
                      onChange={(e) =>
                        setEditData((prev) =>
                          prev ? { ...prev, full_name: e.target.value } : prev
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      Múi giờ
                    </label>
                    <select
                      className="border px-2 py-1 text-sm w-full"
                      value={editData?.timezone || "Asia/Ho_Chi_Minh"}
                      onChange={(e) =>
                        setEditData((prev) =>
                          prev ? { ...prev, timezone: e.target.value } : prev
                        )
                      }
                    >
                      {timezones.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t flex w-full justify-center border-[#d1d1d1]">
              {!isEditing ? (
                ListButtonProfile.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => item.function()}
                    className="transition-colors duration-300 ease-in-out h-8 w-8 border-r last:border-r-0 border-[#d1d1d1] hover:bg-[#eaeaea] flex justify-center items-center text-sm text-gray-600"
                  >
                    {item.icon}
                  </button>
                ))
              ) : (
                <>
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="h-8 w-8 flex justify-center items-center border-r border-[#d1d1d1] hover:bg-[#e6ffe6] text-green-600 transition"
                  >
                    {saving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="h-8 w-8 flex justify-center items-center hover:bg-[#ffeaea] text-red-500 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* API Key */}
          <div className="bg-white border border-[#d4d4d4] p-4 rounded-none">
            <div className="text-[13px] text-[#1e1e1e] font-medium mb-3">
              API Key
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={apiKey || "Chưa có"}
                readOnly
                className="flex-1 text-[13px] px-2 py-1.25 border border-[#c8c8c8] bg-[#ffffff] text-[#333] rounded-none outline-none focus:border-[#007acc] transition-colors"
              />
              <button
                onClick={handleCopy}
                disabled={!apiKey}
                className="h-7.5 w-7.5 flex justify-center items-center border border-[#c8c8c8] bg-[#ffffff] hover:bg-[#eaeaea] transition-colors text-[#444] disabled:opacity-50"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={createApiKey}
                disabled={loadingKey}
                className="h-7.5 w-9 flex justify-center items-center text-[13px] bg-[#007acc] text-white rounded-none hover:bg-[#0d8ef0] transition-colors disabled:opacity-60"
              >
                {loadingKey ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : apiKey ? (
                  <RefreshCw className="w-4 h-4" />
                ) : (
                  "Tạo"
                )}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white border border-[#ccc] p-4">
            <h2 className="text-xs font-semibold text-[#333] uppercase tracking-wide mb-3 border-b border-[#e0e0e0] pb-1">
              Thống kê
            </h2>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-white border border-[#ccc] p-3 hover:border-[#0078d7] transition-colors">
                <p className="text-xl font-semibold text-[#1e1e1e]">
                  {user.solved}
                </p>
                <p className="text-xs text-[#555]">Bài đã giải</p>
              </div>

              <div className="bg-white border border-[#ccc] p-3 hover:border-[#0078d7] transition-colors">
                <p className="text-xl font-semibold text-[#1e1e1e]">
                  {user.submissions}
                </p>
                <p className="text-xs text-[#555]">Lượt nộp</p>
              </div>

              <div className="col-span-2 bg-white border border-[#ccc] p-3 mt-1 hover:border-[#0078d7] transition-colors">
                <p className="text-xs text-[#555]">
                  Xếp hạng:{" "}
                  <span className="font-medium text-[#0078d7]">
                    {user.rating}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="md:w-3/4 w-full space-y-6">
          <HeatTable className="p-5 text-xl overflow-auto w-full" />

          {/* Posts */}
          <div className="py-5">
            {loading ? (
              <div className="flex flex-col justify-center items-center h-full text-gray-600 bg-transparent">
                <div className="loader mb-3"></div>
                <p className="text-sm font-mono text-[#007acc]">
                  Đang tải dữ liệu...
                </p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-6">
                Chưa có bài đăng nào.
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white border border-[#d4d4d4] hover:border-[#007acc] hover:shadow-md transition-all duration-200 flex flex-col group relative"
                  >
                    <div className="px-4 py-2 border-b border-[#ececec] flex justify-between items-center bg-[#fafafa]">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#007acc]">
                        {post.author || "Ẩn danh"}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#6a6a6a]">
                          {new Date(post.created_at).toLocaleString("vi-VN")}
                        </span>
                        <button
                          onClick={async () => {
                            if (!confirm("Bạn có chắc muốn gỡ bài viết này?"))
                              return;
                            try {
                              await api.delete(`/user/post/${post.id}`);
                              setPosts((prev) =>
                                prev.filter((p) => p.id !== post.id)
                              );
                            } catch {}
                          }}
                          className="text-xs text-red-500 hover:text-red-700 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/user/post/edit/${post.id}`)
                          }
                          className="text-xs text-blue-500 hover:text-blue-700 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
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
                            const res = await api.put(
                              `/post/hand_like?post_id=${post.id}`
                            );
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
                              post.likes?.includes(user.username || "")
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
