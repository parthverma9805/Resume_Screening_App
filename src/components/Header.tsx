import React from 'react';
import { JobPosting } from '../types';
import { 
  FileCheck2, 
  PlusCircle, 
  Sliders, 
  Upload, 
  Briefcase, 
  ChevronDown,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  jobs: JobPosting[];
  activeJobId: string;
  onSelectJob: (jobId: string) => void;
  onOpenNewJobModal: () => void;
  onOpenUploadModal: () => void;
  onOpenWeightsModal: () => void;
  candidateCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  jobs,
  activeJobId,
  onSelectJob,
  onOpenNewJobModal,
  onOpenUploadModal,
  onOpenWeightsModal,
  candidateCount,
}) => {
  const activeJob = jobs.find((j) => j.id === activeJobId) || jobs[0];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-indigo-500/20 shadow-lg text-white">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">Resume Screening AI</h1>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 font-medium px-2 py-0.5 rounded-full border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" /> Powered by Gemini
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">AI-powered resume parsing, scoring & candidate evaluation</p>
          </div>
        </div>

        {/* Job Selection Dropdown */}
        <div className="flex-1 max-w-md hidden md:flex items-center justify-center">
          <div className="relative w-full">
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 rounded-lg px-3 py-1.5 text-sm transition-colors">
              <Briefcase className="w-4 h-4 text-indigo-400 shrink-0" />
              <select
                value={activeJobId}
                onChange={(e) => onSelectJob(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none w-full cursor-pointer pr-6 appearance-none"
              >
                {jobs.map((job) => (
                  <option key={job.id} value={job.id} className="bg-slate-900 text-white">
                    {job.title} ({job.department})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenWeightsModal}
            title="Adjust Evaluation Weights"
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
          >
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span className="hidden lg:inline">Criteria Weights</span>
          </button>

          <button
            onClick={onOpenNewJobModal}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg transition-colors text-xs font-medium flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">New Job Posting</span>
          </button>

          <button
            onClick={onOpenUploadModal}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all font-medium text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Screen Resumes</span>
            {candidateCount > 0 && (
              <span className="bg-indigo-800/80 text-indigo-200 font-bold px-1.5 py-0.5 rounded-full text-xs">
                {candidateCount}
              </span>
            )}
          </button>
        </div>

      </div>

      {/* Mobile Job Selector Bar */}
      <div className="md:hidden px-4 py-2 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400 flex items-center gap-1">
          <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> Active Job:
        </span>
        <select
          value={activeJobId}
          onChange={(e) => onSelectJob(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-200 font-medium px-2 py-1 rounded focus:outline-none"
        >
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
};
