# Starlight AI — Intelligent Resume Screening & Candidate Matching Platform

**Starlight AI** is an enterprise-grade resume parsing, candidate scoring, and talent intelligence web application. Powered by Google Gemini and advanced heuristic parsers, Starlight automates the screening workflow by analyzing resumes against job descriptions, evaluating skill alignment, calculating real-world tenure, generating customized interview questions, and facilitating side-by-side talent comparisons.

---

## 🌟 Key Features

### 1. Multi-Format Resume Parsing & Screening
- **Supported Formats:** Upload resumes in `.pdf`, `.docx`, or `.txt` format, or paste raw resume text.
- **Dual-Engine Architecture:** Uses Gemini 2.5 (`@google/genai`) for deep semantic evaluation with a built-in algorithmic NLP fallback parser when offline or in rapid prototyping mode.
- **Accurate Academic & Tenure Isolation:** Specifically calibrated for **students, final-year undergraduates, and freshers**. Eliminates common parsing bugs where graduation dates or schooling (e.g., 2020–2026 or 2023–2026) are mistakenly counted as 3 or 6 years of corporate experience.
- **One-Click Manual Override:** Recruiters can adjust scores, edit contact information, or toggle **"Set as Student (0 yrs)"** directly from candidate dossiers.

### 2. Job Requisition Management with Work Mode & City
- **AI Job Description Generator:** Generate tailored job descriptions, responsibilities, and skill criteria using Gemini.
- **City Location & Workplace Setup:**
  - **Work Mode:** Select between **Remote**, **Hybrid**, or **On-site**.
  - **City Location:** Flexible city selection with quick presets (e.g., Bengaluru, Delhi NCR, Mumbai, Hyderabad, San Francisco, New York, London, Remote).
  - **Fresher & Internship Friendly:** Create roles with `0 years` minimum experience and designate roles as **Internship** or **Full-time**.

### 3. Transparent 4-Pillar Scoring Model
Candidates are benchmarked using a weighted composite scoring system:
1. **Hard Skills Match:** Direct verification of required and preferred technical proficiencies.
2. **Experience & Tenure:** Evaluation of relevant career progression vs. role seniority expectations.
3. **Education & Credentials:** Degree verification (B.Tech, BCA, BS, MS, PhD) and institution alignment.
4. **Soft Skills & Leadership:** Communication, cross-functional collaboration, problem solving, and leadership metrics.
*Customizable Scoring Weights:* Adjust percentage weights across all four pillars to match specific hiring priorities.

### 4. Comprehensive Candidate Dossier & Analysis
- **AI Match Overview:** Executive recommendation banner (`Strong Hire`, `Interview`, `Potential Match`, `Low Match`), narrative AI summary, and rapid metrics.
- **Interactive Skill Matrix:** Filter skills by `All`, `Matched`, and `Missing` with evidence notes extracted directly from the resume.
- **Tailored Interview Questions:** Role-specific behavioral, technical, and situational questions generated on the fly.
- **Interactive AI Assistant:** Ask custom questions about any candidate (e.g., *"How strong is their background in distributed systems?"*).
- **PDF Export:** Generate branded, printable candidate evaluation summaries.

### 5. Side-by-Side Candidate Comparison
- Select multiple candidates to view side-by-side breakdowns of overall match scores, categorical ratings, verified skills, and experience tenure.

---

## 🛠️ Tech Stack

- **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), [Motion](https://motion.dev/)
- **Backend:** [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/) via `tsx`
- **AI & LLM:** [@google/genai](https://www.npmjs.com/package/@google/genai) (Google Gemini Flash models)
- **Document Processing:** [pdf-parse](https://www.npmjs.com/package/pdf-parse), [pdfjs-dist](https://www.npmjs.com/package/pdfjs-dist), [jsPDF](https://www.npmjs.com/package/jspdf)
- **Build Tooling:** [Vite](https://vitejs.dev/), [esbuild](https://esbuild.github.io/)

---

## 📁 Project Structure

```
├── server.ts                    # Full-stack Express server (Gemini API proxy & screening routes)
├── index.html                   # HTML entry point
├── package.json                 # Dependencies and build scripts
├── metadata.json                # AI Studio application metadata
├── src/
│   ├── App.tsx                  # Main application orchestrator & dashboard view
│   ├── main.tsx                 # React DOM mount point
│   ├── index.css                # Global CSS with Tailwind CSS v4 directives
│   ├── types.ts                 # TypeScript interfaces (Candidate, JobPosting, ScreeningResult)
│   ├── components/
│   │   ├── Header.tsx           # Global navbar with search, actions, and job selector
│   │   ├── AnalyticsBanner.tsx  # Metrics overview (Candidate pool, average score, top tier)
│   │   ├── CandidateCard.tsx    # Grid and table card views for candidates
│   │   ├── CandidateDetailModal.tsx # Full evaluation dossier, AI Q&A, and edit mode
│   │   ├── CandidateComparisonModal.tsx # Side-by-side comparison matrix
│   │   ├── JobPostingModal.tsx  # Create/edit job requisitions (City, Mode, Skills)
│   │   ├── ResumeUploaderModal.tsx # Drag-and-drop resume parser & batch ingestion
│   │   ├── WeightsModal.tsx     # Custom scoring pillar weight configurator
│   │   ├── FilterBar.tsx        # Candidate status, score range, and keyword filtering
│   │   └── StarlightLogo.tsx    # Branded SVG logo icon
│   ├── data/
│   │   └── sampleData.ts        # Initial seed data for pre-configured roles & profiles
│   └── utils/
│       ├── pdfGenerator.ts      # Printable client-side PDF dossier generation
│       └── textExtractor.ts     # Client-side fallback text extraction for files
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Google Gemini API Key**: Optional for enhanced AI-driven analysis (app includes algorithmic fallbacks).

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd <repository-directory>

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Optional: Google Gemini API Key for LLM-powered extraction and Q&A
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

> **Note:** If `GEMINI_API_KEY` is not provided, the platform automatically switches to its heuristic rule-based parsing engine.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 4. Build for Production

```bash
# Build frontend assets and server bundle
npm run build

# Start production server
npm run start
```

---

## 📡 API Endpoints

The Express server exposes the following endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/screen-resume` | Analyzes resume text against a target job requisition using Gemini or fallback parsing |
| `POST` | `/api/generate-jd` | Uses AI to generate a structured job description, skills, and requirements |
| `POST` | `/api/candidate-qa` | Answers specific recruiter questions regarding a candidate's resume context |
| `POST` | `/api/extract-skills` | Extracts structured skill tags and competencies from arbitrary text |
| `GET` | `/api/health` | Service health check returning uptime and status |

---

## 🎯 Usage Workflow

1. **Select or Create a Job Requisition:**
   - Choose a preset role or click **"Create Job"** to define role title, department, city location, work mode (Remote/Hybrid/On-site), experience requirements, and skill prerequisites.
2. **Upload Resumes:**
   - Click **"Upload Resumes"** to drag-and-drop PDF, DOCX, or TXT documents.
   - Resumes are instantly processed, scored, and mapped to the active job profile.
3. **Review & Compare Candidates:**
   - Use the **Filter & Sort** controls to organize candidates by overall score, recommendation status, or search query.
   - Select multiple candidates to compare qualifications side by side.
4. **Conduct In-Depth Screening:**
   - Open any candidate card to review the **AI Match Overview**, verified credentials, tailored interview prompts, and download PDF dossiers.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
