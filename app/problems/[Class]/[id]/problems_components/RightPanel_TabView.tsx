"use client";
import { useState } from "react";
import AceEditor from "react-ace";
import { useRouter } from "next/navigation";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-chrome";
import "ace-builds/src-noconflict/ext-language_tools";
import api from "@/lib/api";
import Split from "react-split";

interface Problem {
  id: number;
  score?: number;
  allowed_languages: string;
}

export interface SubmissionState {
  code: string;
  language: string;
  score: number;
  judging: boolean;
  error: boolean;
  uuid: string;
}

interface RightPanelProps {
  problem: Problem;
  submission: SubmissionState;
  setSubmission: React.Dispatch<React.SetStateAction<SubmissionState>>;
  handleSubmit: () => Promise<void> | void;
  router: ReturnType<typeof useRouter>;
  showRunPanel?: boolean;
}

const LANGUAGES = [
  { id: "c_cpp", name: "C++" },
  { id: "python", name: "Python" },
];

const languageIdToName = Object.fromEntries(LANGUAGES.map(l => [l.id, l.name]));

export default function RightPanel_TabView({
  problem,
  submission,
  setSubmission,
  handleSubmit,
  router,
}: RightPanelProps) {
  const [inputData, setInputData] = useState("");
  const [outputData, setOutputData] = useState("");
  const [running, setRunning] = useState(false);

  const maxScore = problem.score ?? 100;

  const handleRun = async () => {
    if (!submission.code.trim()) {
      alert("Vui lòng nhập code trước khi chạy!");
      return;
    }

    setRunning(true);
    setOutputData("Đang chạy...");

    try {
      const payload = {
        problem_id: problem.id,
        language: languageIdToName[submission.language],
        code: submission.code,
        input: inputData,
      };
      const res = await api.post("/problem/run", payload);
      setOutputData(res.data?.output ?? "Không có kết quả trả về.");
    } catch (err) {
      console.error("Lỗi khi chạy code:", err);
      setOutputData("Lỗi khi chạy code!");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col bg-[#ffffff] h-full w-full text-sm">
      <Split sizes={[70, 30]} minSize={[0, 0]} gutterSize={2} direction="vertical" className="w-full h-full">
        <div className="flex w-full h-full overflow-hidden">
          <Split
            sizes={[65, 35]}
            minSize={[350, 300]}
            gutterSize={2}
            direction="horizontal"
            className="flex h-full w-full"
          >
            <div className="flex flex-col w-full h-full">
              <div className="h-9 bg-[#f3f3f3] border-b border-[#e0e0e0] flex items-center justify-between px-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-white text-xs rounded border border-[#d0d0d0]">
                    <i className="fas fa-file-code text-[#007acc]" />
                    <span>solution.{submission.language === "c_cpp" ? "cpp" : "py"}</span>
                  </div>

                  <select
                    value={submission.language}
                    onChange={e =>
                      setSubmission(prev => ({
                        ...prev,
                        language: e.target.value,
                      }))
                    }
                    className="px-2 py-1 bg-white border border-[#d0d0d0] text-xs rounded focus:outline-none focus:border-[#007acc] hover:border-[#007acc] transition"
                  >
                    {LANGUAGES.filter(l => problem.allowed_languages?.includes(l.name)).map(l => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleRun}
                    disabled={running}
                    className={`px-3 py-1 text-xs rounded transition flex items-center gap-1 font-medium ${
                      running
                        ? "bg-[#e0e0e0] text-[#888] cursor-not-allowed"
                        : "bg-[#007acc] hover:bg-[#0d8ef0] text-white"
                    }`}
                  >
                    <i className="fas fa-play" />
                    {running ? "Running..." : "Run"}
                  </button>

                  <button
                    onClick={handleSubmit}
                    disabled={submission.judging}
                    className={`px-3 py-1 text-xs rounded transition flex items-center gap-1 font-medium ${
                      submission.judging
                        ? "bg-[#e0e0e0] text-[#888] cursor-not-allowed"
                        : "bg-[#43a047] hover:bg-[#4caf50] text-white"
                    }`}
                  >
                    <i className="fas fa-paper-plane" />
                    {submission.judging ? "Judging..." : "Submit"}
                  </button>

                  {submission.uuid && (
                    <button
                      onClick={() => router.push(`/submission/${submission.uuid}`)}
                      className="px-3 py-1 bg-[#eaeaea] hover:bg-[#dddddd] text-[#333] text-xs rounded border border-[#d0d0d0] transition"
                    >
                      <i className="fas fa-history" /> Latest
                    </button>
                  )}
                </div>

                <div
                  className="text-xs font-semibold"
                  style={{ color: getPointColor(submission.score, maxScore) }}
                >
                  {submission.score} / {maxScore}
                </div>
              </div>

              <AceEditor
                mode={submission.language}
                theme="chrome"
                width="100%"
                height="100%"
                value={submission.code}
                onChange={(code: string) => setSubmission(prev => ({ ...prev, code }))}
                fontSize={14}
                showPrintMargin={false}
                showGutter
                highlightActiveLine
                setOptions={{
                  enableBasicAutocompletion: true,
                  enableLiveAutocompletion: true,
                  tabSize: 4,
                  fontFamily: "'Consolas', 'Courier New', monospace",
                }}
              />
            </div>

            <div className="w-full h-full border-l border-[#e0e0e0] flex flex-col">
              <div className="bg-[#f3f3f3] h-9 flex items-center text-xs font-semibold px-3 border-b border-[#e0e0e0] text-[#333]">
                <i className="fas fa-keyboard text-[#007acc] mr-2" /> Input
              </div>
              <AceEditor
                mode="plain_text"
                theme="chrome"
                width="100%"
                height="100%"
                value={inputData}
                onChange={setInputData}
                fontSize={13}
                showGutter
                highlightActiveLine={false}
                setOptions={{
                  wrap: true,
                  fontFamily: "'Consolas', 'Courier New', monospace",
                }}
              />
            </div>
          </Split>
        </div>

        <div className="w-full h-full flex flex-col">
          <div className="bg-[#f3f3f3] border-b border-[#e0e0e0] text-xs font-semibold px-3 py-1.5 text-[#333] flex items-center">
            <i className="fas fa-terminal text-[#007acc] mr-2" /> Output
          </div>
          <AceEditor
            mode="plain_text"
            theme="chrome"
            width="100%"
            height="100%"
            value={outputData}
            readOnly
            fontSize={13}
            showGutter
            highlightActiveLine={false}
            setOptions={{
              wrap: true,
              tabSize: 4,
              fontFamily: "'Consolas', 'Courier New', monospace",
            }}
          />
        </div>
      </Split>
    </div>
  );
}

export function getPointColor(score: number, maxScore: number) {
  if (!maxScore) return "#d32f2f";
  const ratio = Math.min(Math.max(score / maxScore, 0), 1);
  const endR = 0x43,
    endG = 0xa0,
    endB = 0x47;
  const r = Math.round(211 * (1 - ratio) + endR * ratio);
  const g = Math.round(47 * (1 - ratio) + endG * ratio);
  const b = Math.round(47 * (1 - ratio) + endB * ratio);
  return `rgb(${r},${g},${b})`;
}
