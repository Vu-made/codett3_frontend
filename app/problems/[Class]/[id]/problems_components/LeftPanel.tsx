"use client";

import MarkdownScreen from "@/components/MarkdownScreen";
import ProblemSubmissionsPage from "./submissions";
import { useState } from "react";

interface Sample {
  input: string;
  output: string;
}

interface Problem {
  title: string;
  display_id: string;
  description: { format: string; value: string };
  input_description?: { format: string; value: string };
  output_description?: { format: string; value: string };
  hint?: { format: string; value: string };
  samples?: Sample[];
  tags?: string[];
  time_limit: number;
  memory_limit: number;
  score?: number;
  io_mode?: string;
  input_file?: string;
  output_file?: string;
}

export default function LeftPanel({
  problem,
  activeTab,
  setActiveTab,
  reloadSubmissions,
  isSplitView = false,
}: {
  problem: Problem;
  activeTab?: "description" | "submissions" | "code";
  setActiveTab?: (tab: "description" | "submissions" | "code") => void;
  reloadSubmissions?: number;
  isSplitView?: boolean;
}) {
  return (
    <div
      className={`flex flex-col bg-[#FFFFFF] h-full w-full overflow-auto ${
        isSplitView ? "" : "lg:flex-row"
      }`}
    >
      {setActiveTab && (
        <div className="h-9 bg-[#F3F3F3] border-b border-[#D0D0D0] flex items-center px-2 gap-1">
          <button
            onClick={() => setActiveTab("description")}
            className={`px-3 py-1 text-xs rounded transition ${
              activeTab === "description"
                ? "bg-[#FFFFFF] text-black shadow-sm"
                : "text-[#777] hover:text-black"
            }`}
          >
            <i className="fas fa-file-alt mr-1.5" /> Mô tả
          </button>
          <button
            onClick={() => setActiveTab("submissions")}
            className={`px-3 py-1 text-xs rounded transition ${
              activeTab === "submissions"
                ? "bg-[#FFFFFF] text-black shadow-sm"
                : "text-[#777] hover:text-black"
            }`}
          >
            <i className="fas fa-history mr-1.5" /> Bài nộp
          </button>
        </div>
      )}

      {activeTab === "submissions" ? (
        <div className="h-full w-full overflow-y-auto">
          <ProblemSubmissionsPage reloadTrigger={reloadSubmissions ?? 0} />
        </div>
      ) : (
        <div className="h-full w-full overflow-y-auto flex">
          <div className="flex flex-col gap-5 p-5 pb-50 w-full h-full">
            <div className="flex gap-2 items-center">
              <h1 className="font-bold text-2xl">{problem.title}</h1>
              <p className="font-medium text-xs text-[#555]">
                {problem.display_id && `(${problem.display_id})`}
              </p>
            </div>

            <Section title="Mô tả bài toán" content={problem.description.value} />
            {problem.input_description && (
              <Section title="Dữ liệu vào" content={problem.input_description.value} />
            )}
            {problem.output_description && (
              <Section title="Dữ liệu ra" content={problem.output_description.value} />
            )}
            {problem.samples?.length ? <SampleList samples={problem.samples} /> : null}
            {problem.hint && <Section title="Gợi ý" content={problem.hint.value} />}

            {isSplitView && (
              <div className="px-5 min-w-90 border-[#E0E0E0]">
                <ProblemInfo problem={problem} />
              </div>
            )}
            <div className="h-20 shrink-0" />
          </div>

          {!isSplitView && (
            <div className="px-5 min-w-90 w-auto border-[#E0E0E0] p-4 shrink-0 sticky z-10 top-0">
              <ProblemInfo problem={problem} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const Section = ({ title, content }: { title: string; content: string }) => (
  <section className="h-auto">
    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
      <span className="w-1 h-4 bg-[#007ACC] rounded" />
      {title}
    </h3>
    <div className="ml-3 text-sm leading-relaxed text-[#333]">
      <MarkdownScreen content={content} />
    </div>
  </section>
);

const SampleList = ({ samples }: { samples: Sample[] }) => (
  <section>
    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
      <span className="w-1 h-4 bg-[#007ACC] rounded" /> Ví dụ mẫu
    </h3>
    <div className="space-y-2.5">
      {samples.map((s, idx) => (
        <div key={idx} className="bg-[#FAFAFA] border border-[#E0E0E0] rounded overflow-hidden">
          <div className="bg-[#F3F3F3] px-3 py-1.5 flex justify-between items-center border-b border-[#E0E0E0]">
            <span className="text-xs font-medium text-[#007ACC]">
              <i className="fas fa-code mr-1" />
              Ví dụ {idx + 1}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(s.input)}
              className="text-[10px] px-2 py-0.5 bg-[#E0E0E0] hover:bg-[#D5D5D5] text-[#333] rounded transition"
            >
              <i className="fas fa-copy mr-1" /> Sao chép
            </button>
          </div>
          <div className="p-3 space-y-2">
            <SampleBlock label="Dữ liệu vào" value={s.input} />
            <SampleBlock label="Dữ liệu ra" value={s.output} />
          </div>
        </div>
      ))}
    </div>
  </section>
);

const SampleBlock = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-[10px] font-semibold text-[#666] mb-1 uppercase tracking-wide">{label}</div>
    <pre className="whitespace-pre-wrap bg-[#FFFFFF] border border-[#E0E0E0] rounded p-2 text-xs font-mono text-black">
      {value.trim() || "(trống)"}
    </pre>
  </div>
);

const ProblemInfo = ({ problem }: { problem: Problem }) => (
  <div className="mt-5 bg-[#FFFBEA] border border-[#E0C97F] shadow-sm rounded-md p-4 text-[13px] text-[#3B3B3B] relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-1 bg-[#F2CB05]" />
    <h2 className="font-semibold text-[#8A6D1D] flex items-center gap-2 mb-2">
      <i className="fas fa-sticky-note"></i>
      <span>Thông tin bài toán</span>
    </h2>

    <div className="space-y-1.5 mt-2">
      <InfoRow icon="fa-clock" label="Thời gian giới hạn" value={`${problem.time_limit} ms`} />
      <InfoRow icon="fa-memory" label="Giới hạn bộ nhớ" value={`${problem.memory_limit} MB`} />
      {problem.score !== undefined && (
        <InfoRow icon="fa-star" label="Điểm tối đa" value={String(problem.score)} />
      )}
      {problem.io_mode && (
        <InfoRow icon="fa-plug" label="Chế độ nhập/xuất" value={problem.io_mode} />
      )}
      {problem.input_file && problem.io_mode !== "stdin" && (
        <InfoRow
          icon="fa-file-import"
          label="Tệp dữ liệu vào"
          value={problem.input_file}
          copyable
        />
      )}
      {problem.output_file && problem.io_mode !== "stdin" && (
        <InfoRow
          icon="fa-file-export"
          label="Tệp dữ liệu ra"
          value={problem.output_file}
          copyable
        />
      )}
    </div>
  </div>
);

const InfoRow = ({
  label,
  value,
  icon,
  copyable = false,
}: {
  label: string;
  value: string;
  icon?: string;
  copyable?: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex gap-10 justify-between items-center border-b border-dashed border-[#E8E0B5] py-1 group">
      <span className="flex items-center gap-1 text-[#6B5E2E]">
        {icon && <i className={`fas ${icon} text-[#C1A11E] w-4 text-[12px]`} />}
        {label}
      </span>

      <div className="flex items-center gap-2">
        <span className="text-[#2c2c2c8f] font-bold">{value}</span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="text-[#8A6D1D] hover:text-[#C1A11E] transition"
            title="Sao chép"
          >
            <i className={`fas ${copied ? "fa-check text-green-600" : "fa-copy"}`}></i>
          </button>
        )}
      </div>
    </div>
  );
};