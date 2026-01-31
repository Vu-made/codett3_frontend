"use client";

import React, { useState } from "react";
import api from "@/lib/api";
import AceEditor from "react-ace";

// Import theme và mode
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/ext-language_tools";
import clsx from "clsx";

export interface SpjData {
  language: string;
  code: string;
  isOpen : boolean;
}

interface SpjEditorProps {
  value: SpjData;
  onChange: (value: SpjData) => void;
}

export default function SpjEditor({ value, onChange }: SpjEditorProps) {
  const [checking, setChecking] = useState(false);
  const [ isOpen , setIsOpen ] = useState(true);
  const [output, setOutput] = useState("");

  const handleChange = (val: string) => {
    onChange({ ...value, code: val });
  };

  const handleSyntaxCheck = async () => {
    setChecking(true);
    setOutput("");

    try {
      const res = await api.post("/admin/problems/spj_syntax_check", {
        language: value.language,
        code: value.code,
      });
      setOutput(res.data.ok ? "Cú pháp hợp lệ" : `Lỗi cú pháp:\n${res.data.message}`);
    } catch (err) {
      console.error("Lỗi khi kiểm tra cú pháp SPJ:", err);
      setOutput("Lỗi khi kiểm tra cú pháp SPJ!");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className=" flex flex-col">
        <div className="w-full px-4 py-2 border-b border-[#ccc] flex justify-between items-center">
            <h2 className="font-semibold text-gray-700">
                Trình chấm đặc biệt (C++)
            </h2>
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={handleSyntaxCheck}
                    disabled={checking}
                    className={`flex items-center gap-2 text-[12px] px-2 py-1 cursor-pointer transition 
                    ${
                        checking
                        ? "bg-green-300 text-white cursor-not-allowed"
                        : "border border-[#ccc] hover:border-green-700 hover:text-green-700"
                    }`}
                >
                    {checking ? "Đang kiểm tra..." : "kiểm tra"}
                </button>
            </div>
        </div>
        <div className={clsx(
            "flex flex-col gap-3 border-b border-[#ccc] p-4",
            isOpen ? "block" : "hidden"
        )}>
            <AceEditor
                mode="c_cpp"
                theme="github"
                name="spj-editor"
                value={value.code}
                onChange={handleChange}
                width="100%"
                minLines={20}
                maxLines={Infinity} 
                fontSize={14}
                showPrintMargin={false}
                showGutter={true}
                highlightActiveLine={true}
                placeholder=""
                setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
                showLineNumbers: true,
                tabSize: 2,
                }}
                className="border border-gray-300 overflow-hidden"
            />
            {output && (
                <div className="mt-3 border border-[#ccc] pt-3 bg-gray-50 p-3">
                    <div className="font-medium text-gray-700 mb-1">Kết quả:</div>
                    <pre className="whitespace-pre-wrap text-gray-800 text-sm font-mono">{output}</pre>
                </div>
            )}
        </div>
        <div 
            className="w-full h-7 flex justify-center items-center hover:bg-[#76767619] cursor-pointer"
            onClick={()=>{
                setIsOpen ( !isOpen ) ;
            }}
        >
            <i className={clsx("fas",isOpen?"fa-angle-up":"fa-angle-down")}></i>
        </div>
    </div>
  );
}
