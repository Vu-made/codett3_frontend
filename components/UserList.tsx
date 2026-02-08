"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Users, MessageCircle } from "lucide-react";
import UserAvatar from "@/components/Avatar";
import api from "@/lib/api";
import { useSocket } from "@/contexts/SocketContext";

type UserItem = {
  username: string;
  online: boolean;
  recently_active: boolean;
  last_active: string;
  full_name?: string;
  email: string;
};

function formatTimeAgo(isoDate: string) {
  if (!isoDate) return "Chưa từng hoạt động";

  const now = new Date();
  const past = new Date(isoDate);
  const diff = Math.floor((now.getTime() - past.getTime()) / 1000); // seconds

  if (diff < 5) return "Vừa xong";
  if (diff < 60) return `${diff} giây trước`;

  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins} phút trước`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;

  const years = Math.floor(months / 12);
  return `${years} năm trước`;
}

export default function UserList() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [userPage, setUserPage] = useState(1);
  const [userHasMore, setUserHasMore] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const userLoaderRef = useRef<HTMLDivElement | null>(null);

  const { getSocket } = useSocket();

  const fetchUsers = useCallback(async (currentPage: number) => {
    try {
      setLoadingUsers(true);
      const res = await api.get("/user/list", {
        params: { page: currentPage, limit: 10 },
      });
      const { users: newUsers, total } = res.data;
      setUsers((prev) => {
        const existing = new Set(prev.map((u) => u.username));
        const filtered = newUsers.filter((u: UserItem) => !existing.has(u.username));
        return [...prev, ...filtered];
      });
      const totalPages = Math.ceil(total / 10);
      setUserHasMore(currentPage < totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (userHasMore) fetchUsers(userPage);
  }, [userPage, fetchUsers, userHasMore]);

  useEffect(() => {
    if (!userLoaderRef.current || !userHasMore || loadingUsers) return;
    const node = userLoaderRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loadingUsers && userHasMore) {
          setUserPage((prev) => prev + 1);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(node);
    return () => observer.unobserve(node);
  }, [loadingUsers, userHasMore]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleUserStatus = (data: { username: string; status: string }) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.username === data.username
            ? { ...u, online: data.status === "online" }
            : u
        )
      );
    };

    socket.on("user_status", handleUserStatus);
    console.log("[SOCKET] Listening for user_status");

    return () => {
      socket.off("user_status", handleUserStatus);
    };
  }, [getSocket]);

  return (
    <div className="space-y-6 sticky top-0 self-start">
      <div className="px-4 py-3 border border-[#d4d4d4] flex items-center justify-between bg-[#fafafa]">
        <h2 className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#007acc]" />
          Thành viên
        </h2>
      </div>

      <div className="flex flex-col gap-5">
        {loadingUsers && users.length === 0
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="px-4 py-3 border border-[#d4d4d4] bg-white flex items-center gap-3 animate-pulse"
              >
                <div className="w-8 h-8 rounded-full bg-gray-300" />
                <div className="flex-1">
                  <div className="h-3 w-24 bg-gray-300 rounded mb-1"></div>
                  <div className="h-2 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          : users.map((user) => (
              <div
                key={user.username}
                className="px-4 py-3 border border-[#d4d4d4] bg-white hover:bg-[#f3f3f3] transition-colors flex items-center gap-3 cursor-pointer"
              >
                <div className="relative">
                  <UserAvatar email={user.email || user.username} size={32} />
                  {user.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#333]">
                    {user.full_name || user.username}
                  </p>
                  <p
                    className={`text-xs ${
                      user.online ? "text-green-600" : "text-[#999]"
                    }`}
                  >
                    {user.online
                      ? "Đang hoạt động"
                      : `Hoạt động ${formatTimeAgo(user.last_active)}`}
                  </p>
                </div>
                <MessageCircle className="w-4 h-4 text-[#007acc] hover:text-[#005fa3]" />
              </div>
            ))}

        {userHasMore && (
          <div ref={userLoaderRef} className="flex justify-center py-4 text-[#007acc]">
            <div className="loader"></div>
          </div>
        )}
      </div>
    </div>
  );
}
