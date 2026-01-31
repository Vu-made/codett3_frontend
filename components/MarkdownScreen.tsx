"use client";

import React from "react";
import MarkdownPreview from "@uiw/react-markdown-preview";

interface MarkdownScreenProps {
  content: string;
  fontSize?: number;
}

const MarkdownScreen: React.FC<MarkdownScreenProps> = ({
  content,
  fontSize = 15,
}) => {
  return (
    <div className="p-4 font-sans" data-color-mode="light">
      <MarkdownPreview
        source={content}
        style={{
          backgroundColor: "transparent",
          fontSize: `${fontSize}px`,
          lineHeight: "1.6",
        }}
      />
    </div>
  );
};

export default MarkdownScreen;
