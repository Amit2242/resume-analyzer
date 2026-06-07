# Resume Shapeshifter

**JD-to-Resume Tailoring Engine** — Transform your resume to match any job description with truthful, targeted rewrites, match scoring, gap analysis, and a side-by-side PDF proof artifact.

---

## Features

- **Match Scoring** — See exactly how well your resume aligns with a job description (0–100)
- **Smart Tailoring** — AI rewrites your resume bullets to match the JD while preserving truthfulness
- **Gap Analysis** — Identify missing or weakly represented skills with actionable suggestions
- **Truthfulness Guardrails** — Confidence labels, risk flags, and fabrication detection on every rewrite
- **Side-by-Side PDF** — Export a professional comparison PDF showing every change with proof
- **Bullet-level explanations** — Every rewrite includes the reason, keywords addressed, and confidence level

## Demo

Try the app instantly with sample data — no API key required:

1. Run `npm run dev` and open `http://localhost:3000`
2. Click **Load Demo** on the landing page
3. Browse the full flow: scores → gaps → side-by-side → export

## Prerequisites

- **Node.js** 18+ (recommended: 20 LTS)
- **npm** 9+

## Quick Start

```bash
# Clone and install
git clone <repo-url> resume-shapeshifter
cd resume-shapeshifter
npm install

# Configure environment
cp .env.example .env.local
```

Edit `.env.local` and add your DeepSeek API key:

```
DEEPSEEK_API_KEY=sk-your-actual-key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

**Get a DeepSeek API key:**
1. Visit [platform.deepseek.com](https://platform.deepseek.com)
2. Sign up and navigate to API Keys
3. Create a new key and paste it into `.env.local`

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Full User Flow

```
1. Paste Resume ──► 2. Paste JD ──► 3. Analyze ──► 4. Review Changes ──► 5. Confirm ──► 6. Export PDF
```

1. **Input** — Paste your resume text and a real job description. Click **Load Sample** to see pre-filled demo data.
2. **Analysis** — View your match score (0–100), extracted JD requirements as badge chips, and a prioritized gap analysis table.
3. **Editor** — Review original vs tailored bullets side by side. Each change shows the rewrite reason, confidence badge (high/medium/low), and any risk flags.
4. **Confirm** — Review the truthfulness score, flagged items, and check the confirmation box before exporting.
5. **Export** — Download the side-by-side comparison PDF with scores, bullet diffs, and gap analysis.

## Build

```bash
npm run build
npm start
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14 (App Router) | Full-stack React framework |
| Language | TypeScript (strict) | Type safety |
| Styling | Tailwind CSS + Shadcn UI | Component library + utility CSS |
| State | Zustand | Client-side state management |
| Validation | Zod | Schema validation (API + LLM outputs) |
| LLM | DeepSeek (OpenAI-compatible) | Text generation & structuring |
| PDF | Puppeteer | Server-side PDF generation |
| Doc Parsing | pdf-parse, mammoth | Extract text from PDF/DOCX |
| Toasts | Sonner | Toast notifications |

## Project Structure

```
resume-shapeshifter/
├── app/                    # Next.js App Router pages & API routes
│   ├── layout.tsx          # Root layout (dark theme, sonner Toaster)
│   ├── page.tsx            # Landing page with hero & feature cards
│   ├── input/              # Resume + JD input page
│   ├── analysis/           # Match score + gap analysis page
│   ├── editor/             # Side-by-side comparison + confirmation
│   ├── export/             # PDF export page
│   └── api/                # 7 API route handlers
├── components/             # React components
│   ├── ui/                 # 14 Shadcn UI primitives
│   └── *.tsx               # Feature components (ScoreCard, GapAnalysis, BulletDiffRow, etc.)
├── lib/                    # Business logic
│   ├── schemas.ts          # 15 Zod schemas with inferred types
│   ├── llm.ts              # DeepSeek client with retry & JSON repair
│   ├── pdf.ts              # Puppeteer PDF generation with HTML template
│   ├── validation.ts       # Fabrication detection & truthfulness scoring
│   ├── parsing.ts          # PDF/DOCX text extraction
│   ├── scoring.ts          # Keyword overlap pre-scorer
│   ├── rate-limiter.ts     # In-memory rate limiter (10 req/min)
│   └── utils.ts            # Helper functions (cn, formatScore, etc.)
├── prompts/                # 7 LLM prompt builder functions
├── store/                  # Zustand store with localStorage persist
├── types/                  # Re-exported TypeScript types
├── public/                 # Sample resume & JD for demo
└── docs/                   # Architecture & implementation plan
```

## Documentation

- [Architecture](./architecture.md) — System design, component architecture, data flow
- [Implementation Plan](./implementationplan.md) — Phase-wise implementation roadmap
- [Problem Statement](./Problemstament.md) — Full product requirements

## Screenshots

*(Add screenshots here — recommended views:)*
- **Landing page** with hero and feature cards
- **Input page** with sample data loaded
- **Analysis page** showing score gauge, JD badges, and gap table
- **Editor page** with before/after bullets and confirmation panel
- **Export page** with download buttons
- **PDF output** side-by-side comparison document

## License

MIT
