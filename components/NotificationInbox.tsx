"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Bell, Trash2, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import UserAvatar from "./Avatar";
import api from "@/lib/api";

export type NotificationPayload = {
  id: string;
  message: string;
  recipient: string;
  sender: string;
  type?: string;
  created_at?: string;
  read?: boolean;
  data?: {
    type?: string;
    email?: string;
    author?: string;
    message?: string;
    post_id?: string;
    timestamp?: string;
  };
};

interface Props {
  notifications: NotificationPayload[];
  onClearOne: (index: number) => void;
  onClearAll: () => void;
  onMarkAsRead?: (index: number) => void;
  onMarkAllAsRead?: () => void;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationPayload[]>>;
}

export function NotificationInbox({
  notifications,
  onClearOne,
  onClearAll,
  onMarkAsRead,
  onMarkAllAsRead,
  setNotifications,
}: Props) {
  const [open, setOpen] = useState(false);
  const inboxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inboxRef.current && !inboxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "Vừa xong";
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return new Date(timestamp).toLocaleDateString("vi-VN");
  };

  const handleNotificationClick = (n: NotificationPayload, index: number) => {
    if (onMarkAsRead && !n.read) onMarkAsRead(index);
  };

  return (
    <div className="relative" ref={inboxRef}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative flex items-center justify-center w-11 h-8 rounded-xl hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ""}`}
      >
        <Bell className={`w-5 h-5 transition-colors ${unreadCount > 0 ? "text-blue-600" : "text-gray-600"}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 flex items-center justify-center text-xs font-semibold text-white bg-red-500 rounded-full ring-1 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/20 z-100 md:hidden" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] max-w-md md:w-150 border border-[#ccc] bg-white rounded-xl shadow-2xl z-9000 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between items-center px-4 py-3 bg-[#f3f3f3] border-b border-[#ccc]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-gray-700" />
                <h3 className="text-sm font-semibold text-gray-900">Thông báo</h3>
                {notifications.length > 0 && (
                  <Badge variant="secondary" size="sm" className="ml-1 bg-gray-200 text-gray-700">
                    {notifications.length}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && onMarkAllAsRead && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md font-medium transition-colors"
                    title="Đánh dấu tất cả đã đọc"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Đã đọc</span>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md font-medium transition-colors"
                    title="Xóa tất cả"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Xóa</span>
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[min(70vh,500px)] overflow-y-auto overscroll-contain">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Chưa có thông báo</p>
                  <p className="text-xs text-gray-500 text-center">
                    Bạn sẽ nhận được thông báo khi có hoạt động mới
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((n, i) => (
                    <div
                      key={i}
                      className={`group relative px-4 py-3 transition-all duration-200 cursor-pointer ${
                        n.read ? "hover:bg-gray-50" : "bg-blue-50/50 hover:bg-blue-50"
                      }`}
                      onClick={() => handleNotificationClick(n, i)}
                    >
                      <div className="flex items-start gap-3">
                        {!n.read && <div className="shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />}
                        <div className={`flex min-w-0 gap-3 items-center ${n.read ? "ml-5" : ""}`}>
                          <UserAvatar email={n.data?.email || "anonymous@system"} className="w-14 h-14" />
                          <div className="w-full">
                            <p className="text-sm text-gray-800 leading-relaxed">
                              <span className="font-semibold text-gray-900">{n.sender}</span>{" "}
                              {n.data?.message || n.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <p className="text-xs text-gray-500">
                                {formatTime(n.data?.timestamp || n.created_at)}
                              </p>
                              {!n.read && (
                                <>
                                  <span className="text-xs text-gray-300">•</span>
                                  <span 
                                    onClick={ async () => {
                                      try{
                                        await api.post(`/notifications/${n.id}/read`);
                                        setNotifications((prev)=>(
                                          prev.map((item) =>
                                            item.id === n.id ? { ...item, read: true } : item
                                          )
                                        ));
                                      }catch{}
                                    }}
                                    className="text-xs text-blue-600 font-medium hover:underline"
                                  >
                                    đánh dấu đã đọc
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onClearOne(i);
                            }}
                            className="p-1.5 hover:bg-white rounded-md transition-colors"
                            title="Xóa thông báo"
                          >
                            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="border-t border-[#ccc] bg-[#f3f3f3] px-4 py-2.5">
                <button
                  onClick={() => {
                    router.push("/notifications");
                    setOpen(false);
                  }}
                  className="w-full text-xs text-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Xem tất cả thông báo
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
