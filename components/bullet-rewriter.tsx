// components/bullet-rewriter.tsx
"use client";

import React, { useState } from "react";

interface BulletRewriterProps {
  jobDescription: string;
  missingSkills?: string[];
}

export default function BulletRewriter({
  jobDescription,
  missingSkills = [],
}: BulletRewriterProps) {
  const [rawExperience, setRawExperience] = useState("");
  const [rewrittenBullets, setRewrittenBullets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleRewrite = async () => {
    if (!rawExperience.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/rewrite-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawExperience,
          jobDescription,
          missingSkills,
        }),
      });

      const data = await res.json();
      if (res.ok && data.rewrittenBullets) {
        setRewrittenBullets(data.rewrittenBullets);
      } else {
        alert(data.error || "Terjadi kesalahan saat memproses data.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menghubungkan ke server.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
      {/* Header Komponen */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
          ✨
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">AI Bullet Point Optimizer</h3>
          <p className="text-xs text-slate-400">
            Ubah poin pengalaman kasar Anda menjadi kalimat aksi ATS ber-dampak tinggi.
          </p>
        </div>
      </div>

      {/* Input Pengalaman Asli */}
      <div className="space-y-2">
        <label className="text-sm text-slate-300 font-medium">
          Tulis Pengalaman Kerja Asli / Singkat Anda:
        </label>
        <textarea
          rows={3}
          value={rawExperience}
          onChange={(e) => setRawExperience(e.target.value)}
          placeholder="Contoh: Saya dulu mengelola sosial media perusahaan, membuat konten Instagram, dan membuat laporan bulanan..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
        />
      </div>

      {/* Tombol Generasi */}
      <button
        onClick={handleRewrite}
        disabled={loading || !rawExperience.trim()}
        className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold shadow-md transition w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin">⏳</span> Mengoptimalkan Poin CV...
          </>
        ) : (
          <>
            <span>🚀</span> Optimalkan dengan AI
          </>
        )}
      </button>

      {/* Hasil Poin Teroptimasi */}
      {rewrittenBullets.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h4 className="text-sm font-semibold text-slate-200">
            Saran Poin CV Teroptimasi (Tinggal Copas):
          </h4>
          <div className="space-y-2">
            {rewrittenBullets.map((bullet, idx) => (
              <div
                key={idx}
                className="group relative bg-slate-950 border border-slate-800 hover:border-slate-700 p-3.5 rounded-lg flex items-start justify-between gap-3 transition"
              >
                <p className="text-sm text-slate-300 leading-relaxed">
                  • {bullet}
                </p>
                <button
                  onClick={() => handleCopy(bullet, idx)}
                  className="shrink-0 px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
                >
                  {copiedIndex === idx ? "✓ Tersalin!" : "📋 Salin"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}