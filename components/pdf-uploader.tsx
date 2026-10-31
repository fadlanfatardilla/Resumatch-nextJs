"use client";

import React, { useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PdfUploaderProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export function PdfUploader({ onFileSelect, selectedFile }: PdfUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      onFileSelect(file);
    } else if (file) {
      alert("Format file harus berupa PDF.");
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[180px] ${
        selectedFile
          ? "border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10"
          : "border-slate-800 bg-slate-950/60 hover:border-indigo-500/50 hover:bg-slate-900/60"
      }`}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
      />

      {selectedFile ? (
        <div className="flex flex-col items-center gap-2 text-center w-full">
          <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-mono font-medium text-slate-200 truncate max-w-[200px]">
              {selectedFile.name}
            </p>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB &bull; PDF Terdeteksi
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveFile}
            className="mt-1 h-7 text-[10px] font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-1 px-2 rounded-lg"
          >
            <X className="w-3 h-3" /> Hapus / Ganti File
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-mono text-slate-300 font-medium">
              Klik atau geser file PDF ke sini
            </p>
            <p className="text-[10px] font-mono text-slate-500 mt-1">
              Maksimal ukuran file 5MB (Format .PDF)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}