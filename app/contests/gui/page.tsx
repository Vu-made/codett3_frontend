"use client";

import { useContest } from "@/hooks/useContest";
import MarkdownScreen from "@/components/MarkdownScreen";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ContestInfoPage() {
  const { contest, loading } = useContest();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !contest) {
      router.push("/contests");
    }
  }, [contest, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-gray-600 bg-[#f5f5f5]">
        <div className="loader mb-3"></div>
        <p className="text-sm font-mono text-[#007acc]">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!contest) return null; 

  return (
    <div className="space-y-4">
      {contest.description ? (
        <div className="border border-[#e0e0e0] rounded p-3 bg-[#fafafa]">
          <MarkdownScreen content={contest.description} />
        </div>
      ) : (
        <p className="text-[#888] italic text-sm">
          Không có mô tả cho kỳ thi này.
        </p>
      )}
    </div>
  );
}
