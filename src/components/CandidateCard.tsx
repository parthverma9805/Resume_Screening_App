import React from 'react';
import { Candidate, CandidateStatus } from '../types';
import { 
  User, 
  MapPin, 
  Briefcase, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Trash2, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface CandidateCardProps {
  candidate: Candidate;
  isSelectedForComparison: boolean;
  onToggleSelectComparison: (candidateId: string) => void;
  onSelectCandidate: (candidate: Candidate) => void;
  onUpdateStatus: (candidateId: string, newStatus: CandidateStatus) => void;
  onDeleteCandidate: (candidateId: string) => void;
  viewMode: 'grid' | 'table';
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  isSelectedForComparison,
  onToggleSelectComparison,
  onSelectCandidate,
  onUpdateStatus,
  onDeleteCandidate,
  viewMode,
}) => {
  const result = candidate.screeningResult;
  const score = result?.overallScore ?? 0;

  const getScoreColor = (val: number) => {
    if (val >= 85) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (val >= 70) return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    if (val >= 55) return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  };

  const getRecommendationBadge = (rec: string | undefined) => {
    switch (rec) {
      case 'Strong Hire':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Interview':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'Potential Match':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  if (viewMode === 'table') {
    return (
      <tr className="hover:bg-slate-800/40 border-b border-slate-800/80 transition-colors text-xs text-slate-200 group">
        <td className="py-3 px-4">
          <input
            type="checkbox"
            checked={isSelectedForComparison}
            onChange={() => onToggleSelectComparison(candidate.id)}
            className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
        </td>

        <td className="py-3 px-4 font-semibold text-white">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold shrink-0">
              {candidate.name.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-white group-hover:text-indigo-300 transition-colors">{candidate.name}</p>
              <p className="text-[11px] text-slate-400">{result?.currentRole || candidate.email}</p>
            </div>
          </div>
        </td>

        <td className="py-3 px-4">
          <span className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-full border ${getScoreColor(score)}`}>
            {score}%
          </span>
        </td>

        <td className="py-3 px-4">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getRecommendationBadge(result?.recommendation)}`}>
            {result?.recommendation || 'Evaluated'}
          </span>
        </td>

        <td className="py-3 px-4 text-slate-300">
          {result?.yearsOfExperience ?? 0} yrs
        </td>

        <td className="py-3 px-4">
          <select
            value={candidate.status}
            onChange={(e) => onUpdateStatus(candidate.id, e.target.value as CandidateStatus)}
            className="bg-slate-900 border border-slate-700 rounded text-slate-200 px-2 py-1 text-xs focus:outline-none"
          >
            <option value="new">New</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview">Interview</option>
            <option value="rejected">Rejected</option>
          </select>
        </td>

        <td className="py-3 px-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => onSelectCandidate(candidate)}
              className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded text-xs font-semibold transition-all flex items-center gap-1"
            >
              Analysis <ChevronRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDeleteCandidate(candidate.id)}
              title="Delete candidate"
              className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 shadow-xl transition-all duration-200 flex flex-col justify-between group relative overflow-hidden">
      
      {/* Top Banner accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${score >= 85 ? 'bg-emerald-500' : score >= 70 ? 'bg-indigo-500' : score >= 55 ? 'bg-amber-500' : 'bg-rose-500'}`} />

      {/* Card Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={isSelectedForComparison}
              onChange={() => onToggleSelectComparison(candidate.id)}
              className="mt-1 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              title="Select for candidate comparison"
            />
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-2">
                {candidate.name}
              </h3>
              <p className="text-xs text-slate-400 font-medium line-clamp-1">{result?.currentRole || 'Candidate'}</p>
            </div>
          </div>

          {/* Overall Match Score Badge */}
          <div className="flex flex-col items-end shrink-0">
            <div className={`flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-xl border ${getScoreColor(score)}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{score}%</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 font-medium">Match Score</span>
          </div>
        </div>

        {/* Executive Summary Snippet */}
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
          {result?.executiveSummary || 'Screening complete.'}
        </p>

        {/* Candidate Meta Info */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-4">
          <div className="flex items-center gap-1.5 truncate">
            <Briefcase className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">{result?.yearsOfExperience ?? 0} yrs experience</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">{result?.location || 'Remote'}</span>
          </div>
        </div>

        {/* Category Scores Breakdown Progress */}
        {result?.categoryScores && (
          <div className="space-y-1.5 mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Hard Skills</span>
              <span className="text-slate-200 font-semibold">{result.categoryScores.hardSkills}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all"
                style={{ width: `${result.categoryScores.hardSkills}%` }}
              />
            </div>
          </div>
        )}

        {/* Missing Required Skills Warning (If Any) */}
        {result?.missingRequiredSkills && result.missingRequiredSkills.length > 0 && (
          <div className="mb-4 flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Lacks: {result.missingRequiredSkills.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <select
          value={candidate.status}
          onChange={(e) => onUpdateStatus(candidate.id, e.target.value as CandidateStatus)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none cursor-pointer"
        >
          <option value="new">Status: New</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="interview">Interview</option>
          <option value="rejected">Rejected</option>
        </select>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onDeleteCandidate(candidate.id)}
            title="Delete candidate"
            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onSelectCandidate(candidate)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shadow-md shadow-indigo-600/20"
          >
            View AI Analysis <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
