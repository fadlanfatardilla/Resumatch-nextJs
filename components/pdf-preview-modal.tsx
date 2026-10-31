// components/pdf-preview-modal.tsx
"use client";

import React from "react";
import { saveImageDataAsPDF } from "@/lib/generate-pdf";

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfDataUrl: string | null;
  filename?: string;
}

export default function PdfPreviewModal({
  isOpen,
  onClose,
  pdfDataUrl,
  filename = "Hasil-Analisis-Resumatch.pdf",
}: PdfPreviewModalProps) {
  if (!isOpen || !pdfDataUrl) return null;

  const handleDownload = () => {
    saveImageDataAsPDF(pdfDataUrl, filename);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              FT
            </div>
            <h3 className="font-semibold text-slate-200">
              Pratinjau Dokumen PDF
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Area Preview Image/Document */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950/50 flex justify-center">
          <img
            src={pdfDataUrl}
            alt="PDF Preview"
            className="max-w-full h-auto rounded-lg shadow-lg border border-slate-800"
          />
        </div>

        {/* Footer Action */}
        <div className="flex justify-end gap-3 p-4 border-t border-slate-800 bg-slate-900">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            Batal
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md transition flex items-center gap-2"
          >
            Download PDF
          </button>
        </div>

      </div>
    </div>
  );
}