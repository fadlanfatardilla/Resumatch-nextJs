import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import pdfParse from "pdf-parse-fork";
import Groq from "groq-sdk";

const ai = new GoogleGenAI();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Batas maksimum karakter untuk mencegah token overflow
const MAX_TEXT_LENGTH = 12000;

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    matchScore: {
      type: Type.NUMBER,
      description: "Persentase kecocokan CV dengan Job Description (0-100)",
    },
    summary: {
      type: Type.STRING,
      description: "Ringkasan kesimpulan kecocokan kandidat dalam 2-3 kalimat",
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Daftar skill atau pengalaman unggulan yang sudah cocok",
    },
    missingSkills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "Daftar kualifikasi/skill dari Job Description yang tidak ditemukan di CV",
    },
    cvImprovements: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Saran konkret perbaikan penulisan CV agar lolos ATS",
    },
    interviewQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "Pertanyaan wawancara" },
          reason: {
            type: Type.STRING,
            description: "Alasan pertanyaan ini ditanyakan",
          },
          sampleAnswer: {
            type: Type.STRING,
            description: "Contoh poin jawaban terbaik",
          },
        },
        required: ["question", "reason", "sampleAnswer"],
      },
      description: "Simulasi 3 pertanyaan wawancara spesifik berbasis CV & JD",
    },
  },
  required: [
    "matchScore",
    "summary",
    "strengths",
    "missingSkills",
    "cvImprovements",
    "interviewQuestions",
  ],
};

/**
 * Membersihkan output string dari AI dari pembungkus Markdown seperti ```json ... ```
 */
function cleanJsonOutput(rawText: string): string {
  let cleaned = rawText.trim();
  
  // Hapus blok kode markdown jika AI tidak sengaja menyisipkannya
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
  cleaned = cleaned.replace(/\s*```$/, "");
  
  return cleaned.trim();
}

/**
 * Memotong teks jika melebihi batas maksimum karakter
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "\n...[Teks dipotong karena terlalu panjang]";
}

async function generateContentWithFallback(prompt: string) {
  const models = ["gemini-3.8-flash"];

  for (const modelName of models) {
    let retries = 0;
    const maxRetries = 5;

    while (retries < maxRetries) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0,
          },
        });

        if (response.text) {
          return response.text;
        }
      } catch (err: any) {
        retries++;
        const isBusy =
          err.status === 503 ||
          err.status === 429 ||
          err.message?.includes("high demand") ||
          err.message?.includes("UNAVAILABLE");

        console.warn(
          `[Model: ${modelName}] Percobaan ke-${retries} gagal (Status: ${
            err.status || "Error"
          } - ${err.message || err})`
        );

        if (isBusy && retries < maxRetries) {
          await new Promise((res) => setTimeout(res, retries * 2000));
        } else {
          break;
        }
      }
    }
  }

  // Fallback ke Groq
  if (process.env.GROQ_API_KEY) {
    const groqModels = [
      "openai/gpt-oss-120b",
      "openai/gpt-oss-20b",
      "qwen/qwen3.8-27b",
    ];

    const groqPrompt = `${prompt}

SANGAT PENTING: Kembalikan respon HANYA berupa JSON valid sesuai struktur berikut:
{
  "matchScore": number (0-100),
  "summary": "string",
  "strengths": ["string"],
  "missingSkills": ["string"],
  "cvImprovements": ["string"],
  "interviewQuestions": [
    {
      "question": "string",
      "reason": "string",
      "sampleAnswer": "string"
    }
  ]
}`;

    for (const groqModel of groqModels) {
      try {
        console.warn(`[Groq Fallback] Mencoba model: ${groqModel}...`);

        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "Anda adalah pakar ATS Recruiter. Berikan output selalu dalam format JSON valid.",
            },
            { role: "user", content: groqPrompt },
          ],
          model: groqModel,
          response_format: { type: "json_object" },
        });

        const groqText = completion.choices[0]?.message?.content;
        if (groqText) {
          console.log(`[Groq Fallback] Berhasil menggunakan ${groqModel}`);
          return groqText;
        }
      } catch (groqErr: any) {
        console.warn(
          `[Groq Fallback] Model ${groqModel} gagal:`,
          groqErr.message || groqErr
        );
      }
    }
  }

  throw new Error(
    "Layanan AI sedang mengalami lonjakan beban. Silakan coba beberapa saat lagi."
  );
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawJobDescription = formData.get("jobDescription") as string | null;

    if (!file || !rawJobDescription) {
      return NextResponse.json(
        { error: "File CV (PDF) dan Job Description wajib diisi." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parseFn =
      typeof pdfParse === "function"
        ? pdfParse
        : (pdfParse as any).default || pdfParse;
    const pdfData = await parseFn(buffer);
    const rawResumeText = pdfData.text;

    if (!rawResumeText || !rawResumeText.trim()) {
      return NextResponse.json(
        {
          error:
            "Gagal membaca teks dari PDF. Pastikan file tidak diproteksi atau hasil scan gambar.",
        },
        { status: 400 }
      );
    }

    // 1. Lakukan pemotongan teks jika melebihi batas aman
    const resumeText = truncateText(rawResumeText, MAX_TEXT_LENGTH);
    const jobDescription = truncateText(rawJobDescription, MAX_TEXT_LENGTH);

    const prompt = `
Anda adalah seorang Tech Recruiter & ATS Specialist berpengalaman.
Tugas Anda adalah menganalisis kecocokan antara CV Kandidat dan Job Description (JD) yang diberikan.

--- ISI CV KANDIDAT ---
${resumeText}

--- JOB DESCRIPTION (JD) ---
${jobDescription}

Lakukan analisis secara obyektif, kritis, dan berikan saran perbaikan yang realistis.
    `;

    // 2. Dapatkan respon mentah dari AI
    const rawJsonText = await generateContentWithFallback(prompt);

    // 3. Sanitasi teks JSON sebelum parsing
    const cleanedJsonText = cleanJsonOutput(rawJsonText);
    
    let analysisResult;
    try {
      analysisResult = JSON.parse(cleanedJsonText);
    } catch (parseErr) {
      console.error("Gagal melakukan JSON parse pada output AI:", rawJsonText);
      throw new Error("Format respon AI tidak valid. Silakan coba lagi.");
    }

    return NextResponse.json({ success: true, data: analysisResult });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "Terjadi kesalahan pada server saat memproses analisis.",
      },
      { status: 500 }
    );
  }
}