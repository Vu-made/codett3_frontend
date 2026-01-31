"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import clsx from "clsx";

interface ProblemItem {
  id: number;
  title: string;
  display_id?: string;
}

interface Contest {
  id: string;
  title: string;
  description: string;
  start_time: string | null;
  end_time: string | null;
  time_mode: string;
  realtime_rank: boolean;
  status: boolean;
  problems: ProblemItem[];
  created_at: string;
}

const ContestContext = createContext<Contest | null>(null);
export const useContest = () => useContext(ContestContext);

export default function ContestLayout({ children }: { children: React.ReactNode }) {
  const { id_contest } = useParams();
  const pathname = usePathname();
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const res = await api.get(`/contest/${id_contest}`);
        setContest(res.data);
      } catch (err) {
        console.log(err);
        router.push("/contests");
      } finally {
        setLoading(false);
      }
    };
    fetchContest();
  }, [id_contest,router]);

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

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 font-mono bg-white">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-3"></div>
        <p className="text-sm">Đang tải thông tin kỳ thi...</p>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 italic bg-white">
        Không tìm thấy kỳ thi.
      </div>
    );
  }

  const start = contest.start_time ? new Date(contest.start_time) : null;
  const end = contest.end_time ? new Date(contest.end_time) : null;

  let displayState = "";
  let color = "#616161";

  if (contest.time_mode === "unlimited") {
    displayState = "Vô thời hạn";
    color = "#00796B";
  } else if (start && now < start) {
    const diff = start.getTime() - now.getTime();
    displayState = `Bắt đầu sau ${formatCountdown(diff)}`;
    color = "#F57C00";
  } else if (start && end && now >= start && now <= end) {
    const diff = end.getTime() - now.getTime();
    displayState = `Còn ${formatCountdown(diff)}`;
    color = "#388E3C";
  } else if (end && now > end) {
    displayState = "Đã kết thúc";
    color = "#D32F2F";
  } else {
    displayState = "Không xác định";
  }

  const tabs = [
    { key: "problems", label: "Bài tập", icon: "fa-solid fa-code" },
    { key: "ranking", label: "Bảng xếp hạng", icon: "fa-solid fa-ranking-star" },
  ];

  const activeTab = tabs.find((t) => pathname.endsWith(`/${t.key}`))?.key || "";

  return (
    <ContestContext.Provider value={contest}>
      <div className="h-full flex flex-col bg-white text-[#24292e] font-['Consolas','Courier_New','monospace'] select-none">
        <header className="h-10 border-b border-gray-300 bg-[#f3f4f6] flex items-center justify-between px-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600 text-[12px]">
            <Link
              href="/contests"
              className="text-blue-600 hover:underline hover:text-blue-700 transition-colors"
            >
              Kỳ thi
            </Link>
            <span className="text-gray-400">›</span>
            <Link
              href={`/contests/${id_contest}`}
              className="text-blue-600 hover:underline hover:text-blue-700 transition-colors"
            >
              {contest.title}
            </Link>
          </div>

          <div
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color }}
          >
            {displayState}
          </div>
        </header>

        <main className="flex-1 flex flex-col overflow-hidden px-10 mt-3 bg-white">
          <div className="border-b border-gray-300 bg-white px-8 flex items-center justify-between">
            <h1 className="text-xl font-bold text-[#005FB8]">{contest.title}</h1>
            <nav className="flex">
              {tabs.map((tab) => {
                const active = activeTab === tab.key;
                return (
                  <Link
                    key={tab.key}
                    href={`/contests/${id_contest}/${tab.key}`}
                    className={clsx(
                      "px-4 py-2 rounded-t-md text-sm font-medium flex items-center gap-2 transition-all border-b-2",
                      active
                        ? "text-[#005FB8] border-[#005FB8] bg-[#eaf3ff]"
                        : "text-gray-600 border-transparent hover:text-[#005FB8] hover:bg-[#f3f9ff]"
                    )}
                  >
                    <i className={clsx(tab.icon, "text-[13px]")}></i>
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex-1 overflow-auto bg-white px-8 py-5 h-full">{children}</div>
        </main>
      </div>
    </ContestContext.Provider>
  );
}
