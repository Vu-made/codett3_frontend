"use client";

import React, { useEffect, useState } from "react";
import UserAvatar from "@/components/Avatar";
import api from "@/lib/api";
import ConfirmModal from "@/components/ConfirmModal";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/base-context-menu";

interface User {
  id: number;
  username: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "banned" | "inactive";
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<"All" | "admin" | "user">("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "active" | "banned" | "inactive">("All");
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, message: "", onConfirm: () => {} });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/admin/users/");
        setUsers(res.data);
      } catch (err) {
        console.error("❌ Lỗi tải danh sách người dùng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleActive = async (id: number) => {
    try {
      await api.post(`/admin/users/${id}/active`);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "active" } : u)));
    } catch (err) {
      console.log(err);
    }
  };

  const handleBan = async (id: number) => {
    try {
      await api.post(`/admin/users/${id}/ban`);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "banned" } : u)));
    } catch (err) {
      console.log(err);
    }
  };

  const handleInactive = async (id: number) => {
    try {
      await api.post(`/admin/users/${id}/inactive`);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "inactive" } : u)));
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/users/${id}/delete`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-full text-gray-600 bg-[#f5f5f5]">
        <div className="loader mb-3"></div>
        <p className="text-sm font-mono text-[#007acc]">Đang tải dữ liệu...</p>
      </div>
    );

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || user.role === roleFilter;
    const matchStatus = statusFilter === "All" || user.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="flex flex-col h-full bg-white text-[#1e1e1e] font-mono relative">
      <div className="bg-[#f3f3f3] border-b border-[#e0e0e0] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[#1e1e1e]">
          <i className="fas fa-users text-[#007acc]"></i>
          <span className="font-semibold">Người dùng</span>
          <span className="text-[#aaaaaa]">›</span>
          <span className="text-[#666666] text-sm">Quản lý</span>
        </div>
      </div>

      <div className="bg-[#fafafa] border-b border-[#e0e0e0] px-4 py-3 flex flex-wrap gap-3 items-center">
        <div className="flex-1 relative">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[#888888] text-xs"></i>
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            className="w-full bg-white border border-[#d0d0d0] rounded pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:border-[#007acc]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="bg-white border border-[#d0d0d0] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#007acc]"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as "All" | "admin" | "user")}
        >
          <option value="All">Tất cả vai trò</option>
          <option value="admin">Quản trị viên</option>
          <option value="user">Người dùng</option>
        </select>

        <select
          className="bg-white border border-[#d0d0d0] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#007acc]"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "All" | "active" | "banned" | "inactive")
          }
        >
          <option value="All">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="banned">Bị cấm</option>
          <option value="inactive">Chưa kích hoạt</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredUsers.length === 0 ? (
          <div className="px-4 py-16 text-center text-[#888888] flex flex-col items-center gap-3">
            <i className="fas fa-inbox text-4xl opacity-50"></i>
            <p className="text-sm">Không tìm thấy người dùng nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredUsers.map((user) => (
              <ContextMenu key={user.id}>
                <ContextMenuTrigger>
                  <div className="flex flex-col items-center text-center p-4 bg-white border border-[#e0e0e0] rounded-xl shadow-sm hover:shadow-md hover:bg-[#fafafa] transition-all cursor-pointer">
                    <UserAvatar email={user.email} size={64} />
                    <div className="mt-3 font-semibold text-[#0451a5]">{user.username}</div>
                    <div className="text-sm text-[#555555] truncate w-full">{user.email}</div>
                    <div
                      className={`mt-1 text-xs ${
                        user.role === "admin" ? "text-[#007acc]" : "text-[#333333]"
                      }`}
                    >
                      {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                    </div>
                    <div className="mt-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.status === "active"
                            ? "bg-[#e8f5e9] text-[#388e3c]"
                            : user.status === "banned"
                            ? "bg-[#ffebee] text-[#c62828]"
                            : "bg-[#fff8e1] text-[#f57c00]"
                        }`}
                      >
                        {user.status === "active"
                          ? "Đang hoạt động"
                          : user.status === "banned"
                          ? "Bị cấm"
                          : "Chưa kích hoạt"}
                      </span>
                    </div>
                  </div>
                </ContextMenuTrigger>

                <ContextMenuContent className="w-48 bg-white border border-[#ddd] rounded-md shadow-lg">
                  <ContextMenuItem
                    className="flex items-center gap-2 px-3 py-2 hover:bg-[#f0f0f0] cursor-pointer"
                    onClick={() =>
                      setConfirmAction({
                        isOpen: true,
                        message: `Kích hoạt người dùng ${user.username}?`,
                        onConfirm: () => handleActive(user.id),
                      })
                    }
                  >
                    <i className="fas fa-check text-[#388e3c] w-4"></i> Kích hoạt
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="flex items-center gap-2 px-3 py-2 hover:bg-[#fff8e1] cursor-pointer"
                    onClick={() =>
                      setConfirmAction({
                        isOpen: true,
                        message: `Cấm người dùng ${user.username}?`,
                        onConfirm: () => handleBan(user.id),
                      })
                    }
                  >
                    <i className="fas fa-ban text-[#ff9800] w-4"></i> Cấm
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="flex items-center gap-2 px-3 py-2 hover:bg-[#fef3e0] cursor-pointer"
                    onClick={() =>
                      setConfirmAction({
                        isOpen: true,
                        message: `Đặt ${user.username} về trạng thái chưa kích hoạt?`,
                        onConfirm: () => handleInactive(user.id),
                      })
                    }
                  >
                    <i className="fas fa-hourglass-half text-[#f57c00] w-4"></i> Chưa kích hoạt
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    className="flex items-center gap-2 px-3 py-2 text-[#a31515] hover:bg-[#ffebee] cursor-pointer"
                    onClick={() =>
                      setConfirmAction({
                        isOpen: true,
                        message: `Xoá người dùng ${user.username}?`,
                        onConfirm: () => handleDelete(user.id),
                      })
                    }
                  >
                    <i className="fas fa-trash w-4"></i> Xoá
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmAction.isOpen}
        message={confirmAction.message}
        onCancel={() => setConfirmAction((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          confirmAction.onConfirm();
          setConfirmAction((prev) => ({ ...prev, isOpen: false }));
        }}
      />
    </div>
  );
}
