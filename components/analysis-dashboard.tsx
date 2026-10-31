"use client";

import React, { useState } from "react";
import { Copy, Check, Mail } from "lucide-react";
import { MockInterviewSimulator } from "./mock-interview";
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  ArrowLeft,
  RotateCcw,
  Download,
  Loader2,
  Sparkles,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { downloadAnalysisAsPDF } from "@/lib/generate-pdf";

export interface AnalysisData {
  matchScore: number;
  summary: string;
  strengths: string[];
  missingSkills: string[];
  cvImprovements: string[];
  coverLetter?: string;
  interviewQuestions: {
    question: string;
    reason: string;
    sampleAnswer: string;
  }[];
  jobDescription?: string; // Menambahkan opsional jobDescription jika dikirim dari parent
}

interface AnalysisDashboardProps {
  data: AnalysisData;
  onReset: () => void;
  jobDescription?: string; // Tempat menerima string Job Description dari input form awal
}

export function AnalysisDashboard({
  data,
  onReset,
  jobDescription = "",
}: AnalysisDashboardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCoverLetter = () => {
    if (data?.coverLetter) {
      navigator.clipboard.writeText(data.coverLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const [isDownloading, setIsDownloading] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 75)
      return "text-emerald-400 border-emerald-600 bg-emerald-950";
    if (score >= 50) return "text-amber-400 border-amber-600 bg-amber-950";
    return "text-rose-400 border-rose-600 bg-rose-950";
  };

  const matchScore = data?.matchScore ?? 0;
  const activeJobDescription = jobDescription || data?.jobDescription || "";

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      await downloadAnalysisAsPDF(
        "analysis-report-container",
        `Hasil-Analisis-CV-${Date.now()}.pdf`,
      );
    } catch (error) {
      console.error("Gagal mendownload PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Top Header Action */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Button
          variant="ghost"
          onClick={onReset}
          className="text-slate-400 hover:text-slate-100 hover:bg-slate-900 font-mono text-xs gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Analisis Ulang / Kembali
        </Button>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs gap-2 h-8 px-3"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Mengunduh...
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" /> Download PDF
              </>
            )}
          </Button>

          <Badge
            variant="outline"
            className={`font-mono text-xs px-3 py-1 ${getScoreColor(matchScore)}`}
          >
            Match Score: {matchScore}%
          </Badge>
        </div>
      </div>

      {/* Wrapper Container Utama yang diexport ke PDF */}
      <div
        id="analysis-report-container"
        className="space-y-8 bg-slate-950 p-4 rounded-xl"
      >
        {/* Score Overview Card */}
        <Card className="avoid-break border border-slate-800 bg-slate-900">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-xl font-bold tracking-tight text-slate-100">
                  Ringkasan Analisis Kecocokan
                </h2>
                <p className="text-slate-400 text-sm max-w-xl font-mono leading-relaxed">
                  {data?.summary || "Tidak ada ringkasan yang tersedia."}
                </p>
              </div>

              {/* Circular / Progress Indicator */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950 border border-slate-800 min-w-[160px]">
                <span
                  className={`text-4xl font-extrabold font-mono ${getScoreColor(matchScore).split(" ")[0]}`}
                >
                  {matchScore}%
                </span>
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mt-1">
                  ATS Compatibility
                </span>
                <Progress
                  value={matchScore}
                  className="h-1.5 w-24 mt-3 bg-slate-800"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid: Strengths & Missing Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Keunggulan (Strengths) */}
          <Card className="avoid-break border border-slate-800 bg-slate-900">
            <CardHeader>
              <CardTitle className="text-sm font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Skill & Pengalaman Cocok
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data?.strengths && data.strengths.length > 0 ? (
                data.strengths.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-slate-300 font-mono"
                  >
                    <span className="text-emerald-400 select-none">&bull;</span>
                    <span>{item}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs font-mono text-slate-500 italic">
                  Tidak ada poin keunggulan terdeteksi.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Celah Kualifikasi (Missing Skills) */}
          <Card className="avoid-break border border-slate-800 bg-slate-900">
            <CardHeader>
              <CardTitle className="text-sm font-mono uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Kualifikasi / Skill Kurang
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data?.missingSkills && data.missingSkills.length > 0 ? (
                data.missingSkills.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-slate-300 font-mono"
                  >
                    <span className="text-amber-400 select-none">&bull;</span>
                    <span>{item}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs font-mono text-slate-500 italic">
                  Semua kualifikasi dasar terpenuhi.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rekomendasi Perbaikan CV */}
        <Card className="avoid-break border border-slate-800 bg-slate-900">
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> Rekomendasi Aksi Perbaikan CV
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.cvImprovements && data.cvImprovements.length > 0 ? (
              data.cvImprovements.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed"
                >
                  {idx + 1}. {item}
                </div>
              ))
            ) : (
              <p className="text-xs font-mono text-slate-500 italic">
                Tidak ada saran perbaikan spesifik.
              </p>
            )}
          </CardContent>
        </Card>

        {/* FITUR BARU: KARTU COVER LETTER GENERATOR */}
        {data?.coverLetter && (
          <Card className="avoid-break border border-slate-800 bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-mono uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Draft Cover Letter Instan
              </CardTitle>
              <Button
                onClick={handleCopyCoverLetter}
                variant="outline"
                className="h-8 border-slate-700 bg-slate-950 text-slate-300 hover:text-white font-mono text-xs gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Tersalin
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Salin Teks
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-sans text-xs leading-relaxed whitespace-pre-line">
                {data.coverLetter}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Simulasi Pertanyaan Interview */}
        <Card className="page-break-before border border-slate-800 bg-slate-900">
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" /> Prediksi Pertanyaan Interview &
              Contoh Jawaban
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-mono">
              Klik pertanyaan di bawah untuk melihat alasan perekrut menanyakan
              hal tersebut beserta panduan jawabannya.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data?.interviewQuestions && data.interviewQuestions.length > 0 ? (
              <Accordion type="single" className="w-full space-y-2">
                {data.interviewQuestions.map((q, idx) => (
                  <AccordionItem
                    key={idx}
                    value={`item-${idx}`}
                    className="avoid-break border border-slate-800 rounded-xl px-4 bg-slate-950 mb-2"
                  >
                    <AccordionTrigger className="text-xs font-mono text-left font-medium text-slate-200 hover:no-underline hover:text-indigo-400">
                      {idx + 1}. {q.question}
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pt-2 text-xs font-mono text-slate-400 border-t border-slate-800">
                      <p className="text-slate-500 italic">
                        <strong className="text-slate-400">
                          Alasan Ditanyakan:
                        </strong>{" "}
                        {q.reason}
                      </p>
                      <div className="p-3 rounded-lg bg-slate-900 border border-indigo-900 text-indigo-200">
                        <strong className="text-indigo-400 block mb-1">
                          Contoh Poin Jawaban:
                        </strong>
                        {q.sampleAnswer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-xs font-mono text-slate-500 italic">
                Tidak ada prediksi pertanyaan interview.
              </p>
            )}
          </CardContent>
        </Card>

        {/* FITUR TAMBAHAN: MOCK INTERVIEW SIMULATOR */}
        <Card className="avoid-break border border-slate-800/80 bg-slate-900/90 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold tracking-tight text-sky-400 flex items-center gap-2.5 font-sans">
              <div className="p-1.5 rounded-lg bg-sky-950/60 border border-sky-800/50 text-sky-400">
                <Bot className="w-4 h-4" />
              </div>
              <span>Simulasi Mock Interview Interaktif</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400 font-sans leading-relaxed pt-1">
              Latih kemampuan wawancara Anda secara langsung berdasarkan
              kualifikasi posisi ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MockInterviewSimulator
              questions={data?.interviewQuestions || []}
              jobDescription={activeJobDescription}
            />
          </CardContent>
        </Card>
      </div>

      {/* Reset CTA */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={onReset}
          className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-mono text-xs uppercase tracking-wider gap-2 px-6 h-11"
        >
          <RotateCcw className="w-4 h-4" /> Analisis Dokumen Lain
        </Button>
      </div>
    </div>
  );
}
