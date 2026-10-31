"use client";

import React, { useState } from "react";
import { MessageSquare, Send, Loader2, CheckCircle2, AlertCircle, Award, RefreshCw, Sparkles } from "lucide-react";

interface QuestionItem {
  question: string;
  reason: string;
  sampleAnswer: string;
}

interface Feedback {
  score: number;
  strengths: string;
  improvements: string;
  improvedAnswer: string;
}

export function MockInterviewSimulator({
  questions,
  jobDescription,
}: {
  questions: QuestionItem[];
  jobDescription?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<{ [key: number]: Feedback }>({});

  const currentQ = questions[currentIndex];
  const currentFeedback = feedbacks[currentIndex];

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/interview-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQ.question,
          userAnswer: userAnswer,
          jobDescription: jobDescription,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedbacks((prev) => ({ ...prev, [currentIndex]: data.data }));
      } else {
        alert(data.error || "Gagal menganalisis jawaban.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetAnswer = () => {
    setUserAnswer("");
    setFeedbacks((prev) => {
      const updated = { ...prev };
      delete updated[currentIndex];
      return updated;
    });
  };

  if (!questions || questions.length === 0) return null;

  return (
    <div className="p-5 md:p-6 rounded-2xl border border-slate-800/80 bg-slate-900/90 shadow-xl backdrop-blur-md space-y-6 font-sans">
      {/* Header & Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-950/70 border border-indigo-500/30 text-indigo-400 shrink-0 shadow-inner">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-slate-100 font-sans">
              Interactive Mock Interview Simulator
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed pt-0.5">
              Latih jawaban Anda dan dapatkan evaluasi instan dari AI Hiring Manager
            </p>
          </div>
        </div>

        {/* Tab Pertanyaan */}
        <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800/80 self-start sm:self-center">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setUserAnswer("");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 ${
                currentIndex === idx
                  ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              Q{idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Pertanyaan Aktif */}
      <div className="space-y-5">
        <div className="p-4 md:p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800/50 text-[11px] font-sans font-medium text-indigo-300">
              Pertanyaan {currentIndex + 1} dari {questions.length}
            </span>
          </div>
          <h4 className="text-base md:text-lg font-semibold tracking-tight text-slate-100 font-sans leading-snug">
            {currentQ.question}
          </h4>
          <p className="text-xs text-slate-400 font-sans leading-relaxed pt-2 border-t border-slate-800/60 mt-2">
            <span className="text-slate-300 font-medium">Maksud pertanyaan:</span>{" "}
            <span className="italic text-slate-400">{currentQ.reason}</span>
          </p>
        </div>

        {/* Input Jawaban */}
        {!currentFeedback ? (
          <div className="space-y-3.5">
            <label className="block text-xs font-medium text-slate-300 font-sans tracking-wide">
              Ketikkan Jawaban Anda (seperti saat wawancara sungguhan):
            </label>
            <textarea
              rows={4}
              placeholder="Contoh: Pada proyek sebelumnya, saya bertanggung jawab untuk... Saya menyelesaikan tantangan tersebut dengan cara..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950/90 border border-slate-800/80 text-slate-100 text-xs md:text-sm font-sans focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 leading-relaxed placeholder:text-slate-600 transition-all resize-none shadow-inner"
            />
            <button
              onClick={handleSubmitAnswer}
              disabled={loading || !userAnswer.trim()}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800/80 disabled:text-slate-500 text-white font-sans font-medium text-xs md:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/10 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Menganalisis Jawaban Anda...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Kirim Jawaban & Dapatkan Feedback
                </>
              )}
            </button>
          </div>
        ) : (
          /* Tampilan Hasil Feedback */
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Skor Jawaban */}
            <div className="flex items-center justify-between p-4 md:p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-950/70 border border-indigo-500/30 text-indigo-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-sans font-medium text-slate-400 uppercase tracking-wider block">
                    Skor Kualitas Jawaban
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                      {currentFeedback.score}
                    </span>
                    <span className="text-slate-500 text-xs font-medium font-sans">/100</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleResetAnswer}
                className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800/80 text-slate-300 hover:text-white text-xs font-sans font-medium flex items-center gap-2 transition-all shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Coba Jawab Lagi
              </button>
            </div>

            {/* Poin Positif & Area Perbaikan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl bg-emerald-950/25 border border-emerald-800/40 space-y-2">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-2 font-sans tracking-tight">
                  <CheckCircle2 className="w-4 h-4" /> Kelebihan Jawaban
                </span>
                <p className="text-xs text-slate-200 font-sans leading-relaxed">{currentFeedback.strengths}</p>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/25 border border-amber-800/40 space-y-2">
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-2 font-sans tracking-tight">
                  <AlertCircle className="w-4 h-4" /> Area Perbaikan
                </span>
                <p className="text-xs text-slate-200 font-sans leading-relaxed">{currentFeedback.improvements}</p>
              </div>
            </div>

            {/* Contoh Jawaban Versi STAR Method */}
            <div className="p-5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-2 text-indigo-300">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-sans font-semibold uppercase tracking-wider">
                  Contoh Jawaban Ideal (STAR Method)
                </span>
              </div>
              <p className="text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-line pl-3 border-l-2 border-indigo-500/80">
                {currentFeedback.improvedAnswer}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}