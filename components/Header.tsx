"use client";

import Link from "next/link";
import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import UserAvatar from "./Avatar";
import Image from "next/image";
import { useProfile } from "@/hooks/useProfile";
import {
  AccordionMenu,
  AccordionMenuGroup,
  AccordionMenuItem,
  AccordionMenuLabel,
} from "@/components/ui/accordion-menu";
import { NotificationInbox , NotificationPayload } from "./NotificationInbox";
import { Alert, AlertIcon, AlertTitle } from "@/components/ui/alert";
import { RiCheckboxCircleFill } from "@remixicon/react";
import {
  Home,
  BookOpen,
  Trophy,
  Folder,
  Info,
  Shield,
  UserCircle,
  LogOut,
  Mail,
  Settings,
  ChevronDown,
  Menu,
} from "lucide-react";
import { toast } from "sonner";
import { WSClient, WSMessage } from "@/lib/ws";

const TabItem = [
  { title: "Trang chủ", icon: Home, url: "/" },
  { title: "Bài tập", icon: BookOpen, url: "/problems" },
  { title: "Đề & Kỳ thi", icon: Trophy, url: "/contests" },
  { title: "Tài liệu", icon: Folder, url: "/documents" },
  { title: "Thông tin", icon: Info, url: "/about" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading, clearProfile } = useProfile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) setMobileMenuOpen(false);
    };
    console.log("🔍 API_URL at runtime:", process.env.NEXT_PUBLIC_API_URL);
    console.log("🔍 WS_URL at runtime:", process.env.NEXT_PUBLIC_WS_URL);
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!profile) return;
    const fetchNotifications = async () => {
      try {
        const res = await api.get(`/notifications/`);
        if (Array.isArray(res.data)) setNotifications(res.data);
      } catch {
        toast.error("Không thể tải thông báo", { position: "bottom-left" });
      }
    };
    fetchNotifications();
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    const ws = new WSClient<NotificationPayload>({
      path: "/ws/stream",
      token: profile.ws_token,
      onMessage: (data: WSMessage<NotificationPayload>) => {
        const payload: NotificationPayload = data.data;
        setNotifications((prev) => [payload, ...prev]);
        toast.info(payload.message, { position: "bottom-left" });
      },
      onError: () => toast.error("Lỗi kết nối realtime", { position: "bottom-left" }),
    });
    ws.connect();
    return () => ws.close();
  }, [profile]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
    } catch {}
    clearProfile();
    router.push("/login");
    setMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const showToast = (title: string) =>
    toast.custom((t) => (
      <Alert variant="mono" icon="primary" onClose={() => toast.dismiss(t)}>
        <AlertIcon>
          <RiCheckboxCircleFill />
        </AlertIcon>
        <AlertTitle>{title}</AlertTitle>
      </Alert>
    ));

  const clearNotification = (index: number) =>
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  const clearAllNotifications = () => setNotifications([]);

  if (loading) {
    return (
      <header className="w-full h-11 bg-[#f3f3f3] shadow-sm border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="w-28 h-6 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-4">
          <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-11 bg-[#f3f3f3] border-b border-gray-300 flex items-center justify-between px-4 md:px-3">
        <div
          className="flex items-center select-none transition-opacity"
        >
          <Image src="/logo/5.png" width={120} height={5} alt="Logo" priority />
        </div>

        <nav className="hidden lg:flex items-center h-full">
          {TabItem.map((tab) => {
            const active = tab.url === "/" ? pathname === "/" : pathname.startsWith(tab.url);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.url}
                href={tab.url}
                className={clsx(
                  "h-full flex items-center gap-2 px-4 text-sm font-bold relative select-none transition-all duration-200",
                  active ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.title}</span>
                {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          {profile ? (
            <>
              <NotificationInbox
                notifications={notifications}
                onClearOne={clearNotification}
                onClearAll={clearAllNotifications}
                setNotifications={setNotifications}
              />

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((p) => !p)}
                  className="flex h-8 items-center gap-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Menu người dùng"
                >
                  <UserAvatar email={profile.email} size={32} />
                  <div className="hidden md:flex flex-col items-start leading-tight">
                    <span className="text-sm font-medium text-gray-900">{profile.full_name}</span>
                    <span className="text-xs text-gray-500 capitalize">{profile.role}</span>
                  </div>
                  <ChevronDown
                    className={clsx(
                      "w-4 h-4 text-gray-500 transition-transform duration-200",
                      menuOpen && "rotate-180"
                    )}
                  />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-64 border border-[#ccc] rounded-lg bg-white shadow-lg overflow-hidden z-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    <AccordionMenu type="single" collapsible classNames={{ separator: "-mx-2" }}>
                      <AccordionMenuLabel className="flex w-full px-4 py-3 border-b gap-2 border-[#ccc] bg-gray-50">
                        <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div className="flex items-end min-w-0">
                          <span className="text-sm text-gray-500 truncate">{profile.email}</span>
                        </div>
                      </AccordionMenuLabel>
                      <AccordionMenuGroup className="p-2">
                        {profile.role === "admin" && (
                          <AccordionMenuItem
                            value="admin"
                            onClick={() => {
                              setMenuOpen(false);
                              router.push("/admin");
                            }}
                            className="hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <Shield className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium">Trang quản trị</span>
                          </AccordionMenuItem>
                        )}
                        <AccordionMenuItem
                          value="user"
                          onClick={() => {
                            setMenuOpen(false);
                            router.push("/user");
                          }}
                          className="hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <UserCircle className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium">Trang cá nhân</span>
                        </AccordionMenuItem>
                        <AccordionMenuItem
                          value="settings"
                          onClick={() => {
                            setMenuOpen(false);
                            showToast("Mở cài đặt");
                          }}
                          className="hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Settings className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium">Cài đặt</span>
                        </AccordionMenuItem>
                        <AccordionMenuItem
                          value="logout"
                          onClick={handleLogout}
                          className="text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="text-sm font-medium">Đăng xuất</span>
                        </AccordionMenuItem>
                      </AccordionMenuGroup>
                    </AccordionMenu>
                  </div>
                )}
              </div>

              <button
                onClick={() => setMobileMenuOpen((p) => !p)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </header>

      {mobileMenuOpen && profile && (
        <div
          ref={mobileMenuRef}
          className="lg:hidden fixed inset-x-0 top-16 z-30 bg-white border-b border-gray-200 shadow-lg animate-in slide-in-from-top duration-200"
        >
          <nav className="px-4 py-3 space-y-1">
            {TabItem.map((tab) => {
              const active = tab.url === "/" ? pathname === "/" : pathname.startsWith(tab.url);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.url}
                  href={tab.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    active ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 top-16 bg-black bg-opacity-20 z-20 animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
