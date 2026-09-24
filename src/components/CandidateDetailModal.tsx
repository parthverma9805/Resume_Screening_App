import React, { useState, useEffect } from 'react';
import { Candidate, JobPosting, QAMessage, ScreeningResult } from '../types';
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
  Download,
  Edit3,
  RotateCw,
  Plus,
  Trash2,
  Save,
  Target,
  Cpu,
  HeartHandshake,
  ArrowRight,
  CheckCheck,
  TrendingUp,
  BrainCircuit,
  Award,
  Sliders,
  Search,
  ChevronDown,
  ChevronUp,
  Star,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  CheckSquare,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
  CornerDownLeft
} from 'lucide-react';

interface CandidateDetailModalProps {
  candidate: Candidate | null;
  activeJob: JobPosting;
  onClose: () => void;
  onUpdateCandidate?: (updated: Candidate) => void;
}

const renderBoldTokens = (str: string) => {
  const parts = str.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

const renderFormattedMessageText = (text: string) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-2 text-sm sm:text-base leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Header ###
        if (trimmed.startsWith('### ')) {
          const headerTitle = trimmed.replace('### ', '');
          const isVerdict = headerTitle.includes('Direct Verdict');
          const isEvidence = headerTitle.includes('Evidence');
          const isImpact = headerTitle.includes('Impact');
          const isQuestion = headerTitle.includes('Question');

          return (
            <div
              key={idx}
              className={`font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 mt-3 pt-2 border-t first:mt-0 first:pt-0 first:border-t-0 ${
                isVerdict
                  ? 'text-teal-800 border-teal-200'
                  : isEvidence
                  ? 'text-blue-800 border-blue-200'
                  : isImpact
                  ? 'text-amber-800 border-amber-200'
                  : isQuestion
                  ? 'text-purple-800 border-purple-200'
                  : 'text-slate-800 border-slate-200'
              }`}
            >
              <span>{headerTitle}</span>
            </div>
          );
        }

        // Warning line
        if (trimmed.includes('⚠️ Not Found in Resume') || trimmed.includes('⚠️ Not Found')) {
          return (
            <div key={idx} className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-semibold my-1.5 flex items-start gap-2 text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{trimmed.replace(/^[⚠️\s]+/, '')}</span>
            </div>
          );
        }

        // Bullet point
        if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletContent = trimmed.replace(/^[•\-*]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-1 my-1">
              <span className="text-teal-600 font-bold shrink-0 mt-1">•</span>
              <div className="text-slate-700 leading-relaxed flex-1">
                {renderBoldTokens(bulletContent)}
              </div>
            </div>
          );
        }

        return (
          <p key={idx} className="text-slate-700 leading-relaxed">
            {renderBoldTokens(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  activeJob,
  onClose,
  onUpdateCandidate,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'experience' | 'resume' | 'interview' | 'qa' | 'edit'>('overview');
  const [skillFilter, setSkillFilter] = useState<'all' | 'matched' | 'missing'>('all');
  
  // Q&A Assistant state
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [savedToNotesMsgId, setSavedToNotesMsgId] = useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [isReAnalyzing, setIsReAnalyzing] = useState(false);
  const [reAnalyzeSuccess, setReAnalyzeSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedResume, setCopiedResume] = useState(false);

  // Interactive Overview & Analysis state
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedSkillForDetail, setSelectedSkillForDetail] = useState<{ skill: string; matched: boolean; notes?: string } | null>(null);
  const [showWeightSimulator, setShowWeightSimulator] = useState(false);
  const [simHard, setSimHard] = useState(40);
  const [simExp, setSimExp] = useState(25);
  const [simEdu, setSimEdu] = useState(20);
  const [simSoft, setSimSoft] = useState(15);
  const [showSoftSkillsDetail, setShowSoftSkillsDetail] = useState(false);
  const [showEducationDetail, setShowEducationDetail] = useState(false);
  const [recruiterNotes, setRecruiterNotes] = useState('');
  const [notesSavedFeedback, setNotesSavedFeedback] = useState(false);
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [copiedItemText, setCopiedItemText] = useState<string | null>(null);

  // Editable form state
  const [editName, setEditName] = useState('');
  const [editCurrentRole, setEditCurrentRole] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editYearsExp, setEditYearsExp] = useState(0);
  const [editOverallScore, setEditOverallScore] = useState(0);
  const [editRecommendation, setEditRecommendation] = useState<ScreeningResult['recommendation']>('Interview');
  const [editSummary, setEditSummary] = useState('');
  const [editEducation, setEditEducation] = useState<Array<{ degree: string; institution: string; year: string }>>([]);
  const [editExperience, setEditExperience] = useState<Array<{ title: string; company: string; duration: string; description: string }>>([]);
  const [editHardSkillsScore, setEditHardSkillsScore] = useState(0);
  const [editSoftSkillsScore, setEditSoftSkillsScore] = useState(0);
  const [editExpScore, setEditExpScore] = useState(0);
  const [editEduScore, setEditEduScore] = useState(0);

  useEffect(() => {
    if (candidate) {
      const res = candidate.screeningResult;
      setEditName(candidate.name || '');
      setEditCurrentRole(res?.currentRole || '');
      setEditEmail(res?.email || '');
      setEditPhone(res?.phone || '');
      setEditLocation(res?.location || '');
      setEditYearsExp(res?.yearsOfExperience || 0);
      setEditOverallScore(res?.overallScore || 0);
      setEditRecommendation(res?.recommendation || 'Interview');
      setEditSummary(res?.executiveSummary || '');
      setEditEducation(Array.isArray(res?.extractedEducation) ? JSON.parse(JSON.stringify(res.extractedEducation)) : []);
      setEditExperience(Array.isArray(res?.extractedExperience) ? JSON.parse(JSON.stringify(res.extractedExperience)) : []);
      setEditHardSkillsScore(res?.categoryScores?.hardSkills ?? 0);
      setEditSoftSkillsScore(res?.categoryScores?.softSkills ?? 0);
      setEditExpScore(res?.categoryScores?.experience ?? 0);
      setEditEduScore(res?.categoryScores?.education ?? 0);
      setRecruiterNotes(candidate.notes || '');

      setMessages([
        {
          id: 'msg-welcome',
          sender: 'ai',
          text: `Ask me anything about **${candidate.name}** regarding the **${activeJob.title}** role.

• All responses are strictly verified and grounded in ${candidate.name}'s resume facts.
• Feel free to ask about education, specific tech stack tools, project depth, career stability, or interview questions.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [candidate, activeJob.title]);

  useEffect(() => {
    if (activeTab === 'qa') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAsking, activeTab]);

  if (!candidate) return null;

  const res = candidate.screeningResult;
  const score = res?.overallScore ?? 0;

  const hardSkills = res?.categoryScores?.hardSkills ?? 0;
  const softSkills = res?.categoryScores?.softSkills ?? 0;
  const experienceScore = res?.categoryScores?.experience ?? 0;
  const educationScore = res?.categoryScores?.education ?? 0;

  const allSkills = ((res?.skillMatches || (res as any)?.skillsMatch) || []) as Array<{ skill: string; matched: boolean; notes?: string }>;
  const matchedSkills = allSkills.filter((s) => s?.matched);
  const missingSkills = allSkills.filter((s) => !s?.matched);
  const filteredSkills = allSkills.filter((s) => {
    const matchesFilter = skillFilter === 'matched' ? s?.matched : skillFilter === 'missing' ? !s?.matched : true;
    const matchesSearch = skillSearch.trim() === '' || s?.skill.toLowerCase().includes(skillSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  const gaps = (res?.missingRequiredSkills || res?.redFlagsOrGaps || []) as string[];

  const totalSimWeight = simHard + simExp + simEdu + simSoft;
  const simulatedScore = totalSimWeight > 0
    ? Math.round((hardSkills * simHard + experienceScore * simExp + educationScore * simEdu + softSkills * simSoft) / totalSimWeight)
    : score;

  const getSimulatedRec = (simScore: number) => {
    if (simScore >= 80) return { label: 'Strong Hire', dot: 'bg-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    if (simScore >= 65) return { label: 'Interview', dot: 'bg-teal-400', badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40' };
    if (simScore >= 50) return { label: 'Consider / Review', dot: 'bg-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    return { label: 'Reject / Hold', dot: 'bg-rose-400', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
  };
  const simRec = getSimulatedRec(simulatedScore);

  const getRecBadge = (rec?: string) => {
    const r = (rec || '').toLowerCase();
    if (r.includes('strong') || r.includes('hire')) {
      return {
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        dot: 'bg-emerald-500',
        label: rec || 'Strong Hire'
      };
    }
    if (r.includes('interview')) {
      return {
        badge: 'bg-teal-50 text-teal-800 border-teal-300',
        dot: 'bg-teal-500',
        label: rec || 'Interview'
      };
    }
    if (r.includes('consider') || r.includes('hold')) {
      return {
        badge: 'bg-amber-50 text-amber-800 border-amber-300',
        dot: 'bg-amber-500',
        label: rec || 'Consider'
      };
    }
    return {
      badge: 'bg-slate-100 text-slate-800 border-slate-300',
      dot: 'bg-slate-400',
      label: rec || 'Evaluated'
    };
  };

  const recBadge = getRecBadge(res?.recommendation);

  const handleReAnalyze = async () => {
    if (!candidate.resumeText && !candidate.fileData) return;
    setIsReAnalyzing(true);
    setReAnalyzeSuccess(false);

    try {
      const response = await fetch('/api/screen-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobPosting: activeJob,
          resumeText: candidate.resumeText,
          fileName: candidate.fileName,
          fileData: candidate.fileData,
          candidateId: candidate.id,
        }),
      });

      const updatedResult: ScreeningResult = await response.json();
      if (!response.ok) {
        throw new Error((updatedResult as any).error || 'Re-analysis failed');
      }

      const updatedCandidate: Candidate = {
        ...candidate,
        name: updatedResult.candidateName || candidate.name,
        screeningResult: updatedResult,
      };

      if (onUpdateCandidate) {
        onUpdateCandidate(updatedCandidate);
      }

      setReAnalyzeSuccess(true);
      setTimeout(() => setReAnalyzeSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error re-analyzing candidate:', err);
      alert(`Re-analysis error: ${err.message || 'Please try again.'}`);
    } finally {
      setIsReAnalyzing(false);
    }
  };

  const handleSetAsStudent = () => {
    if (!res) return;
    const targetMinExp = activeJob.minYearsExperience || 0;
    const calibratedExpScore = targetMinExp <= 1 ? 88 : 75;
    const updatedResult: ScreeningResult = {
      ...res,
      yearsOfExperience: 0,
      currentRole: res.currentRole?.toLowerCase().includes('student')
        ? res.currentRole
        : `${res.currentRole || 'Candidate'} (Final Year Student / Fresher)`,
      categoryScores: {
        ...res.categoryScores,
        experience: calibratedExpScore,
      },
      executiveSummary: res.executiveSummary.replace(/(\d+)\+?\s*years(?:\s+of)?\s+experience/gi, '0 yrs experience (Final Year Student / Fresher)'),
    };
    setEditYearsExp(0);
    setEditCurrentRole(updatedResult.currentRole);
    setEditExpScore(calibratedExpScore);
    if (onUpdateCandidate) {
      onUpdateCandidate({
        ...candidate,
        screeningResult: updatedResult,
      });
    }
  };

  const handleSaveEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!res) return;

    const updatedResult: ScreeningResult = {
      ...res,
      candidateName: editName.trim() || candidate.name,
      currentRole: editCurrentRole.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      location: editLocation.trim(),
      yearsOfExperience: Number(editYearsExp) || 0,
      overallScore: Number(editOverallScore) || 0,
      recommendation: editRecommendation,
      executiveSummary: editSummary.trim(),
      extractedEducation: editEducation,
      extractedExperience: editExperience,
      categoryScores: {
        hardSkills: Number(editHardSkillsScore) || 0,
        softSkills: Number(editSoftSkillsScore) || 0,
        experience: Number(editExpScore) || 0,
        education: Number(editEduScore) || 0,
      },
    };

    const updatedCandidate: Candidate = {
      ...candidate,
      name: editName.trim() || candidate.name,
      screeningResult: updatedResult,
    };

    if (onUpdateCandidate) {
      onUpdateCandidate(updatedCandidate);
    }

    setActiveTab('overview');
  };

  const handleAddEducation = () => {
    setEditEducation((prev) => [
      ...prev,
      { degree: 'Bachelor of Technology (B.Tech) in Computer Science', institution: 'Haridwar University', year: '2020 - 2024' },
    ]);
  };

  const handleRemoveEducation = (index: number) => {
    setEditEducation((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddExperience = () => {
    setEditExperience((prev) => [
      ...prev,
      { title: 'Software / Data Engineer', company: 'Tech Solutions Inc', duration: '2023 - Present', description: 'Built data workflows and backend services.' },
    ]);
  };

  const handleRemoveExperience = (index: number) => {
    setEditExperience((prev) => prev.filter((_, i) => i !== index));
  };

  const executeCandidateQuery = async (queryText: string) => {
    if (!queryText.trim() || isAsking || !res) return;

    const userText = queryText.trim();
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
          resumeText: candidate.resumeText || res.resumeText || '',
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

  const handleSaveToNotes = (msgId: string, text: string) => {
    if (!candidate) return;
    const cleanSnippet = text
      .replace(/^###\s+/gm, '')
      .slice(0, 320)
      .trim();
    const entry = `[AI Assistant Insight - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]: ${cleanSnippet}...`;
    const updated = recruiterNotes.trim() ? `${recruiterNotes}\n\n${entry}` : entry;
    setRecruiterNotes(updated);
    if (onUpdateCandidate) {
      onUpdateCandidate({
        ...candidate,
        notes: updated,
      });
    }
    setSavedToNotesMsgId(msgId);
    setTimeout(() => setSavedToNotesMsgId(null), 2500);
  };

  const handleSendQuery = (e: React.FormEvent) => {
    e.preventDefault();
    executeCandidateQuery(inputQuery);
  };

  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleResetChat = () => {
    if (!candidate) return;
    setMessages([
      {
        id: 'msg-welcome',
        sender: 'ai',
        text: `Ask me anything about **${candidate.name}** regarding the **${activeJob.title}** role.

• All responses are strictly verified and grounded in ${candidate.name}'s resume facts.
• Feel free to ask about education, specific tech stack tools, project depth, career stability, or interview questions.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleCopyReport = () => {
    if (!res) return;
    const text = `CANDIDATE SCREENING REPORT
Candidate: ${candidate.name}
Role: ${activeJob.title}
Overall Match Score: ${score}% (${res.recommendation})

Location: ${res.location || 'N/A'}
Tenure: ${res.yearsOfExperience} years
Education: ${res.extractedEducation?.map((e) => `${e.degree} (${e.institution})`).join(', ') || 'N/A'}

Executive Summary:
${res.executiveSummary}

Key Strengths:
${res.keyStrengths?.map((s) => `- ${s}`).join('\n')}

Missing Skills / Gaps:
${res.missingRequiredSkills?.map((m) => `- ${m}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const askAiAboutTopic = (prompt: string) => {
    setActiveTab('qa');
    executeCandidateQuery(prompt);
  };

  const handleUpdateStatus = (newStatus: Candidate['status']) => {
    if (onUpdateCandidate && candidate) {
      onUpdateCandidate({
        ...candidate,
        status: newStatus,
      });
    }
  };

  const handleSaveNotes = () => {
    if (onUpdateCandidate && candidate) {
      onUpdateCandidate({
        ...candidate,
        notes: recruiterNotes,
      });
      setNotesSavedFeedback(true);
      setTimeout(() => setNotesSavedFeedback(false), 2000);
    }
  };

  const handleToggleSkillVerification = (skillNameToToggle: string) => {
    if (!res || !candidate) return;
    const currentMatches = [...allSkills];
    const targetIdx = currentMatches.findIndex(
      (s) => s.skill.toLowerCase() === skillNameToToggle.toLowerCase()
    );
    if (targetIdx === -1) return;

    const updatedMatches = [...currentMatches];
    const prevMatched = updatedMatches[targetIdx].matched;
    const isNowMatched = !prevMatched;
    updatedMatches[targetIdx] = {
      ...updatedMatches[targetIdx],
      matched: isNowMatched,
      notes: isNowMatched ? 'Manually verified by recruiter' : 'Unverified by recruiter',
    };

    const newMatchedCount = updatedMatches.filter((s) => s.matched).length;
    const newHardSkillScore = Math.round((newMatchedCount / Math.max(1, updatedMatches.length)) * 100);

    const updatedResult: ScreeningResult = {
      ...res,
      skillMatches: updatedMatches,
      categoryScores: {
        ...res.categoryScores,
        hardSkills: newHardSkillScore,
        softSkills: res.categoryScores?.softSkills ?? 0,
        experience: res.categoryScores?.experience ?? 0,
        education: res.categoryScores?.education ?? 0,
      },
    };

    if (selectedSkillForDetail && selectedSkillForDetail.skill.toLowerCase() === skillNameToToggle.toLowerCase()) {
      setSelectedSkillForDetail(updatedMatches[targetIdx]);
    }

    if (onUpdateCandidate) {
      onUpdateCandidate({
        ...candidate,
        screeningResult: updatedResult,
      });
    }
  };

  const handleCopySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItemText(text);
    setTimeout(() => setCopiedItemText(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden text-slate-800 h-[92vh] max-h-[94vh] flex flex-col my-auto">
        
        {/* Header Section */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-1.5 rounded-2xl hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pr-8">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-3xl bg-teal-600 text-white flex items-center justify-center font-extrabold text-2xl shrink-0 shadow-md shadow-teal-200">
                {candidate.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{candidate.name}</h2>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${recBadge.badge}`}>
                    <span className={`w-2 h-2 rounded-full ${recBadge.dot}`} />
                    <span>{recBadge.label}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-bold mt-0.5">{res?.currentRole || 'Candidate'}</p>

                <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap font-medium">
                  {res?.email && (
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-teal-600" /> {res.email}</span>
                  )}
                  {res?.phone && (
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-teal-600" /> {res.phone}</span>
                  )}
                  {res?.location && (
                    <span className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-200/60 px-2 py-0.5 rounded-lg border border-slate-300"><MapPin className="w-3.5 h-3.5 text-teal-600" /> {res.location}</span>
                  )}
                  <span className="flex items-center gap-1 font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                    <Briefcase className="w-3.5 h-3.5 text-teal-600" />
                    {(res?.yearsOfExperience || 0) === 0 ? '🎓 Final Year Student / Fresher (0 yrs)' : `${res?.yearsOfExperience} yrs experience`}
                  </span>

                  {(res?.yearsOfExperience || 0) > 0 && (
                    <button
                      type="button"
                      onClick={handleSetAsStudent}
                      className="text-[11px] font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1"
                      title="Click if this candidate is a student/fresher to correct hallucinated years"
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Set as Student (0 yrs)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Score Radial Box & Action Buttons */}
            <div className="flex items-center gap-2 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-sm shrink-0">
              <div className="text-center px-2">
                <span className="text-3xl font-black text-teal-600 tracking-tight">{score}%</span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Overall Match</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-1.5 border-l border-slate-200 pl-2.5">
                <button
                  onClick={handleReAnalyze}
                  disabled={isReAnalyzing}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-300 disabled:opacity-50"
                  title="Re-run AI parser on this resume"
                >
                  <RotateCw className={`w-3.5 h-3.5 text-teal-600 ${isReAnalyzing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{isReAnalyzing ? 'Analyzing...' : reAnalyzeSuccess ? 'Updated!' : 'Re-Screen'}</span>
                </button>

                <button
                  onClick={() => setActiveTab(activeTab === 'edit' ? 'overview' : 'edit')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border ${
                    activeTab === 'edit'
                      ? 'bg-teal-600 text-white border-teal-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                  title="Edit candidate information manually"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </button>

                <button
                  onClick={() => generateCandidatePdf(candidate, activeJob.title)}
                  className="px-3 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-colors flex items-center gap-1.5"
                  title="Download Resume PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">PDF</span>
                </button>

                <button
                  onClick={handleCopyReport}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 justify-center border border-slate-300"
                  title="Copy Summary Report"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="border-b border-slate-200 bg-white/95 px-6 py-2.5 shrink-0 z-10">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Match Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('experience')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'experience'
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Experience & Education</span>
              {((res?.extractedExperience?.length || 0) + (res?.extractedEducation?.length || 0)) > 0 && (
                <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${activeTab === 'experience' ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {(res?.extractedExperience?.length || 0) + (res?.extractedEducation?.length || 0)}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('resume')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'resume'
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Full Resume</span>
            </button>

            <button
              onClick={() => setActiveTab('interview')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'interview'
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Interview Prep</span>
              {(res?.tailoredInterviewQuestions?.length || 0) > 0 && (
                <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${activeTab === 'interview' ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {res?.tailoredInterviewQuestions?.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('qa')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'qa'
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask AI Assistant</span>
            </button>

            <button
              onClick={() => setActiveTab('edit')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'edit'
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className={`flex-1 min-h-0 ${activeTab === 'qa' ? 'flex flex-col overflow-hidden p-3.5 sm:p-5' : 'overflow-y-auto p-6 space-y-6'}`}>
          
          {/* TAB: EDIT PROFILE */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSaveEdits} className="space-y-6">
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-teal-900">Edit & Correct Extracted Profile</h4>
                  <p className="text-[11px] text-teal-700">Manually update or correct any experience, education, or contact details extracted from the resume.</p>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-teal-200"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>

              {/* Personal & Contact Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">Current Role / Title</label>
                  <input
                    type="text"
                    value={editCurrentRole}
                    onChange={(e) => setEditCurrentRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">Email</label>
                  <input
                    type="text"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">Phone</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">Location (City, State, Country)</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Years of Experience</label>
                    <button
                      type="button"
                      onClick={() => {
                        setEditYearsExp(0);
                        if (!editCurrentRole.toLowerCase().includes('student')) {
                          setEditCurrentRole(`${editCurrentRole || 'Candidate'} (Final Year Student / Fresher)`);
                        }
                      }}
                      className="text-[10px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-1.5 py-0.5 rounded border border-teal-200 transition-colors"
                      title="Set experience to 0 for students/freshers"
                    >
                      🎓 Set Student (0 yrs)
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={editYearsExp}
                    onChange={(e) => setEditYearsExp(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Scores & Recommendation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Overall Match Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editOverallScore}
                    onChange={(e) => setEditOverallScore(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-black text-teal-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Recommendation</label>
                  <select
                    value={editRecommendation}
                    onChange={(e) => setEditRecommendation(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="Strong Hire">Strong Hire</option>
                    <option value="Interview">Interview</option>
                    <option value="Potential Match">Potential Match</option>
                    <option value="Keep on File">Keep on File</option>
                    <option value="Not a Match">Not a Match</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Experience Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editExpScore}
                    onChange={(e) => setEditExpScore(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Education Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editEduScore}
                    onChange={(e) => setEditEduScore(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Education List Editor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-indigo-600" /> Education & Degrees
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1 border border-indigo-200"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Degree
                  </button>
                </div>

                <div className="space-y-3">
                  {(editEducation || []).map((edu, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 relative">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Degree Title & Major</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditEducation((prev) => prev.map((item, i) => (i === idx ? { ...item, degree: val } : item)));
                          }}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Graduation Year / Span</label>
                        <input
                          type="text"
                          value={edu.year}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditEducation((prev) => prev.map((item, i) => (i === idx ? { ...item, year: val } : item)));
                          }}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Institution / University</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditEducation((prev) => prev.map((item, i) => (i === idx ? { ...item, institution: val } : item)));
                          }}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800"
                        />
                      </div>
                      <div className="flex items-end justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveEducation(idx)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1 border border-rose-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience List Editor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-teal-600" /> Work Experience & Projects
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-xs font-bold flex items-center gap-1 border border-teal-200"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Experience
                  </button>
                </div>

                <div className="space-y-3">
                  {(editExperience || []).map((exp, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Job Title / Role</label>
                          <input
                            type="text"
                            value={exp.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditExperience((prev) => prev.map((item, i) => (i === idx ? { ...item, title: val } : item)));
                            }}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Company / Project Name</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditExperience((prev) => prev.map((item, i) => (i === idx ? { ...item, company: val } : item)));
                            }}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Duration / Timeline</label>
                          <input
                            type="text"
                            value={exp.duration}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditExperience((prev) => prev.map((item, i) => (i === idx ? { ...item, duration: val } : item)));
                            }}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Key Responsibilities / Impact Summary</label>
                        <textarea
                          rows={2}
                          value={exp.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditExperience((prev) => prev.map((item, i) => (i === idx ? { ...item, description: val } : item)));
                          }}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(idx)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1 border border-rose-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove Role
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Executive Summary */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">Executive Summary</label>
                <textarea
                  rows={3}
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-teal-200"
                >
                  <Save className="w-4 h-4" /> Save Candidate Changes
                </button>
              </div>
            </form>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Interactive Category Breakdown Cards with Visual Progress & 1-Click Drilldowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* 1. Hard Skills (Clickable -> Scrolls to Skills Matrix) */}
                <div 
                  onClick={() => {
                    const el = document.getElementById('skill-matrix-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="p-4 bg-white border border-slate-200/90 hover:border-teal-400 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5"
                  title="Click to jump to Skill Alignment Matrix"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-teal-50 group-hover:bg-teal-100 border border-teal-100 flex items-center justify-center text-teal-600 transition-colors">
                          <Cpu className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Hard Skills</span>
                      </div>
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                        Target 80%
                      </span>
                    </div>
                    
                    <div className="flex items-baseline justify-between mt-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900 tracking-tight">{hardSkills}%</span>
                        <span className="text-[11px] font-semibold text-slate-400">match</span>
                      </div>
                      <span className={`text-[11px] font-bold ${hardSkills >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {hardSkills >= 80 ? '✓ Exceeds' : 'Needs Review'}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2.5">
                      <div 
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(5, hardSkills))}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-teal-600 group-hover:text-teal-700">
                    <span>{matchedSkills.length}/{allSkills.length} Verified</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Inspect Matrix <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* 2. Soft Skills (Clickable -> Toggles Deep-Dive Drawer) */}
                <div 
                  onClick={() => setShowSoftSkillsDetail((prev) => !prev)}
                  className={`p-4 bg-white border rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5 ${
                    showSoftSkillsDetail ? 'border-violet-500 ring-2 ring-violet-100' : 'border-slate-200/90 hover:border-violet-400'
                  }`}
                  title="Click to deep-dive cultural & communication competencies"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-violet-50 group-hover:bg-violet-100 border border-violet-100 flex items-center justify-center text-violet-600 transition-colors">
                          <HeartHandshake className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Soft Skills</span>
                      </div>
                      <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200">
                        Culture Fit
                      </span>
                    </div>
                    
                    <div className="flex items-baseline justify-between mt-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900 tracking-tight">{softSkills}%</span>
                        <span className="text-[11px] font-semibold text-slate-400">score</span>
                      </div>
                      <span className={`text-[11px] font-bold ${softSkills >= 75 ? 'text-violet-600' : 'text-slate-500'}`}>
                        {softSkills >= 85 ? 'Exceptional' : softSkills >= 75 ? 'Strong Fit' : 'Moderate'}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2.5">
                      <div 
                        className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(5, softSkills))}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-violet-600 group-hover:text-violet-700">
                    <span>Team & Culture</span>
                    <span className="flex items-center gap-0.5">
                      {showSoftSkillsDetail ? 'Hide Details ▲' : 'Deep-Dive ▼'}
                    </span>
                  </div>
                </div>

                {/* 3. Experience (Clickable -> Switches Tab to Career Timeline) */}
                <div 
                  onClick={() => setActiveTab('experience')}
                  className="p-4 bg-white border border-slate-200/90 hover:border-teal-400 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5"
                  title="Click to view full Career Timeline"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-teal-50 group-hover:bg-teal-100 border border-teal-100 flex items-center justify-center text-teal-600 transition-colors">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Experience</span>
                      </div>
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                        {(res?.yearsOfExperience || 0) === 0 ? '🎓 Fresher' : `${res?.yearsOfExperience} Yrs`}
                      </span>
                    </div>
                    
                    <div className="flex items-baseline justify-between mt-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900 tracking-tight">{experienceScore}%</span>
                        <span className="text-[11px] font-semibold text-slate-400">score</span>
                      </div>
                      <span className={`text-[11px] font-bold ${(res?.yearsOfExperience || 0) >= (activeJob.minYearsExperience || 0) ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {(res?.yearsOfExperience || 0) === 0 && (activeJob.minYearsExperience || 0) === 0
                          ? '✓ Fresher Fit'
                          : (res?.yearsOfExperience || 0) >= (activeJob.minYearsExperience || 0)
                          ? `+${(res?.yearsOfExperience || 0) - (activeJob.minYearsExperience || 0)}y vs req`
                          : `${(activeJob.minYearsExperience || 0) - (res?.yearsOfExperience || 0)}y under`}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2.5">
                      <div 
                        className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(5, experienceScore))}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-teal-600 group-hover:text-teal-700">
                    <span>Req: {activeJob.minYearsExperience || 0}+ Yrs</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Timeline <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* 4. Education (Clickable -> Toggles Credentials Drawer) */}
                <div 
                  onClick={() => setShowEducationDetail((prev) => !prev)}
                  className={`p-4 bg-white border rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5 ${
                    showEducationDetail ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200/90 hover:border-indigo-400'
                  }`}
                  title="Click to inspect degree and coursework verification"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 border border-indigo-100 flex items-center justify-center text-indigo-600 transition-colors">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Education</span>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                        Verified
                      </span>
                    </div>
                    
                    <div className="flex items-baseline justify-between mt-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900 tracking-tight">{educationScore}%</span>
                        <span className="text-[11px] font-semibold text-slate-400">score</span>
                      </div>
                      <span className="text-[11px] font-bold text-indigo-600">
                        {res?.extractedEducation && res.extractedEducation.length > 0 ? 'Degree Confirmed' : 'Evaluated'}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2.5">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(5, educationScore))}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-indigo-600 group-hover:text-indigo-700">
                    <span className="truncate max-w-[90px]">{res?.extractedEducation?.[0]?.degree || 'Degrees'}</span>
                    <span className="flex items-center gap-0.5">
                      {showEducationDetail ? 'Hide Details ▲' : 'Verify ▼'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expandable Soft Skills Deep-Dive Inspection Drawer */}
              {showSoftSkillsDetail && (
                <div className="bg-gradient-to-br from-violet-50/90 via-white to-purple-50/60 border border-violet-200 rounded-2xl p-5 shadow-sm space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-violet-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold shadow-xs">
                        <HeartHandshake className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-violet-950 uppercase tracking-wider">
                          Soft Skills & Cultural Alignment Breakdown
                        </h4>
                        <p className="text-[11px] text-violet-700 font-medium">
                          Synthesized across technical documentation, collaborative projects & leadership indicators
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => askAiAboutTopic(`Analyze ${candidate.name}'s soft skills, communication style, and cultural alignment for the ${activeJob.title} role. Provide resume evidence and suggest 2 culture-fit interview questions.`)}
                        className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Ask AI About Culture Fit
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSoftSkillsDetail(false)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-violet-100/50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-violet-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">Communication</span>
                        <span className="text-violet-700 font-extrabold text-[11px]">85%</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        Clarity in project descriptions, technical summaries, and structured achievements.
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-violet-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">Collaboration</span>
                        <span className="text-violet-700 font-extrabold text-[11px]">88%</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        Cross-functional team experience, agile workflow participation, and peer code reviews.
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-violet-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">Problem Solving</span>
                        <span className="text-violet-700 font-extrabold text-[11px]">90%</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        Demonstrated analytical approach to system debugging, optimization, and edge cases.
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-violet-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">Autonomy & Drive</span>
                        <span className="text-violet-700 font-extrabold text-[11px]">82%</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        Self-directed side projects, open-source repositories, and independent ownership.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Expandable Education Deep-Dive Inspection Drawer */}
              {showEducationDetail && (
                <div className="bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/60 border border-indigo-200 rounded-2xl p-5 shadow-sm space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                          Academic Credentials & Verification
                        </h4>
                        <p className="text-[11px] text-indigo-700 font-medium">
                          Cross-checked against {activeJob.educationRequirement || 'Bachelor’s Degree in CS or equivalent'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => askAiAboutTopic(`Verify ${candidate.name}'s education and academic coursework against the requirements for ${activeJob.title}. Does it satisfy the requirements?`)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Ask AI to Verify Rigor
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEducationDetail(false)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-indigo-100/50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {res?.extractedEducation && res.extractedEducation.length > 0 ? (
                      res.extractedEducation.map((edu, eIdx) => (
                        <div key={eIdx} className="p-3 bg-white rounded-xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div>
                            <span className="font-extrabold text-slate-900 text-xs block">{edu.degree}</span>
                            <span className="text-slate-600 font-medium">{edu.institution}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {edu.year && (
                              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                                Class of {edu.year}
                              </span>
                            )}
                            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                              ✓ Verified Match
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic p-2">No degree records parsed from resume text.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Executive Evaluation Dossier with AI Debrief & What-If Simulator trigger */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-700/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-white tracking-wide">
                          Executive Screening Verdict
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium">
                          AI synthesized evaluation for {activeJob.title}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold">
                        <span className={`w-2 h-2 rounded-full ${recBadge.dot} animate-pulse`} />
                        <span className="text-slate-200">Recommended Action:</span>
                        <span className="text-teal-300 font-extrabold">{res?.recommendation || 'Interview'}</span>
                      </div>

                      {/* Interactive Buttons */}
                      <button
                        type="button"
                        onClick={() => askAiAboutTopic(`Provide an executive hiring committee debrief for ${candidate.name} applying for ${activeJob.title}. Explain why you recommended ${res?.recommendation || 'Interview'}, list 3 critical technical questions for Round 1, and describe candidate upside vs risks.`)}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                        title="Open precision debrief with AI Assistant"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Debrief with AI
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowWeightSimulator((prev) => !prev)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                          showWeightSimulator
                            ? 'bg-amber-500 text-white border-amber-400'
                            : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/20'
                        }`}
                        title="Simulate custom weights (What-if analysis)"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>{showWeightSimulator ? 'Hide Simulator' : 'Simulate Weights'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopySnippet(res?.executiveSummary || '')}
                        className="p-1.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl transition-colors border border-white/10"
                        title="Copy Executive Summary"
                      >
                        {copiedItemText === (res?.executiveSummary || '') ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Narrative Summary */}
                  <div className="text-sm text-slate-200 leading-relaxed font-normal bg-black/25 p-4 rounded-xl border border-white/5">
                    {res?.executiveSummary || 'No executive summary generated.'}
                  </div>

                  {/* Quick metrics banner inside card */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    <div className="bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Match Score</span>
                      <span className="text-base sm:text-lg font-black text-teal-300">{score}%</span>
                    </div>
                    <div className="bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Required Skills</span>
                      <span className="text-base sm:text-lg font-black text-white">{matchedSkills.length}/{allSkills.length}</span>
                    </div>
                    <div className="bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Experience</span>
                      <span className="text-base sm:text-lg font-black text-teal-300">{res?.yearsOfExperience || 0} Years</span>
                    </div>
                    <div className="bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Education Match</span>
                      <span className="text-base sm:text-lg font-black text-indigo-300">{educationScore}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Scoring Simulator (What-If Weight Customizer) */}
              {showWeightSimulator && (
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 border border-teal-500/40 shadow-xl space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                          Interactive "What-If" Fit Simulator
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Slide weights to test how {candidate.name} evaluates under different hiring philosophies
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-teal-500/30 flex items-center gap-2">
                        <span className="text-[10px] uppercase font-extrabold text-slate-400">Simulated:</span>
                        <span className="text-base font-black text-teal-300">{simulatedScore}%</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${simRec.badge}`}>
                          {simRec.label}
                        </span>
                        {simulatedScore !== score && (
                          <span className={`text-[11px] font-black ${simulatedScore > score ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {simulatedScore > score ? `+${simulatedScore - score}%` : `${simulatedScore - score}%`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4 Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                    {/* Hard Skills Slider */}
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-300">Hard Skills</span>
                        <span className="text-xs font-black text-teal-300">{simHard}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="5"
                        value={simHard} 
                        onChange={(e) => setSimHard(Number(e.target.value))}
                        className="w-full accent-teal-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                      />
                      <span className="text-[10px] text-slate-400 block">Candidate actual: {hardSkills}%</span>
                    </div>

                    {/* Experience Slider */}
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-300">Experience</span>
                        <span className="text-xs font-black text-teal-300">{simExp}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="5"
                        value={simExp} 
                        onChange={(e) => setSimExp(Number(e.target.value))}
                        className="w-full accent-teal-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                      />
                      <span className="text-[10px] text-slate-400 block">Candidate actual: {experienceScore}%</span>
                    </div>

                    {/* Education Slider */}
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-300">Education</span>
                        <span className="text-xs font-black text-indigo-300">{simEdu}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="5"
                        value={simEdu} 
                        onChange={(e) => setSimEdu(Number(e.target.value))}
                        className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                      />
                      <span className="text-[10px] text-slate-400 block">Candidate actual: {educationScore}%</span>
                    </div>

                    {/* Soft Skills Slider */}
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-300">Soft Skills</span>
                        <span className="text-xs font-black text-violet-300">{simSoft}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="5"
                        value={simSoft} 
                        onChange={(e) => setSimSoft(Number(e.target.value))}
                        className="w-full accent-violet-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                      />
                      <span className="text-[10px] text-slate-400 block">Candidate actual: {softSkills}%</span>
                    </div>
                  </div>

                  {/* Presets and AI Query */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-700/60">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Presets:</span>
                      <button
                        type="button"
                        onClick={() => { setSimHard(60); setSimExp(20); setSimEdu(10); setSimSoft(10); }}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        🛠️ Tech Heavy (60/20/10/10)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSimHard(45); setSimExp(5); setSimEdu(35); setSimSoft(15); }}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        🎓 Fresher / Campus (45/5/35/15)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSimHard(25); setSimExp(35); setSimEdu(10); setSimSoft(30); }}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        👔 Leadership (25/35/10/30)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSimHard(40); setSimExp(25); setSimEdu(20); setSimSoft(15); }}
                        className="px-2.5 py-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded-lg text-[11px] font-bold transition-colors"
                      >
                        🔄 Default (40/25/20/15)
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => askAiAboutTopic(`If our team weights Hard Skills at ${simHard}%, Experience at ${simExp}%, Education at ${simEdu}%, and Soft Skills at ${simSoft}%, how does ${candidate.name} fit for ${activeJob.title}? Is this candidate an interview-worthy pick under this philosophy?`)}
                      className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Ask AI on Simulated Fit
                    </button>
                  </div>
                </div>
              )}

              {/* Key Strengths & Missing Gaps Grid (Interactive with AI probing & Question Generation) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Key Strengths */}
                <div className="p-5 bg-emerald-50/40 border border-emerald-200/80 rounded-2xl space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                    <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Strengths & Differentiators
                    </h4>
                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {(res?.keyStrengths || []).length} Highlights
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(res?.keyStrengths || []).length > 0 ? (
                      (res?.keyStrengths || []).map((str, idx) => (
                        <div key={idx} className="group p-2.5 bg-white/80 hover:bg-white rounded-xl border border-emerald-100 hover:border-emerald-300 transition-all flex items-start justify-between gap-2.5">
                          <div className="flex items-start gap-2.5 text-xs text-slate-800 font-medium leading-relaxed">
                            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black">
                              ✓
                            </span>
                            <span>{str}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => askAiAboutTopic(`Explain how ${candidate.name} demonstrated this strength: "${str}" with specific resume evidence and suggest 1 follow-up technical interview question.`)}
                              className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Probe strength with AI"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopySnippet(str)}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Copy strength"
                            >
                              {copiedItemText === str ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic p-2">No specific strengths parsed.</p>
                    )}
                  </div>
                </div>

                {/* Missing Skills / Identified Gaps */}
                <div className="p-5 bg-amber-50/40 border border-amber-200/80 rounded-2xl space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
                    <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" /> Missing Skills / Caution Areas
                    </h4>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      gaps.length > 0 
                        ? 'text-amber-800 bg-amber-100 border-amber-200' 
                        : 'text-emerald-800 bg-emerald-100 border-emerald-200'
                    }`}>
                      {gaps.length > 0 ? `${gaps.length} Identified` : 'Zero Gaps'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {gaps.length > 0 ? (
                      gaps.map((gap, idx) => (
                        <div key={idx} className="group p-2.5 bg-white/80 hover:bg-white rounded-xl border border-amber-100 hover:border-amber-300 transition-all flex items-start justify-between gap-2.5">
                          <div className="flex items-start gap-2.5 text-xs text-slate-800 font-medium leading-relaxed">
                            <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black">
                              !
                            </span>
                            <span>{gap}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => askAiAboutTopic(`Generate 2 targeted technical interview questions to test if ${candidate.name} can learn or compensate for missing: "${gap}"`)}
                              className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1"
                              title="Generate targeted interview questions"
                            >
                              <HelpCircle className="w-3 h-3 text-amber-700" /> Test
                            </button>
                            <button
                              type="button"
                              onClick={() => askAiAboutTopic(`Analyze whether missing requirement "${gap}" is a critical dealbreaker or easily trainable on the job for ${activeJob.title}.`)}
                              className="p-1 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Is this a dealbreaker?"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopySnippet(gap)}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Copy gap"
                            >
                              {copiedItemText === gap ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 bg-white/80 rounded-xl border border-emerald-100 text-center space-y-1">
                        <CheckCheck className="w-6 h-6 text-emerald-600 mx-auto" />
                        <p className="text-xs font-bold text-emerald-900">Zero Critical Gaps Found</p>
                        <p className="text-[11px] text-slate-500 font-medium">Candidate satisfies all mandatory job criteria without identified red flags.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills Alignment Matrix (Interactive with Search, Filter & Skill Verification Toggles) */}
              <div id="skill-matrix-section" className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Target className="w-4 h-4 text-teal-600" /> Skill Alignment Matrix
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Evaluated against {activeJob.title} technical & domain skill requirements
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    {/* Live Skill Search */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={skillSearch}
                        onChange={(e) => setSkillSearch(e.target.value)}
                        placeholder="Search skills (e.g. React, SQL)..."
                        className="pl-8 pr-7 py-1 text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl w-full sm:w-56 focus:outline-none focus:border-teal-500 font-medium transition-all"
                      />
                      {skillSearch && (
                        <button
                          type="button"
                          onClick={() => setSkillSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
                      <button
                        onClick={() => setSkillFilter('all')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          skillFilter === 'all'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        All ({allSkills.length})
                      </button>
                      <button
                        onClick={() => setSkillFilter('matched')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          skillFilter === 'matched'
                            ? 'bg-white text-emerald-700 shadow-2xs'
                            : 'text-slate-500 hover:text-emerald-700'
                        }`}
                      >
                        Matched ({matchedSkills.length})
                      </button>
                      <button
                        onClick={() => setSkillFilter('missing')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          skillFilter === 'missing'
                            ? 'bg-white text-amber-700 shadow-2xs'
                            : 'text-slate-500 hover:text-amber-700'
                        }`}
                      >
                        Missing ({missingSkills.length})
                      </button>
                    </div>
                  </div>
                </div>

                {/* Selected Skill Detail Inspector Drawer */}
                {selectedSkillForDetail && (
                  <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2.5 animate-in slide-in-from-top-1 duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${selectedSkillForDetail.matched ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="text-xs font-black text-slate-900 uppercase">
                          Skill Inspector: {selectedSkillForDetail.skill}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          selectedSkillForDetail.matched ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {selectedSkillForDetail.matched ? 'Verified on Resume' : 'Flagged as Missing'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedSkillForDetail(null)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      {selectedSkillForDetail.notes || (selectedSkillForDetail.matched 
                        ? 'Confirmed through project experience, direct keyword matching, and technical domain context.' 
                        : 'Not detected in extracted technical skills or experience bullets. Consider testing in screening round.')}
                    </p>

                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleToggleSkillVerification(selectedSkillForDetail.skill)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                          selectedSkillForDetail.matched
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>{selectedSkillForDetail.matched ? 'Mark as Unverified / Missing' : 'Manually Mark as Verified'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => askAiAboutTopic(`Examine ${candidate.name}'s resume specifically for knowledge, project work, or certifications related to "${selectedSkillForDetail.skill}". Quote relevant lines if present.`)}
                        className="px-3 py-1 bg-white hover:bg-teal-100 text-teal-800 border border-teal-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Ask AI to Verify Evidence
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('resume')}
                        className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" /> Search in Full Resume
                      </button>
                    </div>
                  </div>
                )}

                {/* Skill Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {filteredSkills.map((sm, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedSkillForDetail(selectedSkillForDetail?.skill === sm.skill ? null : sm)}
                      className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-1.5 cursor-pointer hover:shadow-xs group ${
                        selectedSkillForDetail?.skill === sm.skill
                          ? 'ring-2 ring-teal-500 bg-teal-50/40 border-teal-300'
                          : sm?.matched
                          ? 'bg-emerald-50/50 hover:bg-emerald-50/80 border-emerald-200/90 text-slate-800'
                          : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {sm?.matched ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span className="text-xs font-bold text-slate-900 truncate">{sm?.skill}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {/* Toggle verification button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSkillVerification(sm.skill);
                            }}
                            className={`p-1 rounded-md transition-colors ${
                              sm?.matched
                                ? 'text-emerald-700 hover:bg-emerald-100'
                                : 'text-slate-400 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={sm?.matched ? 'Click to mark missing' : 'Click to verify skill'}
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                          </button>

                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                            sm?.matched 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-slate-200/70 text-slate-500'
                          }`}>
                            {sm?.matched ? 'Verified' : 'Missing'}
                          </span>
                        </div>
                      </div>

                      {sm?.notes && (
                        <p className="text-[10px] text-slate-500 font-medium pl-6 leading-tight truncate">
                          {sm.notes}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100/80 text-[10px] font-bold text-teal-700 opacity-80 group-hover:opacity-100 transition-opacity">
                        <span>Click to inspect & verify</span>
                        <span className="flex items-center gap-0.5 text-teal-600">
                          Inspect <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredSkills.length === 0 && (
                  <div className="text-center py-6 space-y-1">
                    <p className="text-xs font-bold text-slate-600">No skills match "{skillSearch}"</p>
                    <p className="text-[11px] text-slate-400">Try searching for another keyword or resetting the filter pill.</p>
                  </div>
                )}
              </div>

              {/* Career & Academic Profile Highlights Snapshot */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Most Recent Role */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-teal-600" /> Latest Role & Career Track
                      </span>
                      {res?.extractedExperience?.[0]?.duration && (
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                          {res.extractedExperience[0].duration}
                        </span>
                      )}
                    </div>
                    <h5 className="text-sm font-bold text-slate-900">
                      {res?.extractedExperience?.[0]?.title || res?.currentRole || 'Professional Role'}
                    </h5>
                    <p className="text-xs text-slate-600 font-semibold mt-0.5">
                      {res?.extractedExperience?.[0]?.company || 'Verified Organization'}
                    </p>
                    {res?.extractedExperience?.[0]?.description && (
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                        {res.extractedExperience[0].description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setActiveTab('experience')}
                    className="mt-3 text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1.5 self-start pt-2 border-t border-slate-200/60 w-full"
                  >
                    <span>View Full Experience Timeline ({(res?.extractedExperience || []).length} positions)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Highest Academic Credential */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-600" /> Academic & Credentials
                      </span>
                      {res?.extractedEducation?.[0]?.year && (
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                          {res.extractedEducation[0].year}
                        </span>
                      )}
                    </div>
                    <h5 className="text-sm font-bold text-slate-900">
                      {res?.extractedEducation?.[0]?.degree || activeJob.educationRequirement || 'Academic Degree'}
                    </h5>
                    <p className="text-xs text-slate-600 font-semibold mt-0.5">
                      {res?.extractedEducation?.[0]?.institution || 'Accredited Institution'}
                    </p>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      {(res?.categoryScores?.education ?? 0) >= 80 ? '✓ Verified alignment with role educational prerequisites' : 'Academic credentials evaluated for requirements'}
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('experience')}
                    className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 self-start pt-2 border-t border-slate-200/60 w-full"
                  >
                    <span>View Verified Education Details ({(res?.extractedEducation || []).length} records)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Action Shortcuts Footer */}
              <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                    AI
                  </div>
                  <span className="text-xs font-bold text-slate-700">Next Recommended Screening Steps</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setActiveTab('interview')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 shadow-2xs flex items-center gap-1.5 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Interview Questions ({(res?.tailoredInterviewQuestions || []).length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('qa')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 shadow-2xs flex items-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                    <span>Ask AI Questions</span>
                  </button>

                  <button
                    onClick={() => generateCandidatePdf(candidate, activeJob.title)}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export PDF</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: EXPERIENCE & EDUCATION */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              
              {/* Experience & Education Qualification Highlights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Experience Metric Card */}
                <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-teal-900 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-teal-600" /> Experience Qualification
                    </span>
                    <span className="text-xs font-black text-teal-700 bg-teal-100/70 px-2.5 py-0.5 rounded-full border border-teal-300">
                      {res?.categoryScores?.experience ?? 0}% Score
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-white/80 p-2.5 rounded-xl border border-teal-100">
                      <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Candidate Tenure</span>
                      <span className="text-base font-black text-slate-900">{res?.yearsOfExperience || 0} Years</span>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-teal-100">
                      <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Role Requirement</span>
                      <span className="text-base font-black text-slate-900">{activeJob.minYearsExperience || 0}+ Years</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-teal-800 font-medium">
                    {(res?.yearsOfExperience || 0) >= (activeJob.minYearsExperience || 0)
                      ? `Candidate meets or exceeds target tenure by ${(res?.yearsOfExperience || 0) - (activeJob.minYearsExperience || 0)} years.`
                      : `Candidate is ${(activeJob.minYearsExperience || 0) - (res?.yearsOfExperience || 0)} years below the preferred experience minimum.`}
                  </p>
                </div>

                {/* Education Metric Card */}
                <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-indigo-900 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-indigo-600" /> Academic & Credentials Alignment
                    </span>
                    <span className="text-xs font-black text-indigo-700 bg-indigo-100/70 px-2.5 py-0.5 rounded-full border border-indigo-300">
                      {res?.categoryScores?.education ?? 0}% Score
                    </span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-indigo-100 text-xs">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Required Credential</span>
                    <span className="text-xs font-bold text-slate-900 line-clamp-1">{activeJob.educationRequirement || 'Bachelor’s Degree'}</span>
                  </div>
                  <p className="text-[11px] text-indigo-800 font-medium line-clamp-2">
                    {res?.extractedEducation && res.extractedEducation.length > 0
                      ? `Detected: ${res.extractedEducation[0].degree} from ${res.extractedEducation[0].institution}`
                      : 'Verified against degree prerequisites.'}
                  </p>
                </div>
              </div>

              {/* Experience Timeline */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-teal-600" /> Extracted Work Experience & Key Projects
                </h4>
                <div className="space-y-4">
                  {(res?.extractedExperience || []).length > 0 ? (
                    (res?.extractedExperience || []).map((exp, idx) => (
                      <div key={idx} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h5 className="text-sm font-bold text-slate-900">{exp.title}</h5>
                          <span className="text-xs text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-xl border border-teal-200 font-bold">
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
                  <GraduationCap className="w-4 h-4 text-indigo-600" /> Verified Education & Academic Credentials
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(res?.extractedEducation || []).length > 0 ? (
                    (res?.extractedEducation || []).map((edu, idx) => (
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
                These interview questions are dynamically generated to directly probe this candidate&apos;s potential weak points and verify highlighted projects.
              </div>

              <div className="space-y-4">
                {(res?.tailoredInterviewQuestions || []).map((iq, idx) => (
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
            <div className="flex-1 min-h-0 flex flex-col h-full space-y-3">
              {/* Minimal Top Status Bar */}
              <div className="flex items-center justify-between px-1 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs sm:text-sm font-bold text-slate-700">
                    Ask AI Assistant • Grounded in {candidate.name}&apos;s resume
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResetChat}
                  disabled={isAsking}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  title="Clear conversation"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Clear Chat</span>
                </button>
              </div>

              {/* Message List - Full available height with large, readable text */}
              <div className="flex-1 min-h-0 overflow-y-auto space-y-4 p-4 sm:p-6 bg-slate-50/70 border border-slate-200 rounded-2xl shadow-inner">
                {(messages || []).map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-3 text-sm sm:text-base ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.sender === 'ai' && (
                      <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 font-bold shadow-sm mt-0.5">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div
                      className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 sm:p-5 font-normal transition-all ${
                        m.sender === 'user'
                          ? 'bg-teal-700 text-white rounded-br-none shadow-md shadow-teal-700/20'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {m.sender === 'ai' ? (
                        <div>
                          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 gap-2">
                            <span className="text-xs font-extrabold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                              Precision Dossier Analysis
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSaveToNotes(m.id, m.text)}
                                className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                                  savedToNotesMsgId === m.id
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80'
                                }`}
                                title="Save to recruiter notes"
                              >
                                <Bookmark className="w-3 h-3 text-amber-700" />
                                <span>{savedToNotesMsgId === m.id ? 'Saved!' : 'Save to Notes'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCopyMessage(m.id, m.text)}
                                className="text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                                title="Copy answer"
                              >
                                {copiedMsgId === m.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-600">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {renderFormattedMessageText(m.text)}

                          <div className="text-xs text-slate-400 mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span>Resume Grounded</span>
                            <span>{m.timestamp}</span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                          <span className="text-xs text-teal-200/90 block mt-2 text-right font-medium">{m.timestamp}</span>
                        </div>
                      )}
                    </div>

                    {m.sender === 'user' && (
                      <div className="w-8 h-8 rounded-xl bg-slate-300 text-slate-700 flex items-center justify-center shrink-0 font-bold mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isAsking && (
                  <div className="flex items-center gap-2.5 text-sm text-teal-800 font-bold p-3.5 bg-teal-50 border border-teal-200 rounded-2xl animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                    <span>Cross-referencing {candidate.name}&apos;s resume against {activeJob.title} criteria...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Spacious Bottom Input Bar */}
              <form onSubmit={handleSendQuery} className="shrink-0 flex items-center gap-2.5 pt-1">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder={`Ask anything about ${candidate.name} (e.g. "Do they know Docker?", "Evaluate their project depth", "What are their main gaps?")...`}
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    disabled={isAsking}
                    className="w-full bg-white border border-slate-300 hover:border-slate-400 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition-all font-medium pr-10 shadow-2xs"
                  />
                  {inputQuery && (
                    <button
                      type="button"
                      onClick={() => setInputQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isAsking || !inputQuery.trim()}
                  className="px-5 sm:px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm shadow-teal-600/30 shrink-0"
                >
                  {isAsking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Ask AI</span>
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
