"use client";

import React from "react";
import MdEditor from "react-markdown-editor-lite";
import MarkdownIt from "markdown-it";
import "react-markdown-editor-lite/lib/index.css";
import "github-markdown-css/github-markdown-light.css";

interface MarkdownEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  height?: string;
  className?: string;
}

interface MarkdownChangeEvent {
  html: string;
  text: string;
}

const mdParser = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});
mdParser.enable(["table"]);

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value = "",
  onChange,
  height = "600px",
  className = "",
}) => {
  const handleEditorChange = ({ text }: MarkdownChangeEvent) => {
    onChange?.(text);
  };

  return (
    <div
      className={`bg-white shadow text-[16px] ${className}`}
      style={{ height }}
    >
      <MdEditor
        value={value}
        style={{ height: "100%", width: "100%" , border:"none"}}
        renderHTML={(text) => (
          <div
            className="markdown-body p-6 text-[16px] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: mdParser.render(text) }}
          />
        )}
        config={{
          view: {
            menu: true,
            md: true,    
            html: false,   
          },
        }}
        onChange={handleEditorChange}
      />
    </div>
  );
};

export default MarkdownEditor;
