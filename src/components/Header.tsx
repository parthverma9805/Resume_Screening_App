import React from 'react';
import { JobPosting } from '../types';
import { StarlightLogo } from './StarlightLogo';
import { 
  PlusCircle, 
  Sliders, 
  Upload, 
  Briefcase, 
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  jobs: JobPosting[];
  activeJobId: string;
  onSelectJob: (jobId: string) => void;
  onDeleteJob: (jobId: string) => void;
  onOpenNewJobModal: () => void;
  onOpenUploadModal: () => void;
  onOpenWeightsModal: () => void;
  candidateCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  jobs,
  activeJobId,
  onSelectJob,
  onDeleteJob,
  onOpenNewJobModal,
  onOpenUploadModal,
  onOpenWeightsModal,
  candidateCount,
}) => {
  return (
    <header className="bg-[#0b1f2b] border-b border-[#183a4d] text-slate-100 sticky top-0 z-30 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#092b37] border border-[#1a4a5c] flex items-center justify-center shadow-emerald-900/30 shadow-md p-1 sm:p-1.5 shrink-0">
            <StarlightLogo className="w-full h-full" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2 leading-tight">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base md:text-lg font-extrabold tracking-tight text-white shrink-0">
                Starlight
              </h1>
            </div>
            <span className="text-teal-400 font-semibold text-[10px] sm:text-xs md:text-sm tracking-tight whitespace-nowrap">
              Resume Screening AI
            </span>
          </div>
        </div>

        {/* Job Selection Dropdown */}
        <div className="flex-1 max-w-md hidden md:flex items-center justify-center">
          <div className="relative w-full flex items-center gap-1.5">
            <div className="flex items-center gap-2 bg-[#0f2d3d]/90 border border-[#1b4359] hover:border-[#265773] rounded-lg px-3 py-1.5 text-sm transition-colors flex-1">
              <Briefcase className="w-4 h-4 text-teal-400 shrink-0" />
              <select
                value={activeJobId}
                onChange={(e) => onSelectJob(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none w-full cursor-pointer pr-6 appearance-none"
              >
                {jobs.map((job) => (
                  <option key={job.id} value={job.id} className="bg-[#0b1f2b] text-white">
                    {job.title} ({job.department})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          <button
            onClick={onOpenWeightsModal}
            title="Adjust Evaluation Weights"
            className="p-1.5 sm:p-2 text-slate-300 hover:text-white bg-[#0f2d3d] hover:bg-[#16384a] border border-[#1b4359] rounded-lg transition-colors flex items-center gap-1 text-xs font-medium shrink-0"
          >
            <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-400 shrink-0" />
            <span className="hidden lg:inline whitespace-nowrap">Criteria Weights</span>
          </button>

          <button
            onClick={onOpenNewJobModal}
            title="Create New Job Posting"
            className="p-1.5 sm:px-3 sm:py-2 bg-[#0f2d3d] hover:bg-[#16384a] border border-[#1b4359] text-slate-200 rounded-lg transition-colors text-xs font-medium flex items-center gap-1.5 shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-400 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">New Job</span>
          </button>

          <button
            onClick={onOpenUploadModal}
            className="px-2 sm:px-3.5 py-1.5 sm:py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-lg transition-all font-bold text-[11px] sm:text-xs md:text-sm flex items-center gap-1 sm:gap-2 shadow-md shadow-teal-900/40 active:scale-95 border border-teal-400/20 shrink-0"
          >
            <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="whitespace-nowrap font-bold">Screen Resumes</span>
            {candidateCount > 0 && (
              <span className="bg-emerald-950/80 text-emerald-200 font-bold px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs border border-emerald-500/30 shrink-0">
                {candidateCount}
              </span>
            )}
          </button>
        </div>

      </div>

      {/* Mobile Job Selector Bar */}
      <div className="md:hidden px-4 py-2 bg-[#081721] border-t border-[#143242] flex items-center justify-between text-xs gap-2">
        <span className="text-slate-400 flex items-center gap-1 shrink-0">
          <Briefcase className="w-3.5 h-3.5 text-teal-400" /> Active Job:
        </span>
        <div className="flex items-center gap-1 flex-1 justify-end">
          <select
            value={activeJobId}
            onChange={(e) => onSelectJob(e.target.value)}
            className="bg-[#0f2d3d] border border-[#1b4359] text-slate-200 font-medium px-2 py-1 rounded focus:outline-none max-w-[180px] truncate"
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};
