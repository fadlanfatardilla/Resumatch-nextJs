"use client";

import React, { useState, useRef } from "react";
import { Sparkles, ArrowRight, Bot, Zap, ShieldCheck, Target, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PdfUploader } from "@/components/pdf-uploader";
import { AnalysisLoading } from "@/components/analysis-loading";
import { AnalysisDashboard, AnalysisData } from "@/components/analysis-dashboard";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null);

  // Ref untuk membatalkan fetch jika pengguna mereset/membatalkan
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !jobDescription.trim()) return;

    // Validasi sederhana ukuran file (misal: maks 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file PDF terlalu besar. Maksimal 5MB.");
      return;
    }

    setIsLoading(true);

    // Inisialisasi AbortController
    abortControllerRef.current = new AbortController();

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jobDescription", jobDescription);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal melakukan analisis");
      }

      setAnalysisResult(result.data);
    } catch (error: any) {
      if (error.name !== "AbortError") {
        alert(error.message || "Terjadi kesalahan saat memproses data.");
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleReset = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setAnalysisResult(null);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden flex flex-col justify-between selection:bg-indigo-500/20">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/60 bg-slate-950/60 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-semibold text-lg tracking-tight">
            <div className="p-2 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20">
              <Bot className="w-4 h-4" />
            </div>
            <span className="font-mono text-slate-100">
              Resumatch<span className="text-indigo-400">.ai</span>
            </span>
          </div>

          <Badge
            variant="outline"
            className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 font-mono text-xs px-3 py-1 gap-1.5 backdrop-blur-md"
          >
            <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" /> Gemini Powered
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-12 md:py-16 flex-1 max-w-4xl">
        {isLoading ? (
          <AnalysisLoading />
        ) : analysisResult ? (
          <AnalysisDashboard data={analysisResult} onReset={handleReset} />
        ) : (
          <>
            <div className="text-center space-y-5 mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-800 bg-slate-900/80 text-slate-300 text-xs font-mono backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                <span>AI-Powered Resume Optimizer</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-100 leading-[1.15]">
                Optimalkan CV Anda untuk <br className="hidden md:inline" />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                  Kualifikasi Impian
                </span>
              </h1>

              <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto font-normal leading-relaxed">
                Analisis tingkat kecocokan ATS, temukan celah keahlian, dan dapatkan simulasi pertanyaan wawancara presisi secara instan.
              </p>
            </div>

            {/* Form Card */}
            <Card className="border border-slate-800/80 bg-slate-900/40 backdrop-blur-xl shadow-2xl shadow-indigo-950/50 rounded-2xl overflow-hidden">
              <CardContent className="p-6 md:p-8 space-y-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        1. File CV (PDF)
                      </label>
                      <PdfUploader onFileSelect={setFile} selectedFile={file} />
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <Target className="w-3.5 h-3.5 text-indigo-400" />
                        2. Job Description
                      </label>
                      <Textarea
                        placeholder="Tempelkan kualifikasi atau deskripsi pekerjaan yang ditargetkan di sini..."
                        className="h-[180px] resize-none bg-slate-950/60 border-slate-800 text-slate-200 placeholder:text-slate-600 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 rounded-xl font-mono text-xs leading-relaxed"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isLoading || !file || !jobDescription.trim()}
                      className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-mono text-xs uppercase tracking-wider font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all duration-200 gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Menganalisis dengan Gemini AI...</span>
                        </>
                      ) : (
                        <>
                          <span>Mulai Analisis Presisi</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Feature Pills */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
              <div className="p-4 rounded-xl border border-slate-800/60 bg-slate-900/20 backdrop-blur-md flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Match Analysis</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Skor kecocokan kuantitatif berbasis kata kunci spesifik.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-800/60 bg-slate-900/20 backdrop-blur-md flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">ATS Gap Detection</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Identifikasi kata kunci & skill yang belum muncul di CV Anda.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-800/60 bg-slate-900/20 backdrop-blur-md flex items-start gap-3">
                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Interview Generator</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Prediksi pertanyaan wawancara khusus untuk profil Anda.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/40 py-6 text-center text-xs font-mono text-slate-500">
        <p>Resumatch AI &bull; Built with Next.js & Gemini AI</p>
      </footer>
    </div>
  );
}