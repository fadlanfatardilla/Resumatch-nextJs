// app/api/rewrite-bullet/route.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { rawExperience, jobDescription, missingSkills } = await req.json();

    console.log("DATA DITERIMA:", { rawExperience, jobDescription });

    if (!rawExperience || !jobDescription) {
      return NextResponse.json(
        { error: "Pengalaman kerja dan Job Description wajib diisi." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Anda adalah seorang Executive Resume Writer dan Spesialis ATS Optimization profesional di FitTailor.ai.

    TUGAS:
    Ubah atau buat ulang poin-poin pengalaman kerja berikut agar sangat relevan dengan Job Description dan ramah sistem ATS.

    INPUT:
    - Pengalaman Asli User: "${rawExperience}"
    - Job Description Target: "${jobDescription}"
    - Keyword/Skill yang Kurang: "${missingSkills ? missingSkills.join(", ") : "Tidak ada"}"

    ATURAN PENULISAN:
    1. Buat 3 hingga 5 poin (bullet points) pengalaman kerja yang berdampak tinggi (high impact).
    2. Gunakan kata kerja aksi yang kuat (Strong Action Verbs) dalam Bahasa Indonesia / Inggris sesuai bahasa input.
    3. Sisipkan kata kunci (keywords) yang dibutuhkan dari Job Description.
    4. Masukkan perkiraan metrik/angka kuantitatif yang masuk akal (misal: %, jumlah pengguna, efisiensi waktu, omzet) untuk menunjukkan dampak (Result-Oriented).
    5. Gunakan metode XYZ: "Accomplished [X] as measured by [Y], by doing [Z]".

    FORMAT OUTPUT:
    Kembalikan HANYA format JSON valid tanpa tanda markdown (seperti \`\`\`json) dengan struktur:
    {
      "rewrittenBullets": [
        "Poin 1 yang sudah dioptimalkan...",
        "Poin 2 yang sudah dioptimalkan...",
        "Poin 3 yang sudah dioptimalkan..."
      ]
    }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    // Membersihkan tag markdown jika ada
    const cleanJson = responseText.replace(/^```json\n?|\n?```$/g, "");
    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Error pada Rewrite Bullet Points API:", error);
    return NextResponse.json(
      { error: "Gagal mendaur ulang poin CV." },
      { status: 500 }
    );
  }
}