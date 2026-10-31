"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileSearch,
  Cpu,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  BrainCircuit,
} from "lucide-react";

const STEPS = [
  {
    icon: FileSearch,
    label: "Membaca & mengekstrak dokumen CV...",
    desc: "Memulai ekstraksi teks dari PDF",
  },
  {
    icon: BrainCircuit,
    label: "Membandingkan kualifikasi dengan Job Description...",
    desc: "Mencari kecocokan kata kunci & skill set",
  },
  {
    icon: Cpu,
    label: "Menganalisis skor kualifikasi ATS...",
    desc: "Menghitung persentase kompatibilitas",
  },
  {
    icon: Sparkles,
    label: "Menyusun saran perbaikan & simulasi wawancara...",
    desc: "Merumuskan rekomendasi konkret",
  },
  {
    icon: ShieldCheck,
    label: "Hampir selesai! Memfinalisasi laporan...",
    desc: "Menyiapkan dashboard hasil analisis",
  },
];

export function AnalysisLoading() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Berganti step setiap 2.5 detik
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const ActiveIcon = STEPS[currentStep].icon;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-8 px-4">
      {/* Dynamic Status Card */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-slate-900/80 p-6 md:p-8 backdrop-blur-xl shadow-2xl shadow-indigo-500/10">
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-center gap-6">
          {/* Animated Icon Circle */}
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-2xl border border-dashed border-indigo-400/30"
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ActiveIcon className="h-9 w-9 text-indigo-400" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Text & Progress Bar */}
          <div className="flex-1 space-y-3 text-center md:text-left w-full">
            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-between text-xs font-mono text-indigo-400 uppercase tracking-widest font-semibold">
                <span>Proses Analisis AI</span>
                <span>{Math.round(((currentStep + 1) / STEPS.length) * 100)}%</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.h3
                  key={currentStep}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-lg md:text-xl font-bold text-slate-100"
                >
                  {STEPS[currentStep].label}
                </motion.h3>
              </AnimatePresence>
              <p className="text-xs text-slate-400 font-mono">
                {STEPS[currentStep].desc}
              </p>
            </div>

            {/* Progress Bar Container */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Step Checkpoints */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 border-t border-slate-800/80 pt-6">
          {STEPS.slice(0, 3).map((step, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={idx}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-all duration-300 ${
                  isDone
                    ? "text-indigo-300 bg-indigo-500/10 border border-indigo-500/20"
                    : isCurrent
                    ? "text-slate-200 bg-slate-800/80 border border-slate-700 animate-pulse"
                    : "text-slate-600 bg-slate-900/40 border border-slate-900"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                ) : (
                  <div
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      isCurrent ? "bg-indigo-400" : "bg-slate-700"
                    }`}
                  />
                )}
                <span className="truncate">{step.label.split("...")[0]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skeleton Dashboard Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
        {/* Score Card Skeleton */}
        <div className="md:col-span-1 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4 animate-pulse">
          <div className="h-4 w-24 bg-slate-800 rounded" />
          <div className="flex justify-center py-4">
            <div className="h-32 w-32 rounded-full border-4 border-slate-800 flex items-center justify-center">
              <div className="h-8 w-16 bg-slate-800 rounded" />
            </div>
          </div>
          <div className="h-3 w-full bg-slate-800 rounded" />
          <div className="h-3 w-3/4 bg-slate-800 rounded" />
        </div>

        {/* Detail Analysis Skeleton */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4 animate-pulse">
          <div className="h-5 w-40 bg-slate-800 rounded" />
          <div className="space-y-2 pt-2">
            <div className="h-4 w-full bg-slate-800 rounded" />
            <div className="h-4 w-5/6 bg-slate-800 rounded" />
            <div className="h-4 w-4/6 bg-slate-800 rounded" />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="h-20 bg-slate-800/60 rounded-xl" />
            <div className="h-20 bg-slate-800/60 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}