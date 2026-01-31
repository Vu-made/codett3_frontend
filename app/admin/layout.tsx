"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Split from "react-split";
import PageTransition from "@/components/PageTransition";

import {
  Newspaper,
  Users,
  FileCode,
  Trophy,
  FileText,
  Settings,
} from "lucide-react";

const menuItems = [
  { url: "/admin/posts", name: "Bảng tin", icon: Newspaper },
  { url: "/admin/users", name: "Người dùng", icon: Users },
  { url: "/admin/problems/public", name: "Bài tập", icon: FileCode },
  { url: "/admin/contests", name: "Đề & Kỳ thi", icon: Trophy },
  { url: "/admin/documents", name: "Tài liệu", icon: FileText },
  { url: "/admin/settings", name: "Cài đặt", icon: Settings },
];

export default function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();

  return (
    <div className="h-full w-full bg-white font-mono text-[#1e1e1e]">
      <Split
        sizes={[15, 75]}
        minSize={[200, 1000]}
        gutterSize={1}
        gutterAlign="center"
        direction="horizontal"
        cursor="col-resize"
        className="split"
      >
        <aside className="w-full bg-[#f3f3f3] border-r border-[#ccc] flex flex-col">
          <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const active =
                item.url === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.url);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.url}
                  className={`relative flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                    active
                      ? "bg-[#e7f3ff] text-[#007acc] font-semibold"
                      : "text-[#333333] hover:bg-[#eaeaea]"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-0 h-full w-1 bg-[#007acc] rounded-r-sm"></span>
                  )}
                  <Icon
                    size={18}
                    className={`${
                      active ? "text-[#007acc]" : "text-[#666666]"
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 w-full bg-white overflow-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </Split>
    </div>
  );
}
