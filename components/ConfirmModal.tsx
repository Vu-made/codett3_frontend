"use client";

import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({
  isOpen,
  title = "Xác nhận",
  message,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center h-full w-full">
      <div
        className="absolute inset-0 bg-[#23222272]"
        onClick={onCancel} 
      ></div>
      <div className="relative z-10 bg-[#ededed] border shadow-lg w-96 p-6">
        <div className="flex items-center gap-2 border-b py-1">
          <i className="fas fa-thumbtack text-gray-700"></i>
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <p className="mb-4 border-b py-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-1 cursor-pointer bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1 cursor-pointer bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
