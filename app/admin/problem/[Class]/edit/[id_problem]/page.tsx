"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import MarkdownEditor from "@/components/MarkdownEditor";
import ProblemConfig, { ConfigValues } from "@/components/ProblemConfig";
import SpjEditor, { SpjData } from "@/components/SpjEditor";
import clsx from "clsx";
import ConfirmModal from "@/components/ConfirmModal";
import JSZip from "jszip";
import { toast } from "sonner";

interface Sample {
  input: string;
  output: string;
  isOpen: boolean;
}

export default function EditProblemPage() {
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [testCases, setTestCases] = useState<{ input_name: string; output_name: string }[]>([]);
  const [isOpenTestCase, setIsOpenTestCase] = useState(false);
  const { Class } = useParams();
  const { id_problem } = useParams();

  const upload_test = useCallback(
    async () => {
      if (!zipFile) return;
      try {
        toast.info("Đang tải file ZIP lên server...");
        const formData = new FormData();
        formData.append("file", zipFile);
        await api.post(`/admin/problems/${id_problem}/upload_zip`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Đã tải lên test cases thành công!");
      } catch (err) {
        console.error("Upload error:", err);
        toast.error("Tải lên test cases thất bại!");
      }
    },
    [zipFile, id_problem]
  );

  const handleLoadZip = async (file: File) => {
    try {
      const zip = await JSZip.loadAsync(file);
      const filenames = Object.keys(zip.files);

      const inputs = filenames
        .filter((f) => f.endsWith(".in"))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      const outputs = filenames
        .filter((f) => f.endsWith(".out"))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

      const merged: { input_name: string; output_name: string }[] = [];
      const count = Math.min(inputs.length, outputs.length);
      for (let i = 0; i < count; i++) {
        merged.push({ input_name: inputs[i], output_name: outputs[i] });
      }
      setZipFile(file);
      setTestCases(merged);
      toast.success(`Đã tải ${merged.length} test case từ file ZIP`);
    } catch (err) {
      console.error("ZIP read error:", err);
      toast.error("File ZIP không hợp lệ hoặc lỗi khi đọc!");
    }
  };

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    display_id: "",
    title: "",
    hint: "",
    ioMode: "stdin",
    inputFile: "",
    outputFile: "",
  });

  const [descriptions, setDescriptions] = useState({
    content: "",
    input: "",
    output: "",
  });

  const [useSpecial, setUseSpecial] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [samples, setSamples] = useState([{ input: "", output: "", isOpen: true }]);
  const [score, setScore] = useState<number | "">("");
  const [config, setConfig] = useState<ConfigValues>({
    time_limit: 1000,
    memory_limit: 256,
    allowed_languages: ["C++"],
    tags: [],
    visible: false,
    difficulty: "normal",
  });
  const [spj, setSpj] = useState<SpjData>({ language: "cpp", code: "", isOpen: false });

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await api.get(`/admin/problems/${id_problem}`);
        const p = res.data;

        setTestCases(p.test_case_score);
        setUseSpecial(p.use_spj);
        setFormData({
          display_id: p.display_id,
          title: p.title,
          hint: p.hint?.value || "",
          ioMode: p.io_mode || "stdin",
          inputFile: p.input_file || "",
          outputFile: p.output_file || "",
        });

        setDescriptions({
          content: p.description?.value || "",
          input: p.input_description?.value || "",
          output: p.output_description?.value || "",
        });

        setSamples(
          (p.samples ?? []).map(
            (s: { input: string; output: string; isOpen: boolean }): Sample => ({
              input: s.input,
              output: s.output,
              isOpen: s.isOpen,
            })
          )
        );

        setScore(p.score ?? "");
        setConfig({
          time_limit: p.time_limit,
          memory_limit: p.memory_limit,
          allowed_languages: p.allowed_languages || ["C++"],
          tags: p.tags || [],
          visible: p.visible,
          difficulty: p.difficulty || "Dễ",
        });

        if (p.spj) {
          setSpj(p.spj);
        }
      } catch (err) {
        console.error("❌ Load error:", err);
        toast.error("Không thể tải dữ liệu bài tập!");
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id_problem]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSampleChange = (index: number, field: "input" | "output", value: string) => {
    setSamples((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const handleAddSample = () => setSamples((prev) => [...prev, { input: "", output: "", isOpen: true }]);
  const handleRemoveSample = (index: number) => setSamples((prev) => prev.filter((_, i) => i !== index));

  const isFormValid = useMemo(() => {
    return (
      formData?.display_id?.trim() &&
      formData?.title?.trim() &&
      descriptions?.content?.trim() &&
      descriptions?.input?.trim() &&
      descriptions?.output?.trim() &&
      samples.every((s) => s.input?.trim() && s.output?.trim()) &&
      testCases?.length &&
      config.tags?.length &&
      (!useSpecial || spj?.code?.trim()) &&
      (formData?.ioMode === "stdin" || (formData?.inputFile?.trim() && formData?.outputFile?.trim()))
    );
  }, [formData, descriptions, samples, useSpecial, spj, testCases, config]);

  const doSubmit = useCallback(async () => {
    if (!isFormValid) {
      toast.error("Vui lòng điền đầy đủ thông tin trước khi lưu!");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        display_id: formData.display_id,
        title: formData.title,
        description: { format: "markdown", value: descriptions.content },
        input_description: { format: "markdown", value: descriptions.input },
        output_description: { format: "markdown", value: descriptions.output },
        hint: { format: "markdown", value: formData.hint },
        tags: config.tags,
        time_limit: config.time_limit,
        memory_limit: config.memory_limit,
        visible: config.visible,
        allowed_languages: config.allowed_languages,
        rule_type: "ACM",
        source: "Edited by Admin",
        samples,
        test_case_score: testCases,
        answers: [],
        template: {},
        spj: spj.code.trim() ? spj : null,
        io_mode: formData.ioMode,
        input_file: formData.inputFile,
        output_file: formData.outputFile,
        score: score === "" ? 100 : score,
        use_spj: useSpecial,
        difficulty: config.difficulty,
      };

      await api.put(`/admin/problems/update/${id_problem}`, payload);
      await upload_test();
      toast.success("Đã lưu thay đổi thành công!", { position: "top-center", duration: 1500 });
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Không thể cập nhật bài tập!");
    } finally {
      setSaving(false);
    }
  }, [isFormValid, formData, descriptions, samples, testCases, spj, config, score, useSpecial, id_problem, upload_test]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await doSubmit();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        doSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [doSubmit]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center font-mono">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#ccc] border-t-[#007acc] mb-4"></div>
          <p className="text-[#616161] text-sm">Đang tải dữ liệu bài tập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] font-mono">
      <div className="bg-[#f3f3f3] border-b border-[#ccc] px-4 py-2 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={() => router.push(`/admin/problems/${Class}`)}
              className="text-[#616161] hover:text-[#007acc] transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i> Quay lại
            </button>
            <span className="text-[#8c8c8c]">›</span>
            <span className="text-[#616161]">Chỉnh sửa bài tập</span>
            <span className="text-[#8c8c8c]">›</span>
            <code className="text-[#0451a5]">{formData.display_id || "..."}</code>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving || !isFormValid}
            className={clsx(
              "flex items-center gap-2 px-4 py-1.5 text-xs transition-colors",
              isFormValid && !saving
                ? "bg-[#007acc] hover:bg-[#005a9e] text-white"
                : "bg-[#ccc] text-[#8c8c8c] cursor-not-allowed"
            )}
          >
            <i className="fas fa-save"></i>
            <span>{saving ? "Đang lưu..." : "Lưu thay đổi (ctrl+s)"}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
        <div className="bg-white border border-[#ccc]">
          <div className="px-4 py-2 bg-[#f3f3f3] border-b border-[#ccc] text-xs text-[#616161] uppercase font-semibold">
            Thông tin cơ bản
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <label className="block text-xs text-[#616161] mb-1.5">ID hiển thị</label>
                <input
                  type="text"
                  name="display_id"
                  value={formData.display_id}
                  onChange={handleFormChange}
                  className="w-full border border-[#d4d4d4] px-3 py-1.5 text-sm focus:border-[#007acc] focus:outline-none"
                  placeholder="A001"
                  required
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs text-[#616161] mb-1.5">Tiêu đề</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  className="w-full border border-[#d4d4d4] px-3 py-1.5 text-sm focus:border-[#007acc] focus:outline-none"
                  placeholder="Problem Title"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#ccc]">
          <div className="px-4 py-2 bg-[#f3f3f3] border-b border-[#ccc] text-xs text-[#616161] uppercase font-semibold">
            Mô tả vấn đề
          </div>
          <div>
            <MarkdownEditor
              value={descriptions.content}
              onChange={(v) => setDescriptions((prev) => ({ ...prev, content: v }))}
              height="350px"
            />
          </div>
        </div>

        <div className="bg-white border border-[#ccc]">
          <div className="px-4 py-2 bg-[#f3f3f3] border-b border-[#ccc] text-xs text-[#616161] uppercase font-semibold">
            Mô tả đầu vào
          </div>
          <div>
            <MarkdownEditor
              value={descriptions.input}
              onChange={(v) => setDescriptions((prev) => ({ ...prev, input: v }))}
              height="250px"
            />
          </div>
        </div>

        <div className="bg-white border border-[#ccc]">
          <div className="px-4 py-2 bg-[#f3f3f3] border-b border-[#ccc] text-xs text-[#616161] uppercase font-semibold">
            Mô tả đầu ra
          </div>
          <div>
            <MarkdownEditor
              value={descriptions.output}
              onChange={(v) => setDescriptions((prev) => ({ ...prev, output: v }))}
              height="250px"
            />
          </div>
        </div>

        {/* Configuration */}
        <div className="border border-[#ccc]">
          <div className="px-4 py-2 bg-[#f3f3f3] border-b border-[#ccc] text-xs text-[#616161] uppercase font-semibold">
            Cấu hình
          </div>
          <div>
            <ProblemConfig value={config} onChange={setConfig} />
          </div>
        </div>

        {/* Samples */}
        <div className="bg-white border border-[#ccc]">
          <div className="px-4 py-2 bg-[#f3f3f3] border-b border-[#ccc] flex items-center justify-between">
            <span className="text-xs text-[#616161] uppercase font-semibold">Sample Cases</span>
            <button
              type="button"
              onClick={handleAddSample}
              className="flex items-center gap-1.5 text-[#007acc] hover:text-[#005a9e] text-xs transition-colors"
            >
              <i className="fas fa-plus"></i>
              <span>Thêm mẫu</span>
            </button>
          </div>
          <div className="p-4 space-y-3">
            {samples.map((sample, index) => (
              <div key={index} className="border border-[#ccc]">
                <div className="px-3 py-2 bg-[#f8f8f8] flex items-center justify-between">
                  <span className="text-xs text-[#616161] font-semibold">Ví dụ #{index + 1}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSamples((prev) =>
                          prev.map((s, i) => (i === index ? { ...s, isOpen: !s.isOpen } : s))
                        )
                      }
                      className="text-[#616161] hover:text-[#007acc] transition-colors"
                    >
                      <i className={clsx("fas text-xs", sample.isOpen ? "fa-chevron-up" : "fa-chevron-down")}></i>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSample(index)}
                      className="text-[#616161] hover:text-[#f48771] transition-colors"
                    >
                      <i className="fas fa-trash text-xs"></i>
                    </button>
                  </div>
                </div>
                {sample.isOpen && (
                  <div className="p-3 grid grid-cols-2 gap-3 bg-white  border-t border-[#ccc]">
                    <div>
                      <label className="block text-xs text-[#616161] mb-1.5">Input</label>
                      <textarea
                        value={sample.input}
                        onChange={(e) => handleSampleChange(index, "input", e.target.value)}
                        className="w-full h-24 border border-[#d4d4d4] px-2 py-1.5 text-sm font-mono focus:border-[#007acc] focus:outline-none resize-none"
                        placeholder="Sample input..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#616161] mb-1.5">Output</label>
                      <textarea
                        value={sample.output}
                        onChange={(e) => handleSampleChange(index, "output", e.target.value)}
                        className="w-full h-24 border border-[#d4d4d4] px-2 py-1.5 text-sm font-mono focus:border-[#007acc] focus:outline-none resize-none"
                        placeholder="Sample output..."
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Hint */}
        <div className="bg-white border border-[#ccc]">
          <div className="px-4 py-2 bg-[#f3f3f3] border-b border-[#ccc] text-xs text-[#616161] uppercase font-semibold">
            Gợi ý (Tùy chọn)
          </div>
          <div className="">
            <MarkdownEditor
              value={formData.hint}
              onChange={(v) => setFormData((prev) => ({ ...prev, hint: v }))}
              height="250px"
            />
          </div>
        </div>

        {/* Special Judge */}
        <div className="bg-white border border-[#ccc]">
          <div className="px-4 py-2 bg-[#f3f3f3]">
            <label className="flex items-center gap-2 text-xs text-[#616161] cursor-pointer">
              <input
                type="checkbox"
                checked={useSpecial}
                onChange={(e) => {
                  if (!useSpecial) {
                    setShowConfirm(e.target.checked);
                  } else {
                    setUseSpecial(false);
                  }
                }}
                className="accent-[#007acc]"
              />
              <span className="uppercase font-semibold">Sử dụng trình chấm đặc biệt</span>
            </label>
          </div>
          {useSpecial && (
            <div className="border-t border-[#ccc]">
              <SpjEditor value={spj} onChange={setSpj} />
            </div>
          )}
        </div>

        {/* Test Cases */}
        <div className="bg-white border border-[#ccc]">
          <div className="px-4 py-2 bg-[#f3f3f3] border-b border-[#ccc] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#616161] uppercase font-semibold">Test Cases</span>
              <span className="text-xs text-[#8c8c8c]">
                {testCases.length} case{testCases.length !== 1 ? "s" : ""}
              </span>
            </div>
            <label
              htmlFor="zip-loader"
              className="flex items-center gap-1.5 text-[#007acc] hover:text-[#005a9e] text-xs cursor-pointer transition-colors"
            >
              <i className="fas fa-file-archive"></i>
              <span>Load ZIP</span>
            </label>
            <input
              type="file"
              accept=".zip"
              id="zip-loader"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLoadZip(file);
              }}
            />
          </div>
          
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#616161] mb-1.5">IO Mode</label>
                <select
                  value={formData.ioMode}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ioMode: e.target.value }))}
                  className="w-full border border-[#d4d4d4] px-3 py-1.5 text-sm focus:border-[#007acc] focus:outline-none"
                >
                  <option value="stdin">Standard IO</option>
                  <option value="file">File IO</option>
                </select>
              </div>
              {formData.ioMode === "file" && (
                <div className="flex gap-5">
                  <div>
                    <label className="block text-xs text-[#616161] mb-1.5">Input File</label>
                    <input
                      type="text"
                      name="inputFile"
                      value={formData.inputFile}
                      onChange={handleFormChange}
                      placeholder="input.txt"
                      className="w-full border border-[#d4d4d4] px-3 py-1.5 text-sm focus:border-[#007acc] focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-[#616161] mb-1.5">Output File</label>
                    <input
                      type="text"
                      name="outputFile"
                      value={formData.outputFile}
                      onChange={handleFormChange}
                      placeholder="output.txt"
                      className="w-full border border-[#d4d4d4] px-3 py-1.5 text-sm focus:border-[#007acc] focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {testCases.length > 0 && (
              <div className="border-t border-[#ccc] pt-3">
                <button
                  type="button"
                  onClick={() => setIsOpenTestCase(!isOpenTestCase)}
                  className="flex items-center gap-2 text-xs text-[#616161] hover:text-[#007acc] transition-colors mb-2"
                >
                  <i className={clsx("fas", isOpenTestCase ? "fa-chevron-up" : "fa-chevron-down")}></i>
                  <span>{isOpenTestCase ? "Hide" : "Show"} test cases</span>
                </button>
                {isOpenTestCase && (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {testCases.map((t, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-3 py-2 bg-[#f8f8f8] border border-[#ccc] text-xs font-mono"
                      >
                        <span className="text-[#8c8c8c] w-8">#{i + 1}</span>
                        <span className="text-[#0451a5]">{t.input_name}</span>
                        <span className="text-[#8c8c8c]">→</span>
                        <span className="text-[#0451a5]">{t.output_name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Score */}
        <div className="bg-white border border-[#ccc]">
          <div className="px-4 py-2 bg-[#f3f3f3] border-b border-[#ccc] text-xs text-[#616161] uppercase font-semibold">
            Điểm
          </div>
          <div>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="100"
              className="w-full px-3 py-1.5 text-sm focus:border-[#007acc] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <ConfirmModal
          isOpen
          title="Confirm"
          message="Are you sure you want to use a special judge?"
          onCancel={() => setShowConfirm(false)}
          onConfirm={() => {
            setUseSpecial(true);
            setShowConfirm(false);
          }}
        />
      )}
    </div>
  );
}