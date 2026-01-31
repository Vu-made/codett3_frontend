"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { Copy } from "lucide-react";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-tomorrow";

interface TestCaseResult {
  status: string;
  stdout?: string;
  stderr?: string;
  expected?: string;
  time: number;
  memory: number;
}

interface CompileErrorDetail {
  error: true;
  detail: string;
}

interface SubmissionDetails {
  error?: boolean;
  detail?: string;
  [key: string]:
    | TestCaseResult
    | CompileErrorDetail
    | string
    | boolean
    | undefined;
}

interface SubmissionDetail {
  uuid: string;
  problem_id: number;
  username: string;
  language: string;
  score: number;
  verdict: string;
  code: string;
  details: SubmissionDetails;
  submitted_at: string;
}

function isTestCaseResult(value: unknown): value is TestCaseResult {
  if (typeof value !== "object" || value === null) return false;
  const maybe = value as Partial<TestCaseResult>;
  return (
    typeof maybe.status === "string" &&
    typeof maybe.time === "number" &&
    typeof maybe.memory === "number"
  );
}

export default function SubmissionDetailPage() {
  const { uuid } = useParams();
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get<SubmissionDetail>(`/problem/submission/${uuid}`);
        setSubmission(res.data);
      } catch {
        setError("Không thể tải chi tiết submission!");
      }
    };
    fetchDetail();
  }, [uuid]);

  const statusConfig = useMemo(
    () => ({
      AC: { label: "Accepted", color: "border-green-500 bg-green-50 text-green-700" },
      WA: { label: "Wrong Answer", color: "border-red-500 bg-red-50 text-red-700" },
      TLE: { label: "Time Limit Exceeded", color: "border-orange-500 bg-orange-50 text-orange-700" },
      MLE: { label: "Memory Limit Exceeded", color: "border-purple-500 bg-purple-50 text-purple-700" },
      RE: { label: "Runtime Error", color: "border-yellow-500 bg-yellow-50 text-yellow-700" },
      CE: { label: "Compiler Error", color: "border-gray-500 bg-gray-50 text-gray-700" },
      FNF: { label: "File Not Found", color: "border-blue-500 bg-blue-50 text-blue-700" },
      default: { label: "Unknown Result", color: "border-gray-400 bg-gray-100 text-gray-800" },
    }),
    []
  );

  const getStatus = (status: string) =>
    statusConfig[status as keyof typeof statusConfig] || statusConfig.default;

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", { hour12: false });
  };

  const copyCode = () => {
    if (submission?.code) navigator.clipboard.writeText(submission.code);
  };

  if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;
  if (!submission)
    return (
      <div className="flex flex-col justify-center items-center h-full text-gray-600 bg-[#f5f5f5]">
        <div className="loader mb-3"></div>
        <p className="text-sm font-mono text-[#007acc]">Đang tải dữ liệu...</p>
      </div>
    );

  const isCompileError =
    submission.details.error === true ||
    (submission.verdict === "CE" && typeof submission.details.detail === "string");

  const testcases = Object.entries(submission.details).filter(([key, value]) => {
    return !["error", "detail"].includes(key) && isTestCaseResult(value);
  }) as [string, TestCaseResult][];

  const getCompileError = (): string => {
    if (typeof submission.details.detail === "string") return submission.details.detail;
    for (const val of Object.values(submission.details)) {
      if (isTestCaseResult(val) && val.stderr) return val.stderr;
    }
    return "Không có thông tin lỗi biên dịch.";
  };

  const compileError = getCompileError();

  return (
    <div className="bg-[#f3f3f3] text-gray-900 min-h-screen px-8 py-10 font-sans">
      <div className="max-w-5xl mx-auto bg-[#ffffff] rounded-lg shadow-sm border border-[#dcdcdc] overflow-hidden">
        <div className="flex justify-between items-center border-b border-[#dcdcdc] bg-[#fafafa] px-6 py-4">
          <h2 className="text-lg font-semibold tracking-wide">Chi tiết Submission</h2>
          <span className="text-xs text-gray-500 font-mono">{submission.uuid}</span>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-6 text-sm">
          <p><span className="font-semibold">Người nộp:</span> {submission.username}</p>
          <p><span className="font-semibold">Bài tập ID:</span> {submission.problem_id}</p>
          <p><span className="font-semibold">Ngôn ngữ:</span> {submission.language}</p>
          <p><span className="font-semibold">Điểm:</span> {submission.score}</p>
          <p>
            <span className="font-semibold">Kết quả:</span>{" "}
            <span className={`px-2 py-0.5 text-xs font-semibold border rounded-md ${getStatus(submission.verdict).color}`}>
              {getStatus(submission.verdict).label}
            </span>
          </p>
          <p><span className="font-semibold">Thời gian nộp:</span> {formatDate(submission.submitted_at)}</p>
        </div>

        {isCompileError ? (
          <div className="border-t border-[#dcdcdc] bg-[#fafafa]">
            <h3 className="px-6 py-3 font-semibold text-red-600 border-b border-[#dcdcdc]">
              Chi tiết lỗi biên dịch
            </h3>
            <pre className="p-5 bg-[#fff8f8] text-sm text-red-700 overflow-auto whitespace-pre-wrap font-mono border-t border-[#e5e5e5]">
              {compileError}
            </pre>
          </div>
        ) : (
          testcases.length > 0 && (
            <div className="border-t border-[#dcdcdc]">
              <h3 className="bg-[#fafafa] px-6 py-3 font-semibold border-b border-[#dcdcdc]">
                Kết quả các Testcase
              </h3>
              <div className="p-5 flex flex-col gap-3">
                {testcases.map(([i, d]) => (
                  <div
                    key={i}
                    className={`border rounded-md px-4 py-3 ${getStatus(d.status).color} flex justify-between items-center`}
                  >
                    <div className="flex gap-6 items-center">
                      <span className="font-mono text-sm font-bold">#{i}</span>
                      <span className="font-semibold text-sm">{getStatus(d.status).label}</span>
                      {d.stderr && <p className="text-xs text-gray-700 truncate max-w-75">{d.stderr}</p>}
                    </div>
                    <p className="text-xs text-gray-600 font-mono">{d.time} ms | {d.memory} MB</p>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        <div className="border-t border-[#dcdcdc]">
          <div className="bg-[#fafafa] px-6 py-3 flex justify-between items-center border-b border-[#dcdcdc]">
            <h3 className="font-semibold text-sm">Code đã nộp</h3>
            <button
              onClick={copyCode}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
            >
              <Copy size={14} /> Sao chép
            </button>
          </div>
          <div className="p-4">
            <AceEditor
              mode={
                submission.language.toLowerCase().includes("python")
                  ? "python"
                  : submission.language.toLowerCase().includes("java")
                  ? "java"
                  : "c_cpp"
              }
              theme="tomorrow"
              name="readonly-editor"
              value={submission.code}
              readOnly
              width="100%"
              fontSize={14}
              className="border border-[#dcdcdc] rounded-md shadow-sm"
              minLines={18}
              maxLines={Infinity}
              setOptions={{
                showGutter: true,
                highlightActiveLine: false,
                useWorker: false,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
