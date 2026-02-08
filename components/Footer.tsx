"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLayoutStore } from "@/stores/layoutStore";
import api, { apiEvents } from "@/lib/api";
import { useContest, Contest } from "@/hooks/useContest";
import { useProfile } from "@/hooks/useProfile";
import * as Popover from "@radix-ui/react-popover";
import {
  Columns,
  Table2,
  CheckCircle,
  Loader2,
  Trophy,
  X,
  Clock,
  Calendar,
  FileCode2,
  Signal,
  ChevronRight,
  Settings2,
  Settings2Icon,
  LockIcon
} from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const pathname = usePathname();
  const { layoutMode, toggleLayout } = useLayoutStore();
  const isProblemPage = /^\/problems\/[^/]+\/[^/]+$/.test(pathname);
  const [loading, setLoading] = useState(false);
  const { profile } = useProfile();
  const { contest } = useContest();
  const isInContest = Boolean(contest && profile?.contest_is_joining);

  useEffect(() => {
    const handleLoading = (isLoading: boolean) => setLoading(isLoading);
    void apiEvents.on("loading", handleLoading);
    return () => {
      void apiEvents.off("loading", handleLoading);
    };
  }, []);


  return (
    <footer className="relative flex items-center justify-between border-t border-[#dcdcdc] bg-[#f3f3f3] text-[12px] font-mono text-[#333333] select-none">
      <div className="flex items-center h-full">
        <Popover.Root>
          <Popover.Trigger className="px-3 py-1 text-[#007acc] hover:text-[#005fa3] hover:bg-[#e8e8e8] transition">
            <Settings2
              size={16}
              className="text-[#007acc] group-hover:scale-110 transition-transform"
            />
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              sideOffset={10}
              align="start"
              className="w-64 border border-[#ccc] bg-white p-3 text-[12px] text-[#333] z-50"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-[#007acc] select-none">
                  <Settings2Icon className="inline mr-1" size={14} /> Cài đặt nội bộ
                </span>
                <Popover.Close className="text-[#999] hover:text-[#333]">
                  <X size={14} />
                </Popover.Close>
              </div>
              <InternalSettingsContent />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {isProblemPage && (
          <button
            onClick={toggleLayout}
            className="flex items-center gap-1 px-2 py-1 text-[#007acc] hover:text-[#005fa3] hover:bg-[#e8e8e8] transition"
            title={
              layoutMode === "split"
                ? "Chuyển sang Tab View"
                : "Chuyển sang Split View"
            }
          >
            {layoutMode === "split" ? (
              <Columns size={15} />
            ) : (
              <Table2 size={15} />
            )}
          </button>
        )}
      </div>

      <div className="hidden sm:flex items-center gap-3 text-[#666666]">
        <span>
          Crafted by{" "}
          <a
            href="https://github.com/Vu-made"
            target="_blank"
            className="text-[#007acc] hover:underline"
          >
            Vu-made
          </a>
        </span>
        <span className="text-[#cccccc]">|</span>
        <span>
          Inspired by{" "}
          <a
            href="https://qduoj.com"
            target="_blank"
            className="text-[#007acc] hover:underline"
          >
            QDUOJ
          </a>
          ,{" "}
          <a
            href="https://dmoj.ca"
            target="_blank"
            className="text-[#007acc] hover:underline"
          >
            DMOJ
          </a>
        </span>
      </div>

      <div className="flex items-center gap-3 text-[#555555] px-4">
        <Popover.Root>
          <Popover.Trigger
            className="px-2 py-1 text-[#007acc] hover:text-[#005fa3] hover:bg-[#e8e8e8] transition"
            title="Thông tin contest"
          >
            <Trophy
              size={15}
              className={`${
                isInContest ? "text-[#007acc]" : "text-gray-400"
              } group-hover:scale-110 transition-transform`}
            />
          </Popover.Trigger>
          {contest && (
            <Popover.Portal>
              <Popover.Content
                sideOffset={6}
                align="end"
                className="w-72 border border-blue-500 bg-white shadow-lg p-3 text-[12px] text-[#333] z-50 rounded-md"
              >
                <Popover.Arrow className="fill-white stroke-blue-500" width={12} height={6} strokeWidth={2}/>
                <ContestSummaryContent contest={contest} />
              </Popover.Content>
            </Popover.Portal>
          )}
        </Popover.Root>
        {loading ? (
          <div
            className="flex items-center gap-1 text-[#007acc]"
            title="Đang gửi request..."
          >
            <Loader2 size={14} className="animate-spin" />
            <span>Loading</span>
          </div>
        ) : (
          <span className="flex items-center gap-1 text-[#007acc]">
            <CheckCircle size={13} /> Synced
          </span>
        )}
      </div>
    </footer>
  );
}

function InternalSettingsContent() {
  const [autoSave, setAutoSave] = useState(
    () => localStorage.getItem("autoSave") === "true"
  );
  const [showConsole, setShowConsole] = useState(
    () => localStorage.getItem("showConsole") === "true"
  );
  const [debugLog, setDebugLog] = useState(
    () => localStorage.getItem("debugLog") === "true"
  );

  useEffect(() => {
    localStorage.setItem("autoSave", String(autoSave));
  }, [autoSave]);
  useEffect(() => {
    localStorage.setItem("showConsole", String(showConsole));
  }, [showConsole]);
  useEffect(() => {
    localStorage.setItem("debugLog", String(debugLog));
  }, [debugLog]);

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          className="accent-[#007acc]"
          checked={autoSave}
          onChange={(e) => setAutoSave(e.target.checked)}
        />{" "}
        Tự động lưu code
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          className="accent-[#007acc]"
          checked={showConsole}
          onChange={(e) => setShowConsole(e.target.checked)}
        />{" "}
        Hiển thị console
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          className="accent-[#007acc]"
          checked={debugLog}
          onChange={(e) => setDebugLog(e.target.checked)}
        />{" "}
        Hiện log debug
      </label>
    </div>
  );
}

function ContestSummaryContent({ contest }: { contest: Contest }) {
  const status =
    new Date() < new Date(contest.start_time)
      ? "Sắp bắt đầu"
      : new Date() > new Date(contest.end_time)
      ? "Đã kết thúc"
      : "Đang diễn ra";

  const statusColor =
    status === "Đang diễn ra"
      ? "text-green-600"
      : status === "Sắp bắt đầu"
      ? "text-yellow-600"
      : "text-gray-600";

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-[#007acc] text-sm flex items-center gap-1">
          <p className="inline-flex items-center" title="Kỳ thi có mật khẩu">
            {contest.use_password && (
              <LockIcon size={14} className="text-gray-400 hover:text-gray-600 transition" />
            )}
          </p>
          {contest.title} 
        </span>
          <hr className="border border-gray-300"/>
        <Popover.Close className="text-[#999] hover:text-[#333]">
          <X size={14} />
        </Popover.Close>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-[#007acc]" />
          <span>
            <b>Bắt đầu:</b> {new Date(contest.start_time).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-[#007acc]" />
          <span>
            <b>Kết thúc:</b> {new Date(contest.end_time).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FileCode2 size={14} className="text-[#007acc]" />
          <span>
            <b>Số bài:</b> {contest.problems ? contest.problems.length : 0}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Signal size={14} className="text-[#007acc]" />
          <span>
            <b>Trạng thái:</b>{" "}
            <span className={statusColor}>{status}</span>
          </span>
        </div>
      </div>
      <div className="flex justify-between">
        <Link
          href={`/contests/gui`}
          className="mt-3 flex items-center justify-center gap-1 text-[#007acc] hover:underline"
        >
          Xem chi tiết <ChevronRight size={13} />
        </Link>
        <div
          className="mt-3 text-xs text-gray-400 hover:text-red-500 transition-colors duration-200 text-center cursor-pointer select-none"
          title="Rời khỏi contest"
          onClick={async () => {
            await api.post("contest/auth/leave");
            window.location.reload(); 
          }}
        >
          Leave contest
        </div>
      </div>
    </div>
  );
}
