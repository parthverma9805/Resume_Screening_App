import React, { useState } from 'react';
import { JobPosting } from '../types';
import { X, Sparkles, Plus, Trash2, Briefcase, Check, Loader2 } from 'lucide-react';

interface JobPostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveJob: (job: JobPosting) => void;
}

export const JobPostingModal: React.FC<JobPostingModalProps> = ({
  isOpen,
  onClose,
  onSaveJob,
}) => {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('San Francisco, CA (Hybrid)');
  const [employmentType, setEmploymentType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Remote'>('Full-time');
  const [experienceLevel, setExperienceLevel] = useState<'Entry Level' | 'Mid Level' | 'Senior' | 'Lead' | 'Executive'>('Senior');
  const [minYearsExperience, setMinYearsExperience] = useState<number>(3);
  const [educationRequirement, setEducationRequirement] = useState("Bachelor's degree in Computer Science or related field");
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['React', 'TypeScript', 'Node.js']);
  const [preferredSkills, setPreferredSkills] = useState<string[]>(['GraphQL', 'Cloud Architecture']);
  
  const [newRequiredSkill, setNewRequiredSkill] = useState('');
  const [newPreferredSkill, setNewPreferredSkill] = useState('');
  
  // AI Generator state
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPromptTitle, setAiPromptTitle] = useState('');

  if (!isOpen) return null;

  const handleAddRequiredSkill = () => {
    if (newRequiredSkill.trim() && !requiredSkills.includes(newRequiredSkill.trim())) {
      setRequiredSkills([...requiredSkills, newRequiredSkill.trim()]);
      setNewRequiredSkill('');
    }
  };

  const handleRemoveRequiredSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skill));
  };

  const handleAddPreferredSkill = () => {
    if (newPreferredSkill.trim() && !preferredSkills.includes(newPreferredSkill.trim())) {
      setPreferredSkills([...preferredSkills, newPreferredSkill.trim()]);
      setNewPreferredSkill('');
    }
  };

  const handleRemovePreferredSkill = (skill: string) => {
    setPreferredSkills(preferredSkills.filter((s) => s !== skill));
  };

  const handleGenerateAIJob = async () => {
    if (!aiPromptTitle.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: aiPromptTitle,
          department,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTitle(data.title || aiPromptTitle);
        if (data.department) setDepartment(data.department);
        if (data.location) setLocation(data.location);
        if (data.employmentType) setEmploymentType(data.employmentType);
        if (data.experienceLevel) setExperienceLevel(data.experienceLevel);
        if (data.minYearsExperience) setMinYearsExperience(data.minYearsExperience);
        if (data.educationRequirement) setEducationRequirement(data.educationRequirement);
        if (data.description) setDescription(data.description);
        if (data.requiredSkills && Array.isArray(data.requiredSkills)) setRequiredSkills(data.requiredSkills);
        if (data.preferredSkills && Array.isArray(data.preferredSkills)) setPreferredSkills(data.preferredSkills);
      }
    } catch (err) {
      console.error('Failed to generate JD:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newJob: JobPosting = {
      id: `job-${Date.now()}`,
      title: title.trim(),
      department: department.trim() || 'General',
      location: location.trim() || 'Remote',
      employmentType,
      experienceLevel,
      minYearsExperience,
      educationRequirement,
      description: description.trim(),
      requiredSkills,
      preferredSkills,
      createdAt: new Date().toISOString(),
    };

    onSaveJob(newJob);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-800 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Create Job Posting</h3>
              <p className="text-xs text-slate-500 font-medium">Define role criteria for AI resume evaluation</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 p-1.5 rounded-2xl hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Quick Fill Section */}
        <div className="px-6 pt-5 pb-2">
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI Job Generator</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. Lead Devops Engineer, Senior UI Designer..."
                value={aiPromptTitle}
                onChange={(e) => setAiPromptTitle(e.target.value)}
                className="flex-1 bg-white border border-indigo-200 rounded-2xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
              />
              <button
                type="button"
                onClick={handleGenerateAIJob}
                disabled={isGenerating || !aiPromptTitle.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-2xl transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Auto-Fill
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Job Title *</label>
              <input
                type="text"
                required
                placeholder="Senior Full Stack Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                placeholder="Engineering, Product, Marketing..."
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Employment Type</label>
              <select
                value={employmentType}
                onChange={(e: any) => setEmploymentType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e: any) => setExperienceLevel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Min Experience (Years)</label>
              <input
                type="number"
                min="0"
                max="20"
                value={minYearsExperience}
                onChange={(e) => setMinYearsExperience(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Location & Setup</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA (Hybrid) or Remote"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Required Skills Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Required Skills (Must Have)</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs px-3 py-1 rounded-full font-bold"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveRequiredSkill(skill)}
                    className="hover:text-rose-600 ml-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
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
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none font-medium"
              />
              <button
                type="button"
                onClick={handleAddRequiredSkill}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Preferred Skills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Skills (Nice to Have)</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {preferredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 text-xs px-3 py-1 rounded-full font-bold"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemovePreferredSkill(skill)}
                    className="hover:text-rose-600 ml-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
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
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none font-medium"
              />
              <button
                type="button"
                onClick={handleAddPreferredSkill}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Education Requirement</label>
            <input
              type="text"
              value={educationRequirement}
              onChange={(e) => setEducationRequirement(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Role Description & Key Responsibilities *</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe main responsibilities, team goals, and expectations..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 leading-relaxed font-medium"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-200"
            >
              <Check className="w-4 h-4" /> Save Job Posting
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
