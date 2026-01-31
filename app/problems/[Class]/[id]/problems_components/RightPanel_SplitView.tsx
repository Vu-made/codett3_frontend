import AceEditor from "react-ace";
import { useRouter } from "next/navigation";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-chrome";
import "ace-builds/src-noconflict/ext-language_tools";

interface Problem {
  id: number;
  score?: number;
  allowed_languages: string;
  max_submission_attempts:number;
}

export interface SubmissionState {
  code: string;
  language: string;
  score: number;
  judging: boolean;
  error: boolean;
  uuid: string;
  count_submission:number;
}

interface RightPanelProps {
  problem: Problem;
  submission: SubmissionState;
  setSubmission: React.Dispatch<React.SetStateAction<SubmissionState>>;
  handleSubmit: () => Promise<void> | void;
  router: ReturnType<typeof useRouter>;
}

const LANGUAGES = [
  { id: "c_cpp", name: "C++" },
  { id: "python", name: "Python" },
];

const languageIdToName = Object.fromEntries(LANGUAGES.map(l => [l.id, l.name]));

export default function RightPanel_SplitView({
  problem,
  submission,
  setSubmission,
  handleSubmit,
  router,
}: RightPanelProps) {
  const maxScore = problem.score ?? 100;

  return (
    <div className="flex flex-col bg-[#FFFFFF] h-full w-full">
      <div className="h-9 bg-[#F3F3F3] border-b border-[#D0D0D0] flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#FFFFFF] text-xs rounded border border-[#D0D0D0]">
            <i className="fas fa-file-code text-[#007ACC]" />
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
            className="px-2 py-1 bg-[#FFFFFF] border border-[#D0D0D0] text-xs rounded focus:outline-none focus:border-[#007ACC]"
          >
            {LANGUAGES.filter(l => problem.allowed_languages?.includes(l.name)).map(l => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div
          className="flex items-center justify-center gap-2 px-3 py-0.5 rounded-sm text-sm font-semibold border transition-all"
          style={{
            backgroundColor: "#F8FAFC",
            color: getPointColor(submission.score, maxScore),
            borderColor: "#ccc",
          }}
        >
          <i className="fas fa-star text-[13px]" />
          <span className="font-bold tracking-wide">
            {submission.score} /{maxScore}
          </span>
          <span className="text-[11px] text-[#555]">điểm</span>
        </div>

      </div>

      <div className="flex-1 overflow-hidden">
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

      <div className="h-10 bg-[#F3F3F3] border-t border-[#D0D0D0] flex items-center justify-between px-4">
        <div className="flex items-center gap-3 text-[#333] text-xs">
          <span className="flex items-center gap-1.5">
            <i className="fas fa-code" />
            {languageIdToName[submission.language]}
          </span>
          <span className="flex items-center gap-1.5">
            <i className="fas fa-file-alt" />
            Mã hóa: UTF-8
          </span>
        </div>

        <div className="flex items-center gap-2">
          {submission.uuid && (
            <button
              onClick={() => router.push(`/submission/${submission.uuid}`)}
              className="px-3 py-1 bg-[#007ACC] hover:bg-[#0D89E5] text-white text-xs rounded transition flex items-center gap-1.5"
            >
              <i className="fas fa-file-alt" /> Bài nộp gần nhất
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={submission.judging}
            className={`px-4 py-1 text-xs rounded font-medium transition flex items-center gap-1.5 ${
              submission.judging
                ? "bg-[#E0E0E0] text-[#888] cursor-not-allowed"
                : "bg-[#43A047] hover:bg-[#4CAF50] text-white"
            }`}
          >
            <i className="fas fa-play" />
            {submission.judging
              ? "Đang chấm..."
              : (
                problem.max_submission_attempts > -1 ?
                `Nộp bài ${submission.count_submission}/${problem.max_submission_attempts}`:
                `Nộp bài`
              )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function getPointColor(score: number, maxScore: number) {
  if (!maxScore) return "#d32f2f";
  const ratio = Math.min(Math.max(score / maxScore, 0), 1);
  const endR = 0x43, endG = 0xa0, endB = 0x47;
  const r = Math.round(211 * (1 - ratio) + endR * ratio);
  const g = Math.round(47 * (1 - ratio) + endG * ratio);
  const b = Math.round(47 * (1 - ratio) + endB * ratio);
  return `rgb(${r},${g},${b})`;
}
