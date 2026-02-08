"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Bell, Trash2, X, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import UserAvatar from "./Avatar";
import api from "@/lib/api";
import { useSocket } from "@/contexts/SocketContext";
import { toast } from "sonner";

export interface NotificationPayload {
  id: string;
  message: string;
  type: string;
  data?: {
    type?: string;
    email?: string;
    author?: string;
    message?: string;
    post_id?: string;
    timestamp?: string;
  };
  read: boolean;
  created_at: string;
  recipient?: string;
  sender_user?: {
    username: string;
    full_name?: string;
    email?: string;
  };
}

// Skeleton Component
function NotificationSkeleton() {
  return (
    <div className="px-4 py-3 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-2 h-2 bg-gray-200 rounded-full mt-2" />
        <div className="flex min-w-0 gap-3 items-center flex-1">
          <div className="w-14 h-14 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationInbox() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [displayedNotifications, setDisplayedNotifications] = useState<NotificationPayload[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const ITEMS_PER_PAGE = 5;
  
  const inboxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { getSocket } = useSocket();
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Helper function to check if notification is from today
  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await api.get("/notifications/");
        if (Array.isArray(res.data)) {
          // Filter only today's notifications
          const todayNotifications = res.data.filter((n: NotificationPayload) => 
            isToday(n.created_at)
          );
          setNotifications(todayNotifications);
          
          // Display first page
          const firstPage = todayNotifications.slice(0, ITEMS_PER_PAGE);
          setDisplayedNotifications(firstPage);
          setHasMore(todayNotifications.length > ITEMS_PER_PAGE);
        }
      } catch {
        toast.error("Không thể tải thông báo", { position: "bottom-left" });
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return; 

    const onNotify = (payload: NotificationPayload) => {
      setNotifications((prev) => [payload, ...prev]);
      if (isToday(payload.created_at)) {
        setDisplayedNotifications((prev) => {
          const updated = [payload, ...prev];
          // Keep only current page size
          if (updated.length > currentPage * ITEMS_PER_PAGE) {
            return updated.slice(0, currentPage * ITEMS_PER_PAGE);
          }
          return updated;
        });
      }
    };

    socket.on("notification", onNotify);

    return () => {
      socket.off("notification", onNotify);
    };
  }, [getSocket, currentPage]);

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

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setDisplayedNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      toast.error("Không thể đánh dấu đã đọc");
    }
  };

  const handleClearOne = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setDisplayedNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      // Check if we need to load one more from notifications
      const nextIndex = currentPage * ITEMS_PER_PAGE;
      if (nextIndex < notifications.length) {
        const nextItem = notifications[nextIndex];
        if (nextItem && nextItem.id !== id) {
          return [...updated, nextItem];
        }
      }
      return updated;
    });
    setHasMore(notifications.length - 1 > displayedNotifications.length);
  };

  const handleClearAll = () => {
    setNotifications([]);
    setDisplayedNotifications([]);
    setCurrentPage(1);
    setHasMore(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post(`/notifications/mark_all_read`);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setDisplayedNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const handleNotificationClick = (n: NotificationPayload) => {
    if (!n.read) handleMarkAsRead(n.id);
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = currentPage * ITEMS_PER_PAGE;
      const endIndex = nextPage * ITEMS_PER_PAGE;
      const moreNotifications = notifications.slice(startIndex, endIndex);
      
      setDisplayedNotifications((prev) => [...prev, ...moreNotifications]);
      setCurrentPage(nextPage);
      setHasMore(notifications.length > endIndex);
      setLoadingMore(false);
    }, 500);
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
          <div className="absolute lg:right-0 mt-3 w-[calc(100vw-2rem)] max-w-md md:w-150 border border-[#ccc] bg-white rounded-xl shadow-2xl z-9000 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between items-center px-4 py-3 bg-[#f3f3f3] border-b border-[#ccc]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-gray-700" />
                <h3 className="text-sm font-semibold text-gray-900">Thông báo hôm nay</h3>
                {notifications.length > 0 && (
                  <Badge variant="secondary" size="sm" className="ml-1 bg-gray-200 text-gray-700">
                    {notifications.length}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md font-medium transition-colors"
                    title="Đánh dấu tất cả đã đọc"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Đã đọc</span>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
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
              {loading ? (
                // Skeleton loading state
                <div className="divide-y divide-gray-100">
                  {[...Array(3)].map((_, i) => (
                    <NotificationSkeleton key={i} />
                  ))}
                </div>
              ) : displayedNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Chưa có thông báo hôm nay</p>
                  <p className="text-xs text-gray-500 text-center">
                    Bạn sẽ nhận được thông báo khi có hoạt động mới
                  </p>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-gray-100">
                    {displayedNotifications.map((n) => (
                      <div
                        key={n.id}
                        className={`group relative px-4 py-3 transition-all duration-200 cursor-pointer ${
                          n.read ? "hover:bg-gray-50" : "bg-blue-50/50 hover:bg-blue-50"
                        }`}
                        onClick={() => handleNotificationClick(n)}
                      >
                        <div className="flex items-start gap-3">
                          {!n.read && <div className="shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />}
                          <div className={`flex min-w-0 gap-3 items-center ${n.read ? "ml-5" : ""}`}>
                            <UserAvatar email={n.sender_user?.email} className="w-14 h-14" />
                            <div className="w-full">  
                              <p className="text-sm text-gray-800 leading-relaxed">
                                <span className="font-semibold text-gray-900">{n.sender_user?.full_name || n.sender_user?.username}</span>{" "}
                                {n.message}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <p className="text-xs text-gray-500">
                                  {formatTime(n.data?.timestamp || n.created_at)}
                                </p>
                                {!n.read && (
                                  <>
                                    <span className="text-xs text-gray-300">•</span>
                                    <span
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkAsRead(n.id);
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
                                handleClearOne(n.id);
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
                  
                  {/* Load More Button */}
                  {hasMore && (
                    <div className="px-4 py-3 border-t border-gray-100">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingMore ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Đang tải...</span>
                          </>
                        ) : (
                          <span>Xem thêm ({notifications.length - displayedNotifications.length} thông báo)</span>
                        )}
                      </button>
                    </div>
                  )}
                </>
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