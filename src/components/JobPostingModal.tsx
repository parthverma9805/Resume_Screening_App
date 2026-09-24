import React, { useState, useEffect } from 'react';
import { JobPosting } from '../types';
import { X, Sparkles, Plus, Trash2, Briefcase, Check, Loader2, Edit3, Wand2, Zap, ArrowRight, MapPin, Building2, Globe, Laptop, Home } from 'lucide-react';

interface JobPostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveJob: (job: JobPosting) => void;
  initialJob?: JobPosting | null;
  onDeleteJob?: (jobId: string) => void;
}

const QUICK_ROLE_PRESETS = [
  { label: 'Senior Full Stack', prompt: 'Senior Full Stack Engineer (React, Node.js, TypeScript, PostgreSQL, AWS)', dept: 'Engineering', level: 'Senior' as const },
  { label: 'Frontend React', prompt: 'Senior Frontend Engineer (React, TypeScript, Next.js, Tailwind CSS, GraphQL)', dept: 'Engineering', level: 'Senior' as const },
  { label: 'Golang Backend', prompt: 'Senior Golang Backend Engineer (Go, gRPC, Microservices, PostgreSQL, Kafka)', dept: 'Engineering', level: 'Senior' as const },
  { label: 'Python / FastAPI', prompt: 'Python Backend Engineer (FastAPI, Django, PostgreSQL, Celery, Redis, Docker)', dept: 'Engineering', level: 'Mid Level' as const },
  { label: 'AI & LLM Engineer', prompt: 'Staff AI & LLM Research Engineer (Python, RAG, LangChain, Vector DBs, PyTorch)', dept: 'Data & AI', level: 'Lead' as const },
  { label: 'DevOps & SRE', prompt: 'Senior DevOps & Cloud Platform Engineer (Kubernetes, Terraform, AWS, CI/CD, Docker)', dept: 'DevOps & Infrastructure', level: 'Senior' as const },
  { label: 'Data Scientist', prompt: 'Senior Data Scientist (Python, Machine Learning, PyTorch, SQL, Statistical Modeling)', dept: 'Data & AI', level: 'Senior' as const },
  { label: 'UI/UX Designer', prompt: 'Senior Product & UI/UX Designer (Figma, Design Systems, User Research, Prototyping)', dept: 'Design & UX', level: 'Senior' as const },
  { label: 'Product Manager', prompt: 'Senior Technical Product Manager (Product Strategy, Agile, PRDs, Analytics, User Discovery)', dept: 'Product Management', level: 'Senior' as const },
  { label: 'Mobile (React Native/iOS)', prompt: 'Mobile Application Engineer (React Native, iOS, Swift, Android, Offline Sync)', dept: 'Mobile Engineering', level: 'Senior' as const },
  { label: 'Cybersecurity', prompt: 'Cybersecurity & Security Operations Engineer (SIEM, Pen Testing, IAM, SOC 2, Network Security)', dept: 'Information Security', level: 'Senior' as const },
  { label: 'QA Automation', prompt: 'QA Automation Engineer SDET (Playwright, Cypress, API Testing, TypeScript, CI/CD)', dept: 'Quality Engineering', level: 'Mid Level' as const },
];

export const JobPostingModal: React.FC<JobPostingModalProps> = ({
  isOpen,
  onClose,
  onSaveJob,
  initialJob,
  onDeleteJob,
}) => {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [city, setCity] = useState('Bengaluru, India');
  const [workMode, setWorkMode] = useState<'Remote' | 'Hybrid' | 'On-site'>('Hybrid');
  const [location, setLocation] = useState('Bengaluru, India (Hybrid)');
  const [employmentType, setEmploymentType] = useState<'Full-time' | 'Internship' | 'Part-time' | 'Contract' | 'Remote'>('Full-time');
  const [experienceLevel, setExperienceLevel] = useState<'Entry Level' | 'Mid Level' | 'Senior' | 'Lead' | 'Executive'>('Senior');
  const [minYearsExperience, setMinYearsExperience] = useState<number>(5);
  const [educationRequirement, setEducationRequirement] = useState("Bachelor's degree in Computer Science or related field");
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [preferredSkills, setPreferredSkills] = useState<string[]>([]);
  
  const [newRequiredSkill, setNewRequiredSkill] = useState('');
  const [newPreferredSkill, setNewPreferredSkill] = useState('');
  
  // AI Generator state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtractingSkills, setIsExtractingSkills] = useState(false);
  const [aiPromptTitle, setAiPromptTitle] = useState('');
  const [aiError, setAiError] = useState('');
  const [skillsExtractedSuccess, setSkillsExtractedSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialJob) {
        setTitle(initialJob.title || '');
        setDepartment(initialJob.department || 'Engineering');
        const rawLoc = initialJob.location || 'Bengaluru, India (Hybrid)';
        let detectedMode: 'Remote' | 'Hybrid' | 'On-site' = initialJob.workMode || 'Hybrid';
        if (!initialJob.workMode) {
          if (/remote/i.test(rawLoc)) detectedMode = 'Remote';
          else if (/on-site|onsite|in-office/i.test(rawLoc)) detectedMode = 'On-site';
          else if (/hybrid/i.test(rawLoc)) detectedMode = 'Hybrid';
        }
        setWorkMode(detectedMode);
        const parsedCity = initialJob.city || rawLoc.replace(/\s*\((Remote|Hybrid|On-site|In-office)\)/i, '').trim();
        setCity(parsedCity || (detectedMode === 'Remote' ? 'Remote / Worldwide' : 'Bengaluru, India'));
        setLocation(initialJob.location || `${parsedCity || 'Bengaluru, India'} (${detectedMode})`);
        setEmploymentType(initialJob.employmentType || 'Full-time');
        setExperienceLevel(initialJob.experienceLevel || 'Senior');
        setMinYearsExperience(initialJob.minYearsExperience ?? 5);
        setEducationRequirement(initialJob.educationRequirement || '');
        setDescription(initialJob.description || '');
        setRequiredSkills(initialJob.requiredSkills || []);
        setPreferredSkills(initialJob.preferredSkills || []);
        setAiPromptTitle(initialJob.title || '');
      } else {
        setTitle('');
        setDepartment('Engineering');
        setCity('Bengaluru, India');
        setWorkMode('Hybrid');
        setLocation('Bengaluru, India (Hybrid)');
        setEmploymentType('Full-time');
        setExperienceLevel('Entry Level');
        setMinYearsExperience(0);
        setEducationRequirement("Bachelor's degree in Computer Science, Software Engineering, or equivalent practical experience");
        setDescription('');
        setRequiredSkills(['Python', 'Data Structures & Algorithms', 'Problem Solving', 'SQL', 'Git']);
        setPreferredSkills(['Machine Learning', 'Docker', 'FastAPI', 'Cloud Fundamentals']);
        setAiPromptTitle('');
      }
      setAiError('');
      setSkillsExtractedSuccess('');
    }
  }, [isOpen, initialJob]);

  if (!isOpen) return null;

  const handleAddRequiredSkill = (customSkill?: string) => {
    const val = (customSkill || newRequiredSkill).trim();
    if (val && !requiredSkills.some((s) => s.toLowerCase() === val.toLowerCase())) {
      setRequiredSkills([...requiredSkills, val]);
      if (!customSkill) setNewRequiredSkill('');
    }
  };

  const handleRemoveRequiredSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skill));
  };

  const handleAddPreferredSkill = (customSkill?: string) => {
    const val = (customSkill || newPreferredSkill).trim();
    if (val && !preferredSkills.some((s) => s.toLowerCase() === val.toLowerCase())) {
      setPreferredSkills([...preferredSkills, val]);
      if (!customSkill) setNewPreferredSkill('');
    }
  };

  const handleRemovePreferredSkill = (skill: string) => {
    setPreferredSkills(preferredSkills.filter((s) => s !== skill));
  };

  const executeJobGeneration = async (promptText: string, deptHint?: string, levelHint?: any) => {
    const cleanPrompt = promptText.trim() || title.trim() || 'Senior Full Stack Engineer';
    setIsGenerating(true);
    setAiError('');
    setSkillsExtractedSuccess('');
    try {
      const res = await fetch('/api/generate-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: cleanPrompt,
          department: deptHint || department,
          experienceLevel: levelHint || experienceLevel,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTitle(data.title || cleanPrompt);
        if (data.department) setDepartment(data.department);
        if (data.location) setLocation(data.location);
        if (data.employmentType) setEmploymentType(data.employmentType);
        if (data.experienceLevel) setExperienceLevel(data.experienceLevel);
        if (typeof data.minYearsExperience === 'number') setMinYearsExperience(data.minYearsExperience);
        if (data.educationRequirement) setEducationRequirement(data.educationRequirement);
        if (data.description) setDescription(data.description);
        if (Array.isArray(data.requiredSkills) && data.requiredSkills.length > 0) {
          setRequiredSkills(data.requiredSkills);
        }
        if (Array.isArray(data.preferredSkills) && data.preferredSkills.length > 0) {
          setPreferredSkills(data.preferredSkills);
        }
        setAiPromptTitle(data.title || cleanPrompt);
        setSkillsExtractedSuccess(`Generated unique tailored profile for "${data.title}" with ${data.requiredSkills?.length || 0} core skills & detailed requirements!`);
      } else {
        setAiError(data.error || 'Failed to generate job description.');
      }
    } catch (err: any) {
      console.error('Failed to generate JD:', err);
      setAiError(err?.message || 'An error occurred while generating job description.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAIJob = () => {
    const p = aiPromptTitle.trim() || title.trim();
    if (!p) {
      setAiError('Please enter a role title, tech stack, or select a quick preset below.');
      return;
    }
    executeJobGeneration(p);
  };

  const handleSelectPreset = (preset: typeof QUICK_ROLE_PRESETS[0]) => {
    setAiPromptTitle(preset.prompt);
    setDepartment(preset.dept);
    setExperienceLevel(preset.level);
    executeJobGeneration(preset.prompt, preset.dept, preset.level);
  };

  const handleExtractSkillsFromDescription = async () => {
    if (!description.trim() && !title.trim()) {
      setAiError('Please enter a Job Title or Role Description first.');
      return;
    }
    setIsExtractingSkills(true);
    setAiError('');
    setSkillsExtractedSuccess('');
    try {
      const res = await fetch('/api/extract-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          title: title.trim() || aiPromptTitle.trim(),
          department: department.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.requiredSkills) {
        setRequiredSkills(data.requiredSkills);
        if (data.preferredSkills) setPreferredSkills(data.preferredSkills);
        setSkillsExtractedSuccess(`Extracted ${data.requiredSkills.length} required and ${(data.preferredSkills || []).length} preferred skills matching the description.`);
      } else {
        setAiError(data.error || 'Failed to extract skills.');
      }
    } catch (err: any) {
      console.error('Failed to extract skills:', err);
      setAiError(err?.message || 'An error occurred while extracting skills.');
    } finally {
      setIsExtractingSkills(false);
    }
  };

  const handleExperienceLevelChange = (newLevel: any) => {
    setExperienceLevel(newLevel);
    if (newLevel === 'Entry Level') setMinYearsExperience(0);
    else if (newLevel === 'Mid Level') setMinYearsExperience(2);
    else if (newLevel === 'Senior') setMinYearsExperience(5);
    else if (newLevel === 'Lead') setMinYearsExperience(8);
    else if (newLevel === 'Executive') setMinYearsExperience(10);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setAiError('Please provide both a Job Title and a Role Description.');
      return;
    }

    const effectiveCity = city.trim() || (workMode === 'Remote' ? 'Remote / Worldwide' : 'Bengaluru, India');
    let formattedLocation = '';
    if (workMode === 'Remote') {
      formattedLocation = effectiveCity.toLowerCase().includes('remote') ? effectiveCity : `${effectiveCity} (Remote)`;
    } else {
      formattedLocation = `${effectiveCity} (${workMode})`;
    }

    const savedJob: JobPosting = {
      id: initialJob ? initialJob.id : `job-${Date.now()}`,
      title: title.trim(),
      department: department.trim() || 'General',
      city: effectiveCity,
      workMode,
      location: formattedLocation,
      employmentType,
      experienceLevel,
      minYearsExperience: Number(minYearsExperience) >= 0 ? Number(minYearsExperience) : 0,
      educationRequirement: educationRequirement.trim(),
      description: description.trim(),
      requiredSkills: requiredSkills.length > 0 ? requiredSkills : ['Problem Solving', 'Technical Execution'],
      preferredSkills,
      createdAt: initialJob ? initialJob.createdAt : new Date().toISOString(),
    };

    onSaveJob(savedJob);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-800 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-200/80 bg-white">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {initialJob ? 'Edit Job Profile' : 'Create Job Profile'}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Modify requirements and criteria for this role
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <form onSubmit={handleSubmit} className="p-7 space-y-5 max-h-[78vh] overflow-y-auto">
          
          {/* AI Job Generator Box */}
          <div className="p-4.5 bg-indigo-50/50 border border-indigo-200/70 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI Job Generator</span>
            </div>

            <div className="flex items-center gap-2.5">
              <input
                type="text"
                placeholder="e.g. Data Analyst, Senior Full Stack Engineer, AI Researcher..."
                value={aiPromptTitle || title}
                onChange={(e) => {
                  setAiPromptTitle(e.target.value);
                  if (!title) setTitle(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleGenerateAIJob();
                  }
                }}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium shadow-2xs"
              />
              <button
                type="button"
                onClick={handleGenerateAIJob}
                disabled={isGenerating || (!aiPromptTitle.trim() && !title.trim())}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-sm shadow-indigo-200"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Auto-Filling...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Auto-Fill
                  </>
                )}
              </button>
            </div>

            {/* Quick Presets */}
            <div className="pt-0.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" /> Quick:
                </span>
                {QUICK_ROLE_PRESETS.slice(0, 6).map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    disabled={isGenerating}
                    className="text-[11px] font-medium bg-white hover:bg-indigo-600 hover:text-white text-slate-600 border border-slate-200 hover:border-indigo-600 px-2.5 py-0.5 rounded-lg transition-all shadow-2xs"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {aiError && (
              <p className="text-[11px] text-rose-600 font-semibold bg-rose-50 border border-rose-200 p-2 rounded-xl">
                {aiError}
              </p>
            )}
            {skillsExtractedSuccess && (
              <p className="text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 p-2 rounded-xl flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {skillsExtractedSuccess}
              </p>
            )}
          </div>

          {/* Required Skills (Must Have) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Required Skills (Must Have)
            </label>
            <div className="flex flex-wrap gap-2">
              {requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200/90 text-xs px-3.5 py-1.5 rounded-full font-bold shadow-2xs"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRequiredSkill(skill)}
                    className="text-indigo-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add skill (e.g. React, PostgreSQL)..."
                value={newRequiredSkill}
                onChange={(e) => setNewRequiredSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRequiredSkill();
                  }
                }}
                className="flex-1 bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
              />
              <button
                type="button"
                onClick={() => handleAddRequiredSkill()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1 border border-slate-200/80 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Preferred Skills (Nice to Have) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Preferred Skills (Nice to Have)
            </label>
            <div className="flex flex-wrap gap-2">
              {preferredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 border border-slate-200 text-xs px-3.5 py-1.5 rounded-full font-bold shadow-2xs"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePreferredSkill(skill)}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add skill (e.g. Docker, GenAI)..."
                value={newPreferredSkill}
                onChange={(e) => setNewPreferredSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPreferredSkill();
                  }
                }}
                className="flex-1 bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
              />
              <button
                type="button"
                onClick={() => handleAddPreferredSkill()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1 border border-slate-200/80 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Education Requirement */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Education Requirement
            </label>
            <input
              type="text"
              value={educationRequirement}
              onChange={(e) => setEducationRequirement(e.target.value)}
              placeholder="e.g. Bachelor's degree in Computer Science, Statistics, Mathematics, or a related quantitative field."
              className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Role Description & Key Responsibilities */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Role Description & Key Responsibilities *
              </label>
              <button
                type="button"
                onClick={handleExtractSkillsFromDescription}
                disabled={isExtractingSkills || (!description.trim() && !title.trim())}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 hover:underline disabled:text-slate-400 disabled:no-underline"
              >
                {isExtractingSkills ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Extracting skills...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    Extract Skills from Description
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="We are seeking a detail-oriented Data Analyst to join our Engineering team. You will be responsible for interpreting complex data sets, identifying trends, and providing actionable insights that drive product development and operational efficiency..."
              className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 leading-relaxed font-normal"
            />
          </div>

          {/* Role Metadata: Title, Department & Experience */}
          <div className="pt-2 border-t border-slate-200/80 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Role Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Analyst"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  placeholder="Engineering"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Seniority Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e: any) => handleExperienceLevelChange(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="Entry Level">Entry Level / Fresher (0-2 yrs)</option>
                  <option value="Mid Level">Mid Level (2-4 yrs)</option>
                  <option value="Senior">Senior (4-7 yrs)</option>
                  <option value="Lead">Lead / Staff (7-10+ yrs)</option>
                  <option value="Executive">Executive (10+ yrs)</option>
                </select>
              </div>
            </div>

            {/* City Location & Mode of Job (Work Mode) Section */}
            <div className="p-4 bg-slate-50/90 border border-slate-200/90 rounded-2xl space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span>City Location & Mode of Job</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {workMode === 'Remote' ? (
                    <span className="inline-flex items-center gap-1 text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 font-bold">
                      <Home className="w-3 h-3" /> Fully Remote
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-700 bg-white px-2 py-0.5 rounded-full border border-slate-200 font-semibold">
                      {city} • {workMode}
                    </span>
                  )}
                </span>
              </div>

              {/* Mode of Job (Remote, Hybrid, On-site) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                  Mode of Job (Workplace Setup) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setWorkMode('Remote');
                      if (!city || city.includes('Bengaluru') || city.includes('San Francisco')) {
                        setCity('Remote / Worldwide');
                      }
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      workMode === 'Remote'
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-200'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span>Remote</span>
                    <span className="text-[10px] font-normal opacity-85">Anywhere</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWorkMode('Hybrid')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      workMode === 'Hybrid'
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-200'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <Laptop className="w-4 h-4" />
                    <span>Hybrid</span>
                    <span className="text-[10px] font-normal opacity-85">Office + Home</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWorkMode('On-site')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      workMode === 'On-site'
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-200'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>On-site</span>
                    <span className="text-[10px] font-normal opacity-85">In-Office</span>
                  </button>
                </div>
              </div>

              {/* City / Geographic Location Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  City Location / Region *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengaluru, India or San Francisco, CA"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500 font-medium"
                  />
                </div>

                {/* Popular City Shortcuts */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">Quick:</span>
                  {[
                    'Bengaluru, India',
                    'Delhi NCR, India',
                    'Hyderabad, India',
                    'Mumbai, India',
                    'Pune, India',
                    'San Francisco, CA',
                    'New York, NY',
                    'London, UK',
                    'Remote / Worldwide',
                  ].map((presetCity) => (
                    <button
                      key={presetCity}
                      type="button"
                      onClick={() => {
                        setCity(presetCity);
                        if (presetCity.includes('Remote')) setWorkMode('Remote');
                      }}
                      className="text-[10px] font-medium bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-lg transition-colors"
                    >
                      {presetCity.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Employment Type & Min Experience Requirements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200/60">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Employment Type</label>
                  <select
                    value={employmentType}
                    onChange={(e: any) => setEmploymentType(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500 font-medium"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship (Students / Freshers)</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-600">Min Experience (Years)</label>
                    {minYearsExperience === 0 && (
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">Fresher / Student Friendly</span>
                    )}
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={minYearsExperience}
                    onChange={(e) => setMinYearsExperience(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-2">
            <div>
              {initialJob && onDeleteJob && (
                <button
                  type="button"
                  onClick={() => {
                    onDeleteJob(initialJob.id);
                    onClose();
                  }}
                  className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-rose-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Profile</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-200 transition-colors"
              >
                <Check className="w-4 h-4" /> Save Job Profile
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
