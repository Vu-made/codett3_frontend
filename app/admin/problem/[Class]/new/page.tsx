"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import MarkdownEditor from "@/components/MarkdownEditor";
import ProblemConfig, { ConfigValues } from "@/components/ProblemConfig";
import SpjEditor, { SpjData } from "@/components/SpjEditor";
import ConfirmModal from "@/components/ConfirmModal";
import clsx from "clsx";
import JSZip from "jszip";

export default function CreateProblemPage() {
  const { Class } = useParams();
  const router = useRouter();

  const [zipFile, setZipFile] = useState<File | null>(null);
  const [testCases, setTestCases] = useState<{ input_name: string; output_name: string }[]>([]);
  const [isOpenTestCase, setIsOpenTestCase] = useState(false);
  const [message, setMessage] = useState("");
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

  const [samples, setSamples] = useState([{ input: "", output: "", isOpen: true }]);
  const [useSpecial, setUseSpecial] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [score, setScore] = useState<number | "">("");
  const [config, setConfig] = useState<ConfigValues>({
    time_limit: 1000,
    memory_limit: 256,
    allowed_languages: ["C++"],
    tags: [],
    visible: false,
    difficulty: "easy",
  });
  const [spj, setSpj] = useState<SpjData>({ language: "cpp", code: "", isOpen: false });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSampleChange = (index: number, field: "input" | "output", value: string) => {
    setSamples((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const handleAddSample = () => setSamples((prev) => [...prev, { input: "", output: "", isOpen: true }]);
  const handleRemoveSample = (index: number) => setSamples((prev) => prev.filter((_, i) => i !== index));

  const handleLoadZip = async (file: File) => {
    try {
      const zip = await JSZip.loadAsync(file);
      const filenames = Object.keys(zip.files);
      const inputs = filenames.filter(f => f.endsWith(".in")).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      const outputs = filenames.filter(f => f.endsWith(".out")).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      const merged: { input_name: string; output_name: string }[] = [];
      for (let i = 0; i < Math.min(inputs.length, outputs.length); i++) {
        merged.push({ input_name: inputs[i], output_name: outputs[i] });
      }
      setZipFile(file);
      setTestCases(merged);
      setMessage(`Đã đọc ${merged.length} test case từ file`);
    } catch (err) {
      console.error("Lỗi đọc file ZIP:", err);
      setMessage("File ZIP không hợp lệ hoặc lỗi khi đọc!");
    }
  };

  const upload_test = async (id: number) => {
    if (!zipFile) return;
    try {
      const form = new FormData();
      form.append("file", zipFile);
      setMessage("Đang tải file ZIP lên server...");
      await api.post(`/admin/problems/${id}/upload_zip`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Đã tải file test case lên server!");
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("Không thể tải file test case lên server!");
    }
  };

  const isFormValid = useMemo(() => {
    return (
      formData.display_id.trim() &&
      formData.title.trim() &&
      descriptions.content.trim() &&
      descriptions.input.trim() &&
      descriptions.output.trim() &&
      samples.every(s => s.input.trim() && s.output.trim()) &&
      testCases.length &&
      config.tags?.length &&
      (!useSpecial || spj.code.trim()) &&
      (formData.ioMode === "stdin" || (formData.inputFile.trim() && formData.outputFile.trim()))
    );
  }, [formData, descriptions, samples, testCases, useSpecial, spj , config ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setSaving(true);
    setMessage("");

    try {
      const payload = {
        display_id: formData.display_id,
        title: formData.title,
        description: { format: "markdown", value: descriptions.content },
        input_description: { format: "markdown", value: descriptions.input },
        output_description: { format: "markdown", value: descriptions.output },
        hint: { format: "markdown", value: formData.hint },
        tags: config.tags,
        samples,
        time_limit: config.time_limit,
        memory_limit: config.memory_limit,
        visible: config.visible,
        allowed_languages: config.allowed_languages,
        rule_type: "ACM",
        source: "Created by Admin",
        test_case_score: testCases,
        answers: [],
        template: {},
        spj: useSpecial && spj.code.trim() ? spj : null,
        io_mode: formData.ioMode,
        input_file: formData.inputFile,
        output_file: formData.outputFile,
        score: score === "" ? 100 : score,
        use_spj: useSpecial,
        Class: Class,
        difficulty: config.difficulty
      };

      const res = await api.post("/admin/problems/new", payload);
      await upload_test(res.data?.id);
      setMessage("Tạo bài tập thành công!");
      router.push(`/admin/problems/${Class}`);
    } catch (err) {
      console.error("Error:", err);
      setMessage("Không thể tạo bài tập!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] font-mono">
      {/* Top Bar */}
      <div className="bg-[#f3f3f3] border-b border-[#ccc] px-4 py-2 sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-3 text-sm">
          <button onClick={() => router.push(`/admin/problems/${Class}`)} className="text-[#616161] hover:text-[#007acc]">
            <i className="fas fa-arrow-left mr-2"></i>Quay lại
          </button>
          <span className="text-[#8c8c8c]">›</span>
          <span className="text-[#616161]">Tạo bài tập mới</span>
        </div>
        <button
          type="submit"
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
          <span>{saving ? "Đang lưu..." : "Tạo bài tập"}</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
        {message && (
          <div
            className={clsx(
              "px-4 py-2 text-xs border-l-4 font-mono",
              message.startsWith("✅")
                ? "bg-[#dff6dd] border-[#4ec9b0] text-[#24613b]"
                : "bg-[#f48771]/10 border-[#f48771] text-[#a1260d]"
            )}
          >
            {message}
          </div>
        )}

        {/* Thông tin cơ bản */}
        <div className="bg-white border border-[#ccc]">
          <div className="px-4 py-2 bg-[#f3f3f3] border-b border-[#ccc] text-xs uppercase text-[#616161] font-semibold">
            Thông tin cơ bản
          </div>
          <div className="p-4 grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs mb-1 text-[#616161]">ID hiển thị</label>
              <input
                name="display_id"
                value={formData.display_id}
                onChange={handleFormChange}
                placeholder="A001"
                className="border border-[#d4d4d4] w-full px-3 py-1.5 text-sm focus:border-[#007acc] focus:outline-none"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs mb-1 text-[#616161]">Tiêu đề</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="Tên bài tập"
                className="border border-[#d4d4d4] w-full px-3 py-1.5 text-sm focus:border-[#007acc] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Mô tả bài toán */}
        {["content", "input", "output"].map((key) => (
          <div key={key} className="bg-white border border-[#ccc]">
            <div className="px-4 py-2 bg-[#f3f3f3] border-b border-[#ccc] text-xs uppercase text-[#616161] font-semibold">
              {key === "content" ? "Mô tả bài toán" : key === "input" ? "Mô tả đầu vào" : "Mô tả đầu ra"}
            </div>
            <MarkdownEditor
              value={descriptions[key as keyof typeof descriptions]}
              onChange={(v) => setDescriptions((prev) => ({ ...prev, [key]: v }))}
              height="300px"
            />
          </div>
        ))}

        {/* Cấu hình */}
        <div className="border border-[#ccc]">
          <div className="px-4 py-2 bg-[#f3f3f3] border-b border-[#ccc] text-xs uppercase text-[#616161] font-semibold">
            Cấu hình
          </div>
          <ProblemConfig value={config} onChange={setConfig} />
        </div>

        {/* Ví dụ */}
        <div className="bg-white border border-[#ccc]">
          <div className="px-4 py-2 bg-[#f3f3f3] border-b border-[#ccc] text-xs uppercase text-[#616161] font-semibold flex justify-between items-center">
            <span>Ví dụ mẫu</span>
            <button
              type="button"
              onClick={handleAddSample}
              className="text-[#007acc] hover:text-[#005a9e] text-xs flex items-center gap-1"
            >
              <i className="fas fa-plus"></i> Thêm ví dụ
            </button>
          </div>
          <div className="p-4 space-y-3">
            {samples.map((s, i) => (
              <div key={i} className="border border-[#ccc]">
                <div className="px-3 py-2 bg-[#f8f8f8] flex justify-between items-center">
                  <span className="text-xs text-[#616161] font-semibold">Ví dụ #{i + 1}</span>
                  <button
                    onClick={() => handleRemoveSample(i)}
                    className="text-[#616161] hover:text-[#f48771]"
                  >
                    <i className="fas fa-trash text-xs"></i>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 p-3 border-t border-[#ccc] bg-white">
                  <textarea
                    value={s.input}
                    onChange={(e) => handleSampleChange(i, "input", e.target.value)}
                    placeholder="Input..."
                    className="border border-[#d4d4d4] p-2 text-sm font-mono focus:border-[#007acc] focus:outline-none resize-none h-24"
                  />
                  <textarea
                    value={s.output}
                    onChange={(e) => handleSampleChange(i, "output", e.target.value)}
                    placeholder="Output..."
                    className="border border-[#d4d4d4] p-2 text-sm font-mono focus:border-[#007acc] focus:outline-none resize-none h-24"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gợi ý */}
        <div className="bg-white border border-[#ccc]">
          <div className="px-4 py-2 bg-[#f3f3f3] border-b border-[#ccc] text-xs uppercase text-[#616161] font-semibold">
            Gợi ý
          </div>
          <MarkdownEditor value={formData.hint} onChange={(v) => setFormData((p) => ({ ...p, hint: v }))} height="250px" />
        </div>

        {/* SPJ */}
        <div className="bg-white border border-[#ccc]">
          <div className="px-4 py-2 bg-[#f3f3f3] flex items-center gap-2">
            <input
              type="checkbox"
              checked={useSpecial}
              onChange={(e) => {
                if (!useSpecial) setShowConfirm(e.target.checked);
                else setUseSpecial(false);
              }}
              className="accent-[#007acc]"
            />
            <span className="uppercase text-xs text-[#616161] font-semibold">Dùng trình chấm đặc biệt</span>
          </div>
          {useSpecial && <SpjEditor value={spj} onChange={setSpj} />}
        </div>

        {/* Test Case */}
        <div className="bg-white border border-[#ccc]">
          <div className="px-4 py-2 bg-[#f3f3f3] flex justify-between items-center border-b border-[#ccc]">
            <span className="text-xs uppercase text-[#616161] font-semibold">Test Cases</span>
            <label
              htmlFor="zip-loader"
              className="flex items-center gap-1.5 text-[#007acc] hover:text-[#005a9e] text-xs cursor-pointer"
            >
              <i className="fas fa-file-archive"></i> Load ZIP
            </label>
            <input
              id="zip-loader"
              type="file"
              accept=".zip"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleLoadZip(f);
              }}
            />
          </div>
          <div className="p-4 text-sm text-[#616161] space-y-2">
            <div className="flex items-center gap-2">
              <span>IO Mode:</span>
              <select
                value={formData.ioMode}
                onChange={(e) => setFormData((p) => ({ ...p, ioMode: e.target.value }))}
                className="border border-[#d4d4d4] px-2 py-1 text-sm focus:border-[#007acc] focus:outline-none"
              >
                <option value="stdin">Standard IO</option>
                <option value="file">File IO</option>
              </select>
            </div>
            {formData.ioMode === "file" && (
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="inputFile"
                  placeholder="input.txt"
                  value={formData.inputFile}
                  onChange={handleFormChange}
                  className="border border-[#d4d4d4] px-3 py-1.5 text-sm focus:border-[#007acc] focus:outline-none"
                />
                <input
                  name="outputFile"
                  placeholder="output.txt"
                  value={formData.outputFile}
                  onChange={handleFormChange}
                  className="border border-[#d4d4d4] px-3 py-1.5 text-sm focus:border-[#007acc] focus:outline-none"
                />
              </div>
            )}
            {testCases.length > 0 && (
              <div className="border-t border-[#ccc] pt-3">
                <button
                  type="button"
                  onClick={() => setIsOpenTestCase(!isOpenTestCase)}
                  className="flex items-center gap-2 text-xs text-[#616161] hover:text-[#007acc]"
                >
                  <i className={clsx("fas", isOpenTestCase ? "fa-chevron-up" : "fa-chevron-down")}></i>
                  <span>{isOpenTestCase ? "Ẩn" : "Hiện"} test cases</span>
                </button>
                {isOpenTestCase && (
                  <div className="space-y-1.5 mt-2 max-h-64 overflow-y-auto">
                    {testCases.map((t, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 bg-[#f8f8f8] border border-[#ccc] text-xs font-mono">
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

        {/* Điểm */}
        <div className="bg-white border border-[#ccc]">
          <div className="px-4 py-2 bg-[#f3f3f3] border-b border-[#ccc] text-xs uppercase text-[#616161] font-semibold">
            Điểm
          </div>
          <div className="p-4">
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="100"
              className="w-full border border-[#d4d4d4] px-3 py-1.5 text-sm focus:border-[#007acc] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          isOpen
          title="Xác nhận"
          message="Bạn có chắc muốn dùng trình chấm đặc biệt?"
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
