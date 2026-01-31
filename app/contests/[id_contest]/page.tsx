"use client";

import { useContest } from "./layout";
import MarkdownScreen from "@/components/MarkdownScreen";

export default function ContestInfoPage() {
  const contest = useContest();

  if (!contest) return <p>Không có dữ liệu.</p>;

  return (
    <div className="space-y-4">
      {contest.description ? (
        <div className="border border-[#e0e0e0] rounded p-3 bg-[#fafafa]">
          <MarkdownScreen content={contest.description} />
        </div>
      ) : (
        <p className="text-[#888] italic text-sm">Không có mô tả cho kỳ thi này.</p>
      )}
    </div>
  );
}
