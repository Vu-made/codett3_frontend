"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import clsx from "clsx";

interface SubmitDay {
  date: string;
  count: number;
}

type HeatTableProps = {
  className?: string;
};


export default function HeatTable( { className } : HeatTableProps ) {
  const [data, setData] = useState<SubmitDay[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [years, setYears] = useState(1);

  
  useEffect(() => {
      const fetchData = async () => {
        try {
          const res = await api.get(`/problem/calendar?year=${year}&years=${years}`);
          setData(res.data);
        } catch {
          setData([]);
        }
      };
    fetchData();
  }, [year, years]);

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const map = new Map(data.map((d) => [d.date, d.count]));

  const yearsToShow = Array.from({ length: years }, (_, i) => year - i).reverse();

  const getColor = (count: number) => {
    if (count === 0) return "bg-gray-200 dark:bg-gray-700";
    const level = Math.ceil((count / maxCount) * 4);
    return [
      "bg-green-100",
      "bg-green-300",
      "bg-green-500",
      "bg-green-600",
      "bg-green-800",
    ][level];
  };

  const weekdayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className={clsx("bg-white border border-[#ccc] p-3 space-y-6" , className )}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Lịch Submit</h2>
        <div className="flex items-center gap-3">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border border-[#ccc] px-2 py-1 text-sm"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="border border-[#ccc] px-2 py-1 text-sm"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} năm
              </option>
            ))}
          </select>
        </div>
      </div>

      {yearsToShow.map((y) => {
        const start = new Date(y, 0, 1);
        const end = new Date(y + 1, 0, 1);
        const days: Date[] = [];
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
          days.push(new Date(d));
        }

        const weeks: Date[][] = [];
        for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

        // tìm vị trí tháng
        const monthPositions: { [month: number]: number } = {};
        weeks.forEach((week, i) => {
          const firstDay = week[0];
          if (firstDay.getDate() <= 7 && !monthPositions[firstDay.getMonth()]) {
            monthPositions[firstDay.getMonth()] = i;
          }
        });

        return (
          <div key={y}>
            <h3 className="text-sm font-medium mb-1 text-gray-600">{y}</h3>
            <div className="flex ml-10 mb-1 text-xs text-gray-500">
              {weeks.map((_, i) => {
                const month = Object.entries(monthPositions).find(([, pos]) => pos === i);
                return (
                  <div key={i} className="w-3 h-3 text-center">
                    {month ? monthNames[Number(month[0])] : ""}
                  </div>
                );
              })}
            </div>
            <div className="flex">
              <div className="flex flex-col justify-between mr-2 text-xs text-gray-500">
                {weekdayLabels.map((label, i) => (
                  <div key={i} className="h-3">
                    {label}
                  </div>
                ))}
              </div>
              <div className="flex gap-0.75">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-0.75">
                    {week.map((day) => {
                      const key = day.toISOString().split("T")[0];
                      const count = map.get(key) ?? 0;
                      return (
                        <div
                          key={key}
                          title={`${key} — ${count} lần nộp`}
                          className={`w-3 h-3 rounded-xs transition-transform hover:scale-110 ${getColor(count)}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
