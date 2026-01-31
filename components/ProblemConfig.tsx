"use client";

import * as React from "react";
import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/base-combobox";
import { Label } from "@/components/ui/base-label";
import { PlusIcon } from "lucide-react";

export interface ConfigValues {
  time_limit: number;
  memory_limit: number;
  allowed_languages: string[];
  tags: string[];
  visible: boolean;
  difficulty: "easy" | "normal" | "hard";
}

interface TagItem {
  id: string;
  value: string;
  creatable?: string;
}

const ALL_LANGUAGES = ["C++", "Python"];

const DIFFICULTY_OPTIONS = [
  { label: "Dễ", value: "easy" },
  { label: "Trung bình", value: "normal" },
  { label: "Khó", value: "hard" },
];

interface ProblemConfigProps {
  value?: ConfigValues;
  onChange?: (config: ConfigValues) => void;
}

export default function ProblemConfig({
  value = {
    time_limit: 1000,
    memory_limit: 256,
    allowed_languages: ["C++"],
    tags: [],
    visible: false,
    difficulty: "easy",
  },
  onChange,
}: ProblemConfigProps) {
  const [config, setConfig] = React.useState(value);
  const [query, setQuery] = React.useState("");
  const [langQuery, setLangQuery] = React.useState("");
  const comboboxInputRef = React.useRef<HTMLInputElement | null>(null);
  const tagContainerRef = React.useRef<HTMLDivElement | null>(null);

  const update = <K extends keyof ConfigValues>(
    field: K,
    newValue: ConfigValues[K]
  ) => {
    const newConfig = { ...config, [field]: newValue };
    setConfig(newConfig);
    onChange?.(newConfig);
  };

  // ===== TAG LOGIC =====
  const existingTags = ["graph", "string", "dp", "math", "greedy", "loop"];
  const lowered = query.trim().toLowerCase();
  const exactExists = existingTags.some(
    (t) => t.trim().toLowerCase() === lowered
  );

  const itemsForView: TagItem[] =
    query && !exactExists
      ? [
          ...existingTags.map((t) => ({ id: t, value: t })),
          { id: `create:${lowered}`, value: `Tạo “${query}”`, creatable: query },
        ]
      : existingTags.map((t) => ({ id: t, value: t }));

  const handleTagChange = (items: unknown) => {
    const selectedItems = items as TagItem[];
    const last = selectedItems[selectedItems.length - 1];

    if (last && last.creatable) {
      const newTag = last.creatable.trim().toLowerCase();
      const allTags = Array.from(new Set([...config.tags, newTag]));
      update("tags", allTags);
      setQuery("");
      return;
    }

    const clean = selectedItems.filter((i) => !i.creatable);
    update("tags", Array.from(new Set(clean.map((i) => i.value))));
    setQuery("");
  };

  // ===== LANGUAGE LOGIC =====
  const filteredLangs = ALL_LANGUAGES.filter((lang) =>
    lang.toLowerCase().includes(langQuery.toLowerCase())
  ).map((l) => ({ id: l, value: l }));

  const handleLangChange = (items: unknown) => {
    const langs = (items as { id: string; value: string }[]).map(
      (i) => i.value
    );
    update("allowed_languages", Array.from(new Set(langs))); // loại bỏ trùng
  };

  // ===== UI =====
  return (
    <div className="p-6 bg-white shadow-sm text-[13px] space-y-5 border border-gray-200">
      {/* ==== BASIC CONFIG ==== */}
      <div className="grid grid-cols-3 gap-5">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Thời gian (ms)
          </label>
          <input
            type="number"
            min={100}
            value={config.time_limit}
            onChange={(e) => update("time_limit", Number(e.target.value))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Bộ nhớ (MB)
          </label>
          <input
            type="number"
            min={32}
            value={config.memory_limit}
            onChange={(e) => update("memory_limit", Number(e.target.value))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Độ khó
          </label>
          <select
            value={config.difficulty}
            onChange={(e) =>
              update("difficulty", e.target.value as ConfigValues["difficulty"])
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
          >
            {DIFFICULTY_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ==== TAGS & LANGUAGES ==== */}
      <div className="grid grid-cols-3 gap-5">
        {/* PUBLIC TOGGLE */}
        <div className="flex items-center gap-2 mt-1">
          <label className="text-sm font-medium text-gray-700">Công khai</label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.visible}
              onChange={(e) => update("visible", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition-all"></div>
            <div className="absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
          </label>
        </div>

        {/* TAGS */}
        <div ref={tagContainerRef} className="flex flex-col gap-1 w-full">
          <Label className="text-sm font-medium text-gray-700 mb-1 block">
            Tags
          </Label>
          <Combobox
            items={itemsForView}
            multiple
            value={config.tags.map((t) => ({ id: t, value: t }))}
            inputValue={query}
            onInputValueChange={setQuery}
            onValueChange={handleTagChange}
          >
            <div className="flex flex-col gap-1 w-full">
              <ComboboxChips className="border border-gray-300 rounded-md px-2 py-1 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                <ComboboxValue>
                  {(value: TagItem[]) => (
                    <>
                      {value.map((v) => (
                        <ComboboxChip
                          key={v.id}
                          className="bg-blue-100 text-blue-700 rounded-md px-2 py-1 text-xs"
                        >
                          {v.value}
                          <ComboboxChipRemove />
                        </ComboboxChip>
                      ))}
                      <ComboboxInput
                        ref={comboboxInputRef}
                        placeholder={
                          value.length ? "" : "Nhập hoặc chọn tag..."
                        }
                        className="outline-none px-1 text-sm text-gray-700"
                      />
                    </>
                  )}
                </ComboboxValue>
              </ComboboxChips>

              <ComboboxContent
                anchor={tagContainerRef}
                side="bottom"
                align="start"
                className="rounded-md shadow-md border border-gray-200 bg-white"
              >
                <ComboboxEmpty className="px-3 py-2 text-gray-500 text-sm">
                  Không có tag phù hợp.
                </ComboboxEmpty>
                <ComboboxList>
                  {(item: TagItem) =>
                    item.creatable ? (
                      <ComboboxItem
                        key={item.id}
                        value={item}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-sm cursor-pointer"
                      >
                        <PlusIcon className="w-3 h-3 text-blue-600" />
                        <span>Tạo “{item.creatable}”</span>
                      </ComboboxItem>
                    ) : (
                      <ComboboxItem
                        key={item.id}
                        value={item}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-sm cursor-pointer"
                      >
                        <ComboboxItemIndicator />
                        <span>{item.value}</span>
                      </ComboboxItem>
                    )
                  }
                </ComboboxList>
              </ComboboxContent>
            </div>
          </Combobox>
        </div>

        {/* LANGUAGES */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-1 block">
            Ngôn ngữ cho phép
          </Label>
          <Combobox
            items={filteredLangs}
            multiple
            value={config.allowed_languages.map((l) => ({ id: l, value: l }))}
            inputValue={langQuery}
            onInputValueChange={setLangQuery}
            onValueChange={handleLangChange}
          >
            <div className="flex flex-col gap-1 w-full">
              <ComboboxChips className="border border-gray-300 rounded-md px-2 py-1 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                <ComboboxValue>
                  {(value: { id: string; value: string }[]) => (
                    <>
                      {value.map((v) => (
                        <ComboboxChip
                          key={v.id}
                          className="bg-green-100 text-green-700 rounded-md px-2 py-1 text-xs"
                        >
                          {v.value}
                          <ComboboxChipRemove />
                        </ComboboxChip>
                      ))}
                      <ComboboxInput
                        placeholder={
                          value.length ? "" : "Chọn ngôn ngữ..."
                        }
                        className="outline-none px-1 text-sm text-gray-700"
                      />
                    </>
                  )}
                </ComboboxValue>
              </ComboboxChips>

              <ComboboxContent
                side="bottom"
                align="start"
                className="rounded-md shadow-md border border-gray-200 bg-white"
              >
                <ComboboxEmpty className="px-3 py-2 text-gray-500 text-sm">
                  Không tìm thấy ngôn ngữ.
                </ComboboxEmpty>
                <ComboboxList>
                  {(item: { id: string; value: string }) => (
                    <ComboboxItem
                      key={item.id}
                      value={item}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-sm cursor-pointer"
                    >
                      <ComboboxItemIndicator />
                      <span>{item.value}</span>
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </div>
          </Combobox>
        </div>
      </div>
    </div>
  );
}
