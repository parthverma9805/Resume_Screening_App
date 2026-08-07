import React, { useState } from 'react';
import { Candidate, JobPosting, QAMessage } from '../types';
import { generateCandidatePdf } from '../utils/pdfGenerator';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Briefcase, 
  GraduationCap, 
  HelpCircle, 
  Send, 
  MessageSquare, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Loader2,
  Copy,
  Check,
  FileText,
  Download
} from 'lucide-react';

interface CandidateDetailModalProps {
  candidate: Candidate | null;
  activeJob: JobPosting;
  onClose: () => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  activeJob,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'experience' | 'resume' | 'interview' | 'qa'>('overview');
  
  // Q&A Assistant state
  const [messages, setMessages] = useState<QAMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Hello! Ask me any specific question about ${candidate?.name || 'this candidate'}'s resume, technical depth, or fit for the ${activeJob.title} role.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedResume, setCopiedResume] = useState(false);

  if (!candidate) return null;

  const res = candidate.screeningResult;
  const score = res?.overallScore ?? 0;

  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isAsking || !res) return;

    const userText = inputQuery.trim();
    setInputQuery('');
    const userMsg: QAMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsAsking(true);

    try {
      const response = await fetch('/api/candidate-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobPosting: activeJob,
          screeningResult: res,
          question: userText,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to answer candidate query.');
      }
      const aiMsg: QAMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.answer || 'No response returned from AI.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Error asking candidate QA:', err);
      const errText = err?.message || 'An error occurred while communicating with Gemini AI.';
      const aiMsg: QAMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ ${errText}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleCopyReport = () => {
    if (!res) return;
    const text = `CANDIDATE SCREENING REPORT
Candidate: ${candidate.name}
Role: ${activeJob.title}
Overall Match Score: ${score}% (${res.recommendation})

Executive Summary:
${res.executiveSummary}

Key Strengths:
${res.keyStrengths.map((s) => `- ${s}`).join('\n')}

Missing Skills / Gaps:
${res.missingRequiredSkills.map((m) => `- ${m}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden text-slate-800 max-h-[90vh] flex flex-col my-auto">
        
        {/* Header Section */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-1.5 rounded-2xl hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pr-8">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-3xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl shrink-0 shadow-md shadow-indigo-200">
                {candidate.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-extrabold text-slate-900">{candidate.name}</h2>
                  <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full border border-indigo-200">
                    {res?.recommendation || 'Evaluated'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-bold mt-0.5">{res?.currentRole || 'Candidate'}</p>

                <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap font-medium">
                  {res?.email && (
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-indigo-600" /> {res.email}</span>
                  )}
                  {res?.phone && (
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-indigo-600" /> {res.phone}</span>
                  )}
                  {res?.location && (
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-indigo-600" /> {res.location}</span>
                  )}
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-indigo-600" /> {res?.yearsOfExperience || 0} yrs experience</span>
                </div>
              </div>
            </div>

            {/* Score Radial Box & Action Buttons */}
            <div className="flex items-center gap-2 bg-white p-2.5 sm:p-3.5 rounded-2xl border border-slate-200 shadow-sm shrink-0">
              <div className="text-center px-2">
                <span className="text-3xl font-black text-indigo-600 tracking-tight">{score}%</span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Overall Match</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-1.5 border-l border-slate-200 pl-2.5">
                <button
                  onClick={() => generateCandidatePdf(candidate, activeJob.title)}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-colors flex items-center gap-1.5"
                  title="Download Resume PDF"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Resume PDF</span>
                </button>

                <button
                  onClick={handleCopyReport}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 justify-center"
                  title="Copy Summary Report"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-2 gap-6 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'overview' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" /> AI Match Overview
          </button>

          <button
            onClick={() => setActiveTab('experience')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'experience' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" /> Experience & Education
          </button>

          <button
            onClick={() => setActiveTab('resume')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'resume' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" /> Full Resume Text
          </button>

          <button
            onClick={() => setActiveTab('interview')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'interview' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" /> Tailored Interview Questions
          </button>

          <button
            onClick={() => setActiveTab('qa')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'qa' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Ask AI Assistant
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">

              {/* Executive Summary */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-bold text-indigo-600">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Executive AI Summary</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('resume')}
                    className="text-[11px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-xl border border-indigo-200 transition-colors flex items-center gap-1 font-semibold"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Candidate&apos;s Full Resume</span>
                  </button>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{res?.executiveSummary}</p>
              </div>

              {/* Category Scores Breakdown */}
              {res?.categoryScores && (
                <div>
                  <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">Evaluation Category Breakdown</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Hard Skills</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-slate-800">{res.categoryScores.hardSkills}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${res.categoryScores.hardSkills}%` }} />
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Soft Skills</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-slate-800">{res.categoryScores.softSkills}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${res.categoryScores.softSkills}%` }} />
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Experience</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-slate-800">{res.categoryScores.experience}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${res.categoryScores.experience}%` }} />
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Education</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-slate-800">{res.categoryScores.education}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                        <div className="bg-purple-500 h-full rounded-full" style={{ width: `${res.categoryScores.education}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Strengths & Missing Skills / Red Flags Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Strengths */}
                <div className="p-5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Key Strengths & Highlights</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 font-medium">
                    {res?.keyStrengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Missing Skills & Gaps */}
                <div className="p-5 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Skill Gaps & Considerations</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 font-medium">
                    {res?.missingRequiredSkills && res.missingRequiredSkills.length > 0 && (
                      <li className="text-amber-800 font-bold">
                        Missing required skills: {res.missingRequiredSkills.join(', ')}
                      </li>
                    )}
                    {res?.redFlagsOrGaps && res.redFlagsOrGaps.length > 0 ? (
                      res.redFlagsOrGaps.map((flag, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                          <span>{flag}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400 italic">No major red flags detected.</li>
                    )}
                  </ul>
                </div>

              </div>

              {/* Skills Matrix */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">Required Skill Matches</h4>
                <div className="flex flex-wrap gap-2">
                  {res?.skillMatches.map((sm, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-1.5 rounded-2xl border text-xs flex items-center gap-2 font-bold ${
                        sm.matched
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-slate-100 border-slate-200 text-slate-500'
                      }`}
                    >
                      {sm.matched ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span>{sm.skill}</span>
                      {sm.notes && <span className="text-[10px] text-slate-500 border-l border-slate-300 pl-2 font-medium">{sm.notes}</span>}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: EXPERIENCE & EDUCATION */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              
              {/* Experience Timeline */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" /> Extracted Work Experience
                </h4>
                <div className="space-y-4">
                  {res?.extractedExperience && res.extractedExperience.length > 0 ? (
                    res.extractedExperience.map((exp, idx) => (
                      <div key={idx} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h5 className="text-sm font-bold text-slate-900">{exp.title}</h5>
                          <span className="text-xs text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-xl border border-indigo-200 font-bold">
                            {exp.duration}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-500">{exp.company}</p>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">{exp.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No structured work experience extracted.</p>
                  )}
                </div>
              </div>

              {/* Education */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600" /> Education & Credentials
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {res?.extractedEducation && res.extractedEducation.length > 0 ? (
                    res.extractedEducation.map((edu, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                        <h5 className="text-xs font-bold text-slate-900">{edu.degree}</h5>
                        <p className="text-xs text-slate-500 font-medium">{edu.institution}</p>
                        {edu.year && <p className="text-[11px] text-indigo-600 mt-1 font-bold">{edu.year}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No education details recorded.</p>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB: CANDIDATE ORIGINAL RESUME */}
          {activeTab === 'resume' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" /> {candidate.name}&apos;s Uploaded Resume
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {candidate.fileName ? `File: ${candidate.fileName}` : 'Raw Resume Document'} • {candidate.resumeText ? `${candidate.resumeText.split(/\s+/).length} words` : '0 words'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => generateCandidatePdf(candidate, activeJob.title)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>

                  <button
                    onClick={() => {
                      if (candidate.resumeText) {
                        navigator.clipboard.writeText(candidate.resumeText);
                        setCopiedResume(true);
                        setTimeout(() => setCopiedResume(false), 2000);
                      }
                    }}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-indigo-200"
                  >
                    {copiedResume ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedResume ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                </div>
              </div>

              {candidate.resumeText ? (
                <div className="p-5 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 font-mono text-xs leading-relaxed whitespace-pre-wrap overflow-x-auto max-h-[55vh] selection:bg-indigo-500 selection:text-white shadow-inner">
                  {candidate.resumeText}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-2xl">
                  No plain-text resume content available for this candidate.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TAILORED INTERVIEW QUESTIONS */}
          {activeTab === 'interview' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900 font-medium">
                These interview questions are dynamically generated by Gemini AI to directly probe this candidate&apos;s potential weak points and verify highlighted projects.
              </div>

              <div className="space-y-4">
                {res?.tailoredInterviewQuestions.map((iq, idx) => (
                  <div key={idx} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-200">
                        Focus Area: {iq.focusArea}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">Q{idx + 1}</span>
                    </div>

                    <p className="text-xs font-bold text-slate-900 leading-snug">&quot;{iq.question}&quot;</p>

                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                      <span className="text-slate-800 font-bold">What to listen for: </span>
                      {iq.expectedAnswerDetails}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ASK AI ASSISTANT */}
          {activeTab === 'qa' && (
            <div className="space-y-4 flex flex-col h-[50vh]">
              <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900 font-medium flex items-center gap-2 shrink-0">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Ask Gemini AI anything about {candidate.name}&apos;s background, technical fit, or specific achievements.</span>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-3 text-xs ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.sender === 'ai' && (
                      <div className="w-8 h-8 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold shadow-sm">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-2xl p-3.5 leading-relaxed font-medium ${
                        m.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-200'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.text}</p>
                      <span className="text-[10px] text-slate-400 block mt-1 text-right">{m.timestamp}</span>
                    </div>

                    {m.sender === 'user' && (
                      <div className="w-8 h-8 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-bold">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
                {isAsking && (
                  <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold p-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Gemini is analyzing candidate resume...</span>
                  </div>
                )}
              </div>

              {/* Input Bar */}
              <form onSubmit={handleSendQuery} className="flex gap-2 shrink-0">
                <input
                  type="text"
                  placeholder={`Ask AI about ${candidate.name} (e.g. "Does she have React performance experience?")...`}
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  disabled={isAsking}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={isAsking || !inputQuery.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-200"
                >
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
