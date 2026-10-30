# 🎯 ResuMatch.ai

An **AI-powered resume matcher** built with **Next.js 15**, **TypeScript**, and **Gemini**. Upload your CV as a PDF, paste a job description, and get an instant match score, a detailed breakdown of your strengths and gaps, actionable tips to improve your resume, predicted interview questions with sample answers, and a mock interview simulator to practice with.

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white) ![Gemini](https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

---

## ✨ Key Features

- **CV & Job Description Matching**: Upload a PDF resume and compare it against any job description to get a match percentage and a concise summary.
- **Strengths & Gaps Analysis**: See exactly which parts of your CV fit the role and which areas fall short.
- **Improvement Recommendations**: Receive concrete, prioritized actions to make your CV stronger for the target job.
- **AI Bullet Point Rewriter**: Rewrite weak resume bullet points into clearer, more impactful statements tailored to the job.
- **Interview Question Prediction**: Get likely interview questions based on your analysis result, along with sample answers.
- **Mock Interview Simulator**: Answer interview questions by typing your responses and receive AI-generated feedback and scoring.
- **PDF Preview**: Preview your uploaded CV before running the analysis.
- **PDF Report Export**: Download your analysis results as a PDF report.
- **Smooth, Responsive UI**: Animated loading states and transitions with a clean, accessible interface.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router, Route Handlers)
- **Language:** TypeScript
- **AI:** Google Gemini
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui, Lucide React
- **Animation:** Framer Motion
- **Validation:** Zod
- **Code Quality:** ESLint

---

## 🔄 How It Works

1. **Upload** your CV in PDF format and provide the job description.
2. The PDF text is **extracted** on the server and sent to Gemini together with the job description.
3. Gemini returns a **structured analysis**, validated with Zod, containing the match score, summary, strengths, gaps, recommendations, and predicted interview questions.
4. The **dashboard** displays the results, where you can rewrite bullet points, export a PDF report, or start a **mock interview** session.
5. During the mock interview, each answer you submit is evaluated and you receive **feedback** on it.

---

## 📁 Project Structure

```text
.
├── app/
│   └── api/
│       ├── analyze/              # CV vs job description analysis endpoint
│       ├── interview-feedback/   # Mock interview feedback endpoint
│       └── rewrite-bullet/       # Bullet point rewriter endpoint
├── components/
│   ├── analysis-dashboard.tsx    # Results dashboard (score, strengths, gaps, tips)
│   ├── analysis-loading.tsx      # Animated loading state
│   ├── bullet-rewriter.tsx       # AI bullet point rewriter
│   ├── mock-interview.tsx        # Mock interview simulator
│   ├── pdf-preview-modal.tsx     # CV preview modal
│   ├── pdf-uploader.tsx          # CV upload component
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── generate-pdf.ts           # PDF report generation
│   └── utils.ts                  # Shared utilities
├── src/
│   └── pdf-parse-fork.d.ts       # Type declarations for pdf-parse-fork
└── components.json               # shadcn/ui configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure the following tools are installed on your machine:

- [Node.js](https://nodejs.org/) 18.18 or later
- [Git](https://git-scm.com/downloads)
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### Installation & Local Setup

**1. Clone the repository**

```bash
git clone https://github.com/fadlanfatardilla/Resumatch-nextJs.git
cd Resumatch-nextJs
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

Create a `.env.local` file in the project root:

```env
# Google Gemini API key
GEMINI_API_KEY="your-gemini-api-key"
```

**4. Run the development server**

```bash
npm run dev
```

**5. Open the application**

Navigate to the following address in your browser:

```text
http://localhost:3000
```

---

## 📜 Available Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the development server         |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server          |
| `npm run lint`  | Run ESLint                           |

---

## 🎯 Project Objectives

- Help job seekers understand how well their CV fits a specific role.
- Provide clear, actionable feedback to improve resumes before applying.
- Prepare candidates for interviews with predicted questions and practice sessions.
- Demonstrate a modern AI-integrated application using Next.js, TypeScript, and Gemini.

---

## ⚠️ Notes

- Never commit your `.env` or `.env.local` file. It contains your API key.
- AI-generated results are meant as guidance and may not be perfectly accurate. Always review the suggestions before applying them.
- Uploaded CVs contain personal information. Make sure you handle and store them responsibly if you deploy this project publicly.

---

_Built as an AI-powered career tool focused on resume analysis, interview preparation, and job matching._
