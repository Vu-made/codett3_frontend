"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { Trophy, RefreshCw, Search } from "lucide-react";

interface ProblemScore {
  [key: string]: number;
}
interface ProblemTime {
  [key: string]: string;
}
interface User {
  name: string;
  problems: ProblemScore;
  problemTime: ProblemTime;
  total: number;
  penalty: number;
  solved: number;
}
interface Problem {
  id: string;
  display_id: string;
  title: string;
  difficulty: string;
}
interface Contest {
  id: string;
  title: string;
  start_time: string;
  end_time: string | null;
  time_mode: string;
  realtime_rank: boolean;
}
interface LeaderboardEntry {
  username: string;
  problems: Record<string, number>;
  problemTime: Record<string, string | null>;
  total: number;
  penalty?: number;
  last_submit?: string;
}

export default function LeaderboardPage() {
  const { id_contest } = useParams();
  const [filter, setFilter] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [problemList, setProblemList] = useState<string[]>([]);
  // const [problemMap, setProblemMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [contest, setContest] = useState<Contest | null>(null);
  const router = useRouter();

  const formatAndSort = (usersData: User[]) =>
    usersData.map((u) => ({
      ...u,
      solved: Object.values(u.problems).filter((s) => s > 0).length,
    }));

  const fetchContest = useCallback(async () => {
    try {
      const res = await api.get<Contest>(`/contest/${id_contest}`);
      setContest(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [id_contest]);

  const fetchProblems = useCallback(async () => {
    try {
      const res = await api.get<Problem[]>(`/problem/list_full?Class=${id_contest}`);
      const data = res.data;
      setProblemList(data.map((p) => p.id));
      // setProblemMap(Object.fromEntries(data.map((p) => [p.id, p.title])));
    } catch (err) {
      console.error(err);
    }
  }, [id_contest]);

  const fetchLeaderboard = useCallback(async () => {
    if (!problemList.length) return;
    setLoading(true);
    try {
      const res = await api.get<{ leaderboard: LeaderboardEntry[] }>(
        `/contest/${id_contest}/leaderboard`
      );
      const data = res.data.leaderboard;
      const formatted: User[] = data.map((u) => ({
        name: u.username,
        problems: Object.fromEntries(problemList.map((p) => [p, u.problems[p] ?? 0])),
        problemTime: Object.fromEntries(problemList.map((p) => [p, u.problemTime[p] ?? ""])),
        total: u.total,
        penalty: u.penalty ?? 0,
        solved: 0,
      }));
      setUsers(formatAndSort(formatted));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id_contest, problemList]);

  useEffect(() => {
    fetchContest();
    fetchProblems();
  }, [fetchContest, fetchProblems]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(filter.toLowerCase())
  );

  const getRankBadge = (rank: number) =>
    rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank;

  const maxScorePerProblem = 100;

  const formatTime = (timestamp: string) => {
    if (!contest?.start_time || !timestamp) return "";
    const diffMs = Date.parse(timestamp) - Date.parse(contest.start_time);
    const h = Math.floor(diffMs / (1000 * 60 * 60));
    const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${h}h ${m}m`;
  };

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-full text-gray-600 bg-[#f5f5f5]">
        <div className="loader mb-3"></div>
        <p className="text-sm font-mono text-[#007acc]">Đang tải dữ liệu...</p>
      </div>
    );


  if (!contest)
    return (
      <div className="flex justify-center items-center h-full text-gray-500 font-mono">
        Không tìm thấy thông tin kỳ thi.
      </div>
    );

  if (!contest.realtime_rank && contest.time_mode !== "no_time_limit") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 font-mono">
        <p className="text-lg font-semibold mb-2">Bảng xếp hạng tạm ẩn</p>
        <p className="text-sm text-gray-600 text-center max-w-75">
          Bảng xếp hạng chỉ hiển thị khi kỳ thi bật chế độ realtime hoặc ở chế độ vô thời hạn.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-mono text-[#1e1e1e] bg-[#f5f5f5] border border-[#ccc]">
      <div className="flex justify-between items-center px-6 py-3 border-b border-[#dcdcdc] bg-[#ffffff]">
        <div className="flex items-center gap-2">
          <Trophy size={22} className="text-[#007acc]" />
          <div>
            <h1 className="text-xl font-semibold text-[#007acc]">Bảng xếp hạng</h1>
            <p className="text-[11px] text-[#555] mt-0.5">
              Cập nhật thứ hạng theo thời gian thực
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-[#007acc]"
            />
            <input
              type="text"
              placeholder="Lọc người dùng..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-7 pr-3 py-1 text-[12px] border border-[#d0d7de] rounded bg-white placeholder-[#8c8c8c]
                focus:outline-none focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] w-40"
            />
          </div>
          <button
            onClick={fetchLeaderboard}
            className="px-1.5 py-1.5 text-[12px] bg-[#007acc] text-white rounded hover:bg-[#005fa3] transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col gap-3">
          {filteredUsers.map((u, i) => (
            <div
              key={u.name}
              className="bg-white border border-[#dcdcdc] rounded-md p-3 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 text-center font-bold text-[#444]">
                    {getRankBadge(i + 1)}
                  </div>
                  <div
                    className="text-[#007acc] font-semibold truncate"
                    title={u.name}
                  >
                    {u.name}
                  </div>
                </div>

                <div
                  className="px-3 py-1 rounded text-center font-bold text-sm text-white min-w-15"
                  style={{
                    backgroundColor: `rgba(0, 122, 204, ${
                      Math.min(
                        u.total / (problemList.length * maxScorePerProblem),
                        1
                      ) * 0.9
                    })`,
                  }}
                >
                  {u.total}
                </div>
              </div>

              <div className="flex flex-wrap gap-1 justify-end">
                {problemList.map((p) => {
                  const score = u.problems[p] ?? -1;
                  const time = u.problemTime[p] ?? "";
                  return (
                    <div
                      key={p}
                      onClick={() => router.push(`/problems/${contest.id}/${p}`)}
                      className="
                        min-w-8
                        px-2 py-1
                        text-center text-sm font-semibold 
                        border border-[#d0d7de]
                        rounded-sm
                        transition-all
                        cursor-pointer
                        bg-white
                        text-[#0366d6]
                        shadow-[inset_0_0_0_1px_#ffffff]
                        hover:bg-[#eaf3ff]
                        hover:text-[#0056b3]
                        hover:border-[#007acc]
                        hover:shadow-[0_0_5px_rgba(0,122,204,0.3)]
                        active:scale-[0.97]
                      "
                    >
                      <div>{score >= 0 ? score : "—"}</div>
                      <div className="text-[10px] text-[red] font-normal">
                        {formatTime(time)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
