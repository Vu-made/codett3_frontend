"use client";

import React, { useEffect, useState, useRef } from "react";
import Split from "react-split";
import api from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Scrollspy } from "@/components/ui/scrollspy";
import MarkdownScreen from "@/components/MarkdownScreen";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/base-tooltip';

interface Chapter {
  title: string;
  content: string;
}

interface DocumentItem {
  id: string ;
  title: string;
  content: Chapter[];
  created_at: string;
  author: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [id_select, setIdSelect] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await api.get("/documents/");
        setDocuments(res.data);
      } catch {
        setError("Không tìm thấy danh sách tài liệu.");
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  return (
    <div className="h-full flex flex-col bg-white text-gray-800 font-sans">
      <div className="h-full w-full">
        <Split sizes={[15, 85]} minSize={[200, 600]} gutterSize={2} className="split">
          <aside className="bg-[#eeeeee] border-r border-gray-300 p-4 overflow-auto">
            <h2 className="text-[15px] font-semibold mb-3 text-blue-700 flex items-center gap-2">
              <i className="fas fa-book text-blue-600"></i> Danh sách tài liệu
            </h2>
            {loading ? (
              <p className="text-gray-600 text-sm">Đang tải...</p>
            ) : error ? (
              <p className="text-red-500 text-sm">{error}</p>
            ) : documents.length === 0 ? (
              <p className="text-gray-600 text-sm">Chưa có tài liệu nào.</p>
            ) : (
              <ul className="space-y-1">
                {documents.map((doc) => {
                  const isActive = id_select === doc.id;
                  return (
                    <li key={doc.id}>
                      <div
                        onClick={() => setIdSelect(doc.id)}
                        className={`px-3 py-2 text-[14px] rounded-md hover:bg-blue-100 truncate cursor-pointer flex items-center gap-2 ${
                          isActive
                            ? "bg-blue-200 font-semibold text-blue-900"
                            : "text-gray-700"
                        }`}
                      >
                        <i
                          className={`fas ${
                            isActive
                              ? "fa-file-alt text-blue-600"
                              : "fa-file text-gray-500"
                          }`}
                        ></i>
                        {doc.title || "Không có tiêu đề"}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>

          <main className="w-full h-full">
              {id_select ? (
                <DocumentContent id={id_select} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                  Chọn một tài liệu để xem chi tiết
                </div>
              )}
          </main>
        </Split>
      </div>
    </div>
  );
}

function DocumentContent({ id }: { id: string }) {
  const [documentD, setDocument] = useState<DocumentItem | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState(14);
  const [mode, setMode] = useState<"normal" | "note">("normal");
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleFontDecrease = () => setFontSize((s) => Math.max(s - 2, 10));
  const handleFontIncrease = () => setFontSize((s) => Math.min(s + 2, 28));
  const handleToggleMode = () => setMode((m) => (m === "normal" ? "note" : "normal"));
  const handleScrollTop = () => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleScrollBottom = () => {
    if (scrollRef.current)
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
  };

  useEffect(() => {
    const getInfoDocument = async () => {
      try {
        const res = await api.get(`/documents/${id}`);
        setDocument(res.data);
      } catch (err) {
        console.error(`Lỗi khi lấy thông tin document: ${err}`);
      }
    };
    getInfoDocument();
  }, [id]);

  useEffect(() => {
    if (!documentD) return;
    const sections = documentD.content.map((_, index) =>
      window.document.getElementById(`${index}`)
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            if (id) setActiveIndex(parseInt(id));
          }
        });
      },
      { root: scrollRef.current, threshold: 0.3 }
    );
    sections.forEach((s) => s && observer.observe(s));
    return () => observer.disconnect();
  }, [documentD]);

  if (!documentD)
    return (
      <div className="flex items-center justify-center h-full text-gray-600">
        Đang tải nội dung tài liệu...
      </div>
    );

  const formattedDate = new Date(documentD.created_at).toLocaleString("vi-VN");

  return (
    <div className={`h-full w-full ${mode === "note" ? "bg-yellow-50" : "bg-white"}`}>
      <Split sizes={[85, 15]} minSize={[100, 200]} gutterSize={2} className="split">
        <div className="w-full h-full flex flex-col">
          <div className="w-full border-b border-[#ccc] bg-white">
            <div className="flex items-center justify-between px-4 py-1 text-gray-700">
              <div className="flex items-center gap-2 text-sm font-medium">
                <i className="fas fa-book-open text-blue-500"></i>
                <span>{mode === "note" ? "Chế độ ghi chú" : "Chế độ đọc tài liệu"}</span>
              </div>

              <div className="flex items-center text-sm gap-2">
                <div>{fontSize}px</div>
                <button
                  title="Giảm cỡ chữ"
                  onClick={handleFontDecrease}
                  className="p-2 hover:bg-gray-100 rounded" 
                >
                  <i className="fas fa-minus"></i>
                </button>
                <button
                  title="Tăng cỡ chữ"
                  onClick={handleFontIncrease}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <i className="fas fa-plus"></i>
                </button>

                <div className="w-px h-4 bg-gray-300 mx-1"></div>

                <button
                  title={mode === "normal" ? "Chế độ ghi chú" : "Chế độ đọc"}
                  onClick={handleToggleMode}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <i
                    className={`fas ${
                      mode === "normal" ? "fa-sticky-note" : "fa-book-open"
                    }`}
                  ></i>
                </button>

                <div className="w-px h-4 bg-gray-300 mx-1"></div>

                <button title="Cuộn lên đầu" onClick={handleScrollTop} className="p-2 hover:bg-gray-100 rounded">
                  <i className="fas fa-arrow-up"></i>
                </button>
                <button title="Cuộn xuống cuối" onClick={handleScrollBottom} className="p-2 hover:bg-gray-100 rounded">
                  <i className="fas fa-arrow-down"></i>
                </button>
              </div>
            </div>
          </div>

          <div className="w-full h-full overflow-auto px-10" ref={scrollRef}>
            <ScrollArea>
              {documentD.content.map((c, i) => (
                <div key={i} id={`${i}`} className="pb-5 min-h-screen">
                  <h1 className="text-3xl py-8 font-semibold mb-3 text-[#007acc] flex items-center gap-2">
                    <i className="fas fa-heading text-[#007acc]"></i>
                    <i className="fas fa-angle-right text-[#007acc]"></i> {c.title}
                  </h1>
                  <hr className="my-2 border-[#ccc]" />
                  <div
                    className={`my-2 prose prose-blue max-w-none ${
                      mode === "note" ? "bg-yellow-50 rounded" : ""
                    }`}
                  >
                    <MarkdownScreen content={c.content} fontSize={fontSize} />
                  </div>
                  <hr className="border-[#ccc]" />
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>

        <aside className="bg-[#eeeeee] border-l border-gray-200 flex flex-col justify-between overflow-auto">
          <Scrollspy targetRef={scrollRef} className="flex flex-col px-3 py-4 gap-2 text-sm">
            <h3 className="font-semibold text-[#444] mb-2 flex items-center gap-2">
              <i className="fas fa-list-ul text-[#007acc]"></i> Mục lục
            </h3>
            {documentD.content.map((c, i) => (
              <Tooltip key={i}>
                <TooltipTrigger>
                  <div
                    data-scrollspy-anchor={`#${i}`}
                    className={`text-left justify-start transition-colors flex py-1 items-center w-full px-2 rounded ${
                      activeIndex === i
                        ? "bg-blue-200 text-blue-900 font-semibold"
                        : "bg-transparent text-gray-700 hover:bg-blue-100"
                    }`}
                    onClick={() => {
                      const el = document.getElementById(`${i}`);
                      if (el && scrollRef.current) {
                        scrollRef.current.scrollTo({
                          top: el.offsetTop,
                          behavior: "smooth",
                        });
                      }
                    }}
                  >
                    <i className="fas fa-angle-right text-[#007acc] mr-1"></i>
                    <p className="truncate text-xs">{c.title}</p>
                  </div>
                </TooltipTrigger>

                <TooltipContent side="left" className="border border-[#ccc] bg-white! text-xs flex gap-1">
                  <i className="fa-solid fa-bookmark"></i>{c.title || "Không có tiêu đề"}
                </TooltipContent>
              </Tooltip>
            ))}
          </Scrollspy>
          <div className="px-3 py-3 mt-auto border-t border-[#ccc] bg-[#eeeeee] text-xs text-gray-700 leading-5">
            <div className="flex items-center gap-2">
              <i className="fas fa-user"></i>
              <span className="font-medium">{documentD.author || "Không rõ tác giả"}</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-calendar-alt"></i> {formattedDate}
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-book-open"></i> {documentD.content?.length || 0} chương
            </div>
          </div>
        </aside>
      </Split>
    </div>
  );
}
