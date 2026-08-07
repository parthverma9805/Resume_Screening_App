import React, { useState, useRef } from 'react';
import { JobPosting, Candidate, EvaluationWeights } from '../types';
import { X, Upload, FileText, Sparkles, Loader2, File, User, Zap } from 'lucide-react';

interface ResumeUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeJob: JobPosting;
  weights: EvaluationWeights;
  onCandidatesAdded: (newCandidates: Candidate[]) => void;
}

const PREBUILT_SAMPLES = [
  {
    id: 'sample-1',
    name: 'Sarah Jenkins',
    title: 'Senior Full Stack & AI Engineer',
    matchEstimate: 'Strong Match (~92%)',
    summary: '7 years full stack experience with React, Node.js, TypeScript, PostgreSQL, AWS, and Gemini API fine-tuning.',
    resumeText: `SARAH JENKINS
San Francisco, CA | s.jenkins@example.com | linkedin.com/in/sarahjenkins-tech

SUMMARY:
Senior Full Stack Engineer with 7+ years of experience delivering cloud-native web applications and generative AI microservices. Proven expertise in React, TypeScript, Node.js, and PostgreSQL.

WORK EXPERIENCE:
Lead Full Stack Engineer | Nova AI Systems (2021 - Present)
- Architected enterprise React and Node.js microservices handling 10M+ monthly transactions.
- Built custom RAG pipelines integrating Gemini API and vector databases.
- Managed GCP Cloud Run serverless infrastructure and PostgreSQL database partitioning.

Senior Software Engineer | Vanguard Digital (2018 - 2021)
- Developed real-time streaming dashboards in React and TypeScript.
- Designed RESTful and GraphQL APIs for client web apps.

EDUCATION:
B.S. in Computer Science | Stanford University (2014 - 2018)

SKILLS:
React, TypeScript, Node.js, GraphQL, PostgreSQL, MongoDB, GCP, AWS, Docker, CI/CD, Generative AI`,
  },
  {
    id: 'sample-2',
    name: 'Marcus Vance',
    title: 'Backend Engineer (Node/Python)',
    matchEstimate: 'Moderate Match (~76%)',
    summary: '5 years experience focused on Node.js and Python microservices, but limited React/frontend expertise.',
    resumeText: `MARCUS VANCE
Austin, TX | marcus.vance@example.com

SUMMARY:
Backend Engineer with 5 years experience specializing in Node.js, Express, Python, PostgreSQL, and cloud deployments.

EXPERIENCE:
Backend Engineer | DataMesh Solutions (2020 - Present)
- Engineered high-concurrency Node.js REST APIs and PostgreSQL database models.
- Configured CI/CD pipelines and Docker containers on AWS ECS.

Software Developer | TechCorp (2018 - 2020)
- Developed Python scripts and API integrations for automated data processing.

EDUCATION:
B.S. in Information Technology | University of Texas at Austin

SKILLS:
Node.js, Express, Python, PostgreSQL, REST APIs, AWS, Docker, Git. (Limited React)`,
  },
  {
    id: 'sample-3',
    name: 'Chloe Bennett',
    title: 'Junior Web Developer',
    matchEstimate: 'Underqualified (~52%)',
    summary: '1.5 years experience with HTML, CSS, JavaScript and introductory React. Lacks senior architecture experience.',
    resumeText: `CHLOE BENNETT
Denver, CO | chloe.b@example.com

SUMMARY:
Passionated Junior Web Developer with 1.5 years experience building responsive web pages using JavaScript, HTML, CSS, and basic React.

EXPERIENCE:
Junior Web Developer | PixelCraft Studio (2022 - Present)
- Maintained marketing websites in HTML/CSS/JavaScript.
- Built simple React components for client landing pages.

EDUCATION:
Full Stack Coding Bootcamp Certificate (2022)

SKILLS:
HTML5, CSS3, JavaScript, React (Basic), Git, Figma`,
  },
];

export const ResumeUploaderModal: React.FC<ResumeUploaderModalProps> = ({
  isOpen,
  onClose,
  activeJob,
  weights,
  onCandidatesAdded,
}) => {
  const [tab, setTab] = useState<'upload' | 'paste' | 'samples'>('upload');
  
  // File upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Raw text state
  const [candidateName, setCandidateName] = useState('');
  const [rawText, setRawText] = useState('');

  // Screening state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
      setErrorMessage('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
      setErrorMessage('');
    }
  };

  const processSingleResume = async (
    name: string,
    resumeText: string,
    fileName?: string,
    fileData?: { data: string; mimeType: string },
    retryCount = 0
  ): Promise<Candidate> => {
    const res = await fetch('/api/screen-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobPosting: activeJob,
        resumeText,
        fileName,
        fileData,
        weights,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      if ((res.status === 429 || err?.isQuotaExceeded) && retryCount < 2) {
        setProgressText(`Gemini quota limit reached. Retrying automatically in 3 seconds (Attempt ${retryCount + 2}/3)...`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return processSingleResume(name, resumeText, fileName, fileData, retryCount + 1);
      }
      throw new Error(err.error || 'Failed to screen resume');
    }

    const screeningResult = await res.json();

    const candidate: Candidate = {
      id: screeningResult.candidateId || `cand-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      jobId: activeJob.id,
      name: screeningResult.candidateName || name || 'Uploaded Candidate',
      email: screeningResult.email || '',
      phone: screeningResult.phone || '',
      location: screeningResult.location || '',
      fileName: fileName || 'Resume.pdf',
      resumeText: resumeText || '(Binary file uploaded)',
      status: 'new',
      uploadedAt: new Date().toISOString(),
      screeningResult,
    };

    return candidate;
  };

  const handleStartScreening = async () => {
    setIsProcessing(true);
    setErrorMessage('');
    const newCandidates: Candidate[] = [];

    try {
      if (tab === 'upload') {
        if (selectedFiles.length === 0) {
          setErrorMessage('Please select at least one file');
          setIsProcessing(false);
          return;
        }

        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          setProgressText(`Analyzing resume ${i + 1} of ${selectedFiles.length}: "${file.name}"...`);

          if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            const text = await file.text();
            const cand = await processSingleResume(
              file.name.replace(/\.[^/.]+$/, ''),
              text,
              file.name
            );
            newCandidates.push(cand);
          } else {
            const arrayBuffer = await file.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            let binary = '';
            for (let b = 0; b < bytes.byteLength; b++) {
              binary += String.fromCharCode(bytes[b]);
            }
            const base64 = btoa(binary);

            const cand = await processSingleResume(
              file.name.replace(/\.[^/.]+$/, ''),
              '',
              file.name,
              {
                data: base64,
                mimeType: file.type || 'application/pdf',
              }
            );
            newCandidates.push(cand);
          }
        }
      } else if (tab === 'paste') {
        if (!rawText.trim()) {
          setErrorMessage('Please paste the candidate resume text');
          setIsProcessing(false);
          return;
        }

        setProgressText('Analyzing pasted resume content...');
        const cand = await processSingleResume(
          candidateName.trim() || 'Pasted Candidate',
          rawText.trim(),
          'Pasted_Resume.txt'
        );
        newCandidates.push(cand);
      }

      onCandidatesAdded(newCandidates);
      onClose();
    } catch (err: any) {
      console.error('Error screening resumes:', err);
      setErrorMessage(err.message || 'An error occurred during screening');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportSample = async (sample: typeof PREBUILT_SAMPLES[0]) => {
    setIsProcessing(true);
    setErrorMessage('');
    setProgressText(`Evaluating sample candidate "${sample.name}" with Gemini AI...`);

    try {
      const cand = await processSingleResume(sample.name, sample.resumeText, `${sample.name.replace(/\s+/g, '_')}_Resume.pdf`);
      onCandidatesAdded([cand]);
      onClose();
    } catch (err: any) {
      console.error('Error evaluating sample candidate:', err);
      setErrorMessage(err.message || 'Failed to import sample candidate');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-800 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Screen Candidate Resumes</h3>
              <p className="text-xs text-slate-500 font-medium">Target Role: <span className="text-indigo-600 font-bold">{activeJob.title}</span></p>
            </div>
          </div>
          <button onClick={onClose} disabled={isProcessing} className="text-slate-400 hover:text-slate-800 p-1.5 rounded-2xl hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 text-xs font-bold px-6 pt-2 gap-6 overflow-x-auto">
          <button
            onClick={() => setTab('upload')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              tab === 'upload' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" /> File Upload
          </button>

          <button
            onClick={() => setTab('paste')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              tab === 'paste' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" /> Paste Resume Text
          </button>

          <button
            onClick={() => setTab('samples')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              tab === 'samples' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" /> Demo Sample Candidates
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium">
              {errorMessage}
            </div>
          )}

          {/* TAB 1: FILE UPLOAD */}
          {tab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.txt,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-extrabold text-slate-900 mb-1">
                  Click or drag & drop candidate resumes
                </p>
                <p className="text-xs text-slate-500 font-medium">Supports PDF, DOCX, and TXT files (Bulk upload allowed)</p>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  <span className="text-xs font-bold text-slate-700">Selected Files ({selectedFiles.length}):</span>
                  {selectedFiles.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-medium">
                      <span className="truncate flex items-center gap-2">
                        <File className="w-3.5 h-3.5 text-indigo-600" /> {f.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">{(f.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PASTE TEXT */}
          {tab === 'paste' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Candidate Name (Optional)</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Resume Content Text *</label>
                <textarea
                  rows={8}
                  placeholder="Paste full raw resume text here including work experience, skills, and education..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
                />
              </div>
            </div>
          )}

          {/* TAB 3: DEMO SAMPLE CANDIDATES */}
          {tab === 'samples' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-medium">
                Click any sample candidate below to immediately process their resume through Gemini AI and test scoring:
              </p>
              <div className="space-y-2.5">
                {PREBUILT_SAMPLES.map((sample) => (
                  <div
                    key={sample.id}
                    className="p-4 bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-2xl flex items-center justify-between gap-3 transition-all group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-indigo-600">{sample.name}</h4>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold border border-indigo-200">
                          {sample.matchEstimate}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium line-clamp-1">{sample.summary}</p>
                    </div>

                    <button
                      disabled={isProcessing}
                      onClick={() => handleImportSample(sample)}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Evaluate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isProcessing && (
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center gap-3 text-xs text-indigo-900 font-medium">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
              <div>
                <p className="font-extrabold text-slate-900">Gemini AI Screening in Progress</p>
                <p className="text-[11px] text-slate-600">{progressText}</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        {tab !== 'samples' && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleStartScreening}
              disabled={isProcessing}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-200 transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Screening...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Run AI Screening
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
