"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

interface Contest {
  id: string;
  title: string;
  description: string;
  start_time: string | null;
  end_time: string | null;
  time_mode: string;
  realtime_rank: boolean;
  status: boolean;
  author_id: number | null;
  problems: [];
  created_at: string;
}

const PAGE_SIZE = 12;

export default function ContestListPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "running" | "ended">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await api.get("/contest/list");
        setContests(res.data);
      }finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (d: Date) =>
    `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()} ${d
      .getHours()
      .toString()
      .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;

  const filtered = useMemo(() => {
    return contests.filter((c) => {
      const titleMatch = c.title.toLowerCase().includes(search.toLowerCase());
      const start = c.start_time ? new Date(c.start_time) : null;
      const end = c.end_time ? new Date(c.end_time) : null;

      let state: "upcoming" | "running" | "ended" = "upcoming";

      if (c.time_mode === "unlimited") {
        state = "running";
      } else if (start && end) {
        if (now < start) state = "upcoming";
        else if (now >= start && now <= end) state = "running";
        else state = "ended";
      }

      const stateMatch = filter === "all" || state === filter;
      return titleMatch && stateMatch;
    });
  }, [contests, search, filter, now]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const currentContests = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const prevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const nextPage = () => setCurrentPage((p) => Math.min(pageCount, p + 1));

  const formatCountdown = (ms: number) => {
    if (ms <= 0) return "00h:00m:00s";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}h:${minutes
      .toString()
      .padStart(2, "0")}m:${seconds.toString().padStart(2, "0")}s`;
  };

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-full text-gray-600 bg-[#f5f5f5]">
        <div className="loader mb-3"></div>
        <p className="text-sm font-mono text-[#007acc]">Đang tải dữ liệu...</p>
      </div>
    );

  return (
    <div className="h-full flex flex-col bg-white text-[#333] font-mono select-none overflow-hidden">
      {/* Header */}
      <header className="h-9 border-b border-[#ccc] bg-[#F3F3F3] flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-wider text-[#616161] font-bold">
            Trình khám phá: Kỳ thi
          </span>
          <div className="flex items-center gap-1 bg-white border border-[#ccc] px-2 py-0.5 rounded-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm kỳ thi..."
              className="bg-transparent outline-none text-[12px] w-48 placeholder:italic"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        <div className="text-[11px] text-[#616161]">
          Hiển thị {filtered.length}/{contests.length} kỳ thi
        </div>
      </header>

      {/* Filter */}
      <div className="border-b border-[#ccc] bg-[#F3F3F3] flex items-center gap-2 px-4 py-1 text-[12px] text-[#333]">
        <button onClick={() => setFilter("all")} className={`px-2 py-1 rounded-sm ${filter === "all" ? "bg-[#005FB8] text-white" : "hover:bg-[#eaeaea]"}`}>
          Tất cả
        </button>
        <button onClick={() => setFilter("upcoming")} className={`px-2 py-1 rounded-sm ${filter === "upcoming" ? "bg-[#005FB8] text-white" : "hover:bg-[#eaeaea]"}`}>
          Sắp diễn ra
        </button>
        <button onClick={() => setFilter("running")} className={`px-2 py-1 rounded-sm ${filter === "running" ? "bg-[#005FB8] text-white" : "hover:bg-[#eaeaea]"}`}>
          Đang diễn ra
        </button>
        <button onClick={() => setFilter("ended")} className={`px-2 py-1 rounded-sm ${filter === "ended" ? "bg-[#005FB8] text-white" : "hover:bg-[#eaeaea]"}`}>
          Đã kết thúc
        </button>
      </div>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {currentContests.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#666] italic">
            Không tìm thấy kỳ thi phù hợp.
          </div>
        ) : (
          <div className="p-4 flex flex-col gap-4">
            {currentContests.map((c) => {
              const start = c.start_time ? new Date(c.start_time) : null;
              const end = c.end_time ? new Date(c.end_time) : null;

              let displayState = "";
              let color = "#616161";
              let clickable = false;

              if (c.time_mode === "unlimited") {
                displayState = "Vô thời hạn";
                color = "#00796B";
                clickable = true;
              } else if (start && now < start) {
                const diff = start.getTime() - now.getTime();
                displayState = `Bắt đầu sau ${formatCountdown(diff)}`;
                color = "#F57C00";
              } else if (start && end && now >= start && now <= end) {
                const diff = end.getTime() - now.getTime();
                displayState = `Còn ${formatCountdown(diff)}`;
                color = "#388E3C";
                clickable = true;
              } else if (end && now > end) {
                displayState = "Đã kết thúc";
                color = "#D32F2F";
              } else {
                displayState = "Không xác định";
              }

              return (
                <div key={c.id} className="border flex flex-col justify-between border-[#ccc] rounded-md p-3 bg-white hover:shadow-md transition">
                  <div className="flex justify-between items-center mb-1">
                    {clickable ? (
                      <h2 className="text-[14px] font-bold text-[#005FB8] hover:underline">
                        <Link href={`/contests/${c.id}`}>{c.title}</Link>
                      </h2>
                    ) : (
                      <h2 className="text-[14px] font-bold text-gray-400">{c.title}</h2>
                    )}
                    <span className="text-[11px] font-semibold" style={{ color }}>
                      {displayState}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#666] space-y-1">
                    {start && (
                      <div>
                        <span className="font-bold">Bắt đầu:</span> {formatDate(start)}
                      </div>
                    )}
                    {end && (
                      <div>
                        <span className="font-bold">Kết thúc:</span> {formatDate(end)}
                      </div>
                    )}
                    <div>
                      <span className="font-bold">Chế độ:</span>{" "}
                      {c.time_mode === "unlimited" ? "Không giới hạn" : c.time_mode}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      {pageCount > 1 && (
        <footer className="h-7 bg-[#FAFAFA] border border-[#E0E0E0] flex items-center px-3 justify-between text-[11px]">
          <div className="flex items-center gap-3">
            <button onClick={prevPage} disabled={currentPage === 1} className="flex items-center gap-1 hover:bg-[#63636322] px-2 h-full">
              &lt; Trước
            </button>
            <button onClick={nextPage} disabled={currentPage === pageCount} className="flex items-center gap-1 hover:bg-[#63636322] px-2 h-full">
              Sau &gt;
            </button>
            <span className="opacity-80 italic">
              Trang {currentPage}/{pageCount}
            </span>
          </div>
          <div className="uppercase font-bold tracking-tighter">UTF-8</div>
        </footer>
      )}
    </div>
  );
}
