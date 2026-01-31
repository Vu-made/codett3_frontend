"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLayoutStore } from "@/stores/layoutStore";
import { apiEvents } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const { layoutMode, toggleLayout } = useLayoutStore();
  const isProblemPage = /^\/problems\/[^/]+\/[^/]+$/.test(pathname);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleLoading = (isLoading: boolean) => setLoading(isLoading);
    apiEvents.on("loading", handleLoading);
    return () => {
      apiEvents.off("loading", handleLoading);
    };
  }, []);

  return (
    <footer className="relative h-6 flex items-center justify-between px-4 py-1 border-t border-[#dcdcdc] bg-[#f3f3f3] text-[12px] font-mono text-[#333333] select-none">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <i className="fas fa-code text-[#007acc]"></i> CodeTT3
        </span>

        {isProblemPage && (
          <button
            onClick={toggleLayout}
            className="flex items-center text-[10px] gap-1 px-2 py-0.5 text-[#007acc] hover:text-[#005fa3] hover:bg-[#e8e8e8] transition"
            title={
              layoutMode === "split"
                ? "Chuyển sang Tab View"
                : "Chuyển sang Split View"
            }
          >
            <i
              className={`fas fa-${
                layoutMode === "split" ? "columns" : "table-columns"
              }`}
            />
            {layoutMode === "split" ? "Split View" : "Tab View"}
          </button>
        )}
      </div>

      <div className="hidden sm:flex items-center gap-3 text-[#666666]">
        <span>
          Crafted by{" "}
          <a
            href="https://github.com/Vu-made"
            target="_blank"
            className="text-[#007acc] hover:underline"
          >
            Vu-made
          </a>
        </span>
        <span className="text-[#cccccc]">|</span>
        <span>
          Inspired by{" "}
          <a
            href="https://qduoj.com"
            target="_blank"
            className="text-[#007acc] hover:underline"
          >
            QDUOJ
          </a>
          ,{" "}
          <a
            href="https://dmoj.ca"
            target="_blank"
            className="text-[#007acc] hover:underline"
          >
            DMOJ
          </a>
        </span>
      </div>

      <div className="flex items-center gap-3 text-[#555555]">
        <span className="flex items-center gap-1">
          <i className="fas fa-globe text-[#007acc]"></i> Online
        </span>

        {/* Loading spinner */}
        {loading ? (
          <div
            className="flex items-center gap-1 text-[#007acc]"
            title="Đang gửi request..."
          >
            <Loader2 size={14} className="animate-spin" />
            <span>Loading</span>
          </div>
        ) : (
          <span className="flex items-center gap-1 text-[#007acc]">
            <i className="fas fa-check-circle" /> Synced
          </span>
        )}
      </div>
    </footer>
  );
}
