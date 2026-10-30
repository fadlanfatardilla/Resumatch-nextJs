import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import Groq from "groq-sdk";

const ai = new GoogleGenAI();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.NUMBER,
      description: "Skor kualitas jawaban pengguna (0-100)",
    },
    strengths: {
      type: Type.STRING,
      description: "Poin positif/kelebihan dari jawaban pengguna",
    },
    improvements: {
      type: Type.STRING,
      description: "Kekurangan atau poin penting yang terlewatkan",
    },
    improvedAnswer: {
      type: Type.STRING,
      description: "Revisi contoh jawaban yang ideal dengan menggunakan metode STAR (Situation, Task, Action, Result) dalam Bahasa Indonesia",
    },
  },
  required: ["score", "strengths", "improvements", "improvedAnswer"],
};

export async function POST(req: NextRequest) {
  try {
    const { question, userAnswer, jobDescription } = await req.json();

    if (!question || !userAnswer) {
      return NextResponse.json(
        { error: "Pertanyaan dan jawaban wajib diisi." },
        { status: 400 }
      );
    }

    const prompt = `
Anda adalah seorang Senior Tech Recruiter / Hiring Manager yang sedang melakukan wawancara kerja.

**Pertanyaan Wawancara:**
"${question}"

**Job Description Reference:**
"${jobDescription || 'Umum'}"

**Jawaban Kandidat:**
"${userAnswer}"

Evaluasi jawaban kandidat secara obyektif dan konstruktif. 
Berikan skor (0-100), analisis kelebihan, area perbaikan, dan contoh jawaban versi terbaik (penerapan metode STAR).
    `;

    let rawJsonText = "";

    // 1. Menggunakan Model Gemini yang sama persis dengan analyze route
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
            rawJsonText = response.text;
            break;
          }
        } catch (err: any) {
          retries++;
          const isBusy =
            err.status === 503 ||
            err.status === 429 ||
            err.message?.includes("high demand") ||
            err.message?.includes("UNAVAILABLE");

          console.warn(
            `[Mock Interview - Model: ${modelName}] Percobaan ke-${retries} gagal (Status: ${
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
      if (rawJsonText) break;
    }

    // 2. Fallback Groq disesuaikan dengan daftar model analyze route
    if (!rawJsonText && process.env.GROQ_API_KEY) {
      const groqModels = [
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b",
        "qwen/qwen3.8-27b",
      ];

      const groqPrompt = `${prompt}

Format JSON wajib:
{
  "score": number (0-100),
  "strengths": "string",
  "improvements": "string",
  "improvedAnswer": "string"
}`;

      for (const groqModel of groqModels) {
        try {
          console.warn(`[Groq Fallback Mock Interview] Mencoba model: ${groqModel}...`);

          const completion = await groq.chat.completions.create({
            messages: [
              {
                role: "system",
                content:
                  "Anda adalah Hiring Manager profesional. Selalu jawab dengan format JSON valid.",
              },
              { role: "user", content: groqPrompt },
            ],
            model: groqModel,
            response_format: { type: "json_object" },
          });

          const groqText = completion.choices[0]?.message?.content;
          if (groqText) {
            rawJsonText = groqText;
            break;
          }
        } catch (groqErr: any) {
          console.warn(
            `[Groq Fallback Mock Interview] Model ${groqModel} gagal:`,
            groqErr.message || groqErr
          );
        }
      }
    }

    if (!rawJsonText) {
      throw new Error("Gagal mengevaluasi jawaban wawancara.");
    }

    const cleanText = rawJsonText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
    const result = JSON.parse(cleanText);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Mock Interview API Error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memproses evaluasi wawancara." },
      { status: 500 }
    );
  }
}