"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Split from "react-split";
import api from "@/lib/api";
import { useLayoutStore } from "@/stores/layoutStore";
import ProblemSubmissionsPage from "./problems_components/submissions";
import RightPanel_SplitView from "./problems_components/RightPanel_SplitView";
import LeftPanel from "./problems_components/LeftPanel";
import { toast } from "sonner";

const LANGUAGES = [
  { id: "c_cpp", name: "C++" },
  { id: "python", name: "Python" },
];

type TabType = "description" | "submissions" | "code";
const languageNameToId = Object.fromEntries(LANGUAGES.map(l => [l.name, l.id]));
const languageIdToName = Object.fromEntries(LANGUAGES.map(l => [l.id, l.name]));

interface Sample {
  input: string;
  output: string;
}

interface Problem {
  id: number;
  display_id: string;
  title: string;
  time_limit: number;
  memory_limit: number;
  score?: number;
  description: { format: string; value: string };
  input_description?: { format: string; value: string };
  output_description?: { format: string; value: string };
  hint?: { format: string; value: string };
  tags?: string[];
  samples?: Sample[];
  io_mode?: string;
  input_file?: string;
  output_file?: string;
  allowed_languages: string;
  max_submission_attempts:number;
}

interface SubmissionState {
  code: string;
  language: string;
  score: number;
  judging: boolean;
  error: boolean;
  uuid: string;
  count_submission:number;
}

export default function ProblemPage() {
  const { id, Class } = useParams();
  const router = useRouter();

  const { layoutMode } = useLayoutStore();
  const [activeTab, setActiveTab] = useState<"description" | "submissions" | "code">("description");
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [found, setFound] = useState(true);
  const [reloadSubmissions, setReloadSubmissions] = useState(0);

  const [submission, setSubmission] = useState<SubmissionState>({
    code: "",
    language: "c_cpp",
    score: 0,
    judging: false,
    error: false,
    uuid: "",
    count_submission: 0 
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.post(`/problem/get`, { id, class_: Class });
        setProblem(res.data);
      } catch (err) {
        console.log("Lỗi tải problem:", err);
        setFound(false);
      }
    })();
  }, [id, Class]);

  useEffect(() => {
    if (!problem) return;
    (async () => {
      try {
        const res = await api.post(`/problem/latest_submission`, { id, class_: Class });
        if (res.status === 200 && res.data?.code) {
          setSubmission(prev => ({
            ...prev,
            code: res.data.code,
            score: res.data.score ?? 0,
            language: languageNameToId[res.data.language] ?? "c_cpp",
            uuid: res.data.uuid,
            max_submission_attempts:res.data.max_submission_attempts,
            count_submission: res.data.count_submission
          }));
        }
      } catch {
        console.log("Chưa có bài nộp nào gần nhất");
      } finally {
        setLoading(false);
      }
    })();
  }, [problem, Class, id]);

  const handleSubmit = useCallback(async () => {
    if (!problem || !submission.code.trim()) {
      toast.error("Vui lòng nhập mã nguồn trước khi nộp bài!",{
        position:"top-center",
        duration: 1000
      })
      return;
    }
    setSubmission(prev => ({ ...prev, judging: true, error: false }));

    try {
      const payload = {
        problem_id: problem.id,
        language: languageIdToName[submission.language],
        code: submission.code,
        class_: Class,
      };
      const res = await api.post("/problem/submit", payload);
      const data = res.data ;
      if (res.status === 200) {
        setSubmission(prev => ({
          ...prev,
          score: res.data?.score ?? 0,
          judging: false,
          uuid: res.data.uuid,
          count_submission : res.data.count_submission,
        }));
        setReloadSubmissions(prev => prev + 1);
      } else {
        if ( data?.status == "MAX_SUBMISSION_REACHED" ){
          toast.error("Bạn đã hết lượt chấm bài!",{
            position:"top-center",
            duration: 1000 
          })
        }
        setSubmission(prev => ({ ...prev, error: true, judging: false }));
      }
    } catch (err) {
      console.log("Lỗi gửi bài:", err);
      setSubmission(prev => ({ ...prev, error: true, judging: false }));
    }
  }, [problem, submission, Class]);

  if (!found) return <div className="flex items-center justify-center h-screen bg-[#FAFAFA]">Không tìm thấy bài tập.</div>;
  if (loading || !problem)
    return (
      <div className="flex flex-col justify-center items-center h-full text-gray-600 bg-[#f5f5f5]">
        <div className="loader mb-3"></div>
        <p className="text-sm font-mono text-[#007acc]">Đang tải dữ liệu...</p>
      </div>
    );

  return (
    <div className="h-full w-full flex flex-col bg-[#FAFAFA]">
      <div className="overflow-hidden w-full h-full">
        {layoutMode === "split" ? (
          <div className="flex w-full h-full">
            <Split sizes={[50, 50]} minSize={[300, 400]} gutterSize={4} direction="horizontal" className="flex h-full w-full">
              <LeftPanel
                problem={problem}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                reloadSubmissions={reloadSubmissions}
                isSplitView={true}
              />
              <RightPanel_SplitView
                problem={problem}
                submission={submission}
                setSubmission={setSubmission}
                handleSubmit={handleSubmit}
                router={router}
              />
            </Split>
          </div>
        ) : (
          <div className="flex flex-col h-full w-full">
            <div className="h-9 bg-[#F3F3F3] border-b border-[#D0D0D0] flex items-center px-2 gap-1">
              {["description", "code", "submissions"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as TabType)}
                  className={`px-3 py-1 text-xs rounded transition ${
                    activeTab === tab ? "bg-[#FFFFFF] text-black shadow-sm" : "text-[#777] hover:text-black"
                  }`}
                >
                  <i
                    className={`fas ${
                      tab === "description"
                        ? "fa-file-alt"
                        : tab === "submissions"
                        ? "fa-history"
                        : "fa-code"
                    } mr-1.5`}
                  />
                  {tab === "description" ? "Mô tả" : tab === "submissions" ? "Bài nộp" : "Mã nguồn"}
                </button>
              ))}
            </div>
            <div className="h-full w-full overflow-auto bg-white">
              {activeTab === "description" && <LeftPanel problem={problem} activeTab="description" />}
              {activeTab === "submissions" && <ProblemSubmissionsPage reloadTrigger={reloadSubmissions} />}
              {activeTab === "code" && (
                <RightPanel_SplitView
                  problem={problem}
                  submission={submission}
                  setSubmission={setSubmission}
                  handleSubmit={handleSubmit}
                  router={router}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
