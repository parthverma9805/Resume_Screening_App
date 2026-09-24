import React from 'react';
import { Candidate, CandidateStatus } from '../types';
import { generateCandidatePdf } from '../utils/pdfGenerator';
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
  ChevronRight,
  Download
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
    if (val >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold';
    if (val >= 70) return 'bg-teal-50 text-teal-700 border-teal-300 font-bold';
    if (val >= 55) return 'bg-amber-50 text-amber-700 border-amber-300 font-bold';
    return 'bg-rose-50 text-rose-700 border-rose-300 font-bold';
  };

  const getRecommendationBadge = (rec: string | undefined) => {
    switch (rec) {
      case 'Strong Hire':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Interview':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Potential Match':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  if (viewMode === 'table') {
    return (
      <tr className="hover:bg-slate-50 border-b border-slate-200 transition-colors text-xs text-slate-700 group">
        <td className="py-3 px-4">
          <input
            type="checkbox"
            checked={isSelectedForComparison}
            onChange={() => onToggleSelectComparison(candidate.id)}
            className="rounded border-slate-300 bg-white text-teal-600 focus:ring-teal-500 cursor-pointer"
          />
        </td>

        <td className="py-3 px-4 font-semibold text-slate-900">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#0d2e3b] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
              {candidate.name.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-[#0d2e3b] group-hover:text-teal-700 transition-colors">{candidate.name}</p>
              <p className="text-[11px] text-slate-500">{result?.currentRole || candidate.email}</p>
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

        <td className="py-3 px-4 text-slate-600">
          {(result?.yearsOfExperience ?? 0) === 0 ? (
            <span className="inline-flex items-center gap-1 font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full text-[11px] border border-teal-200">
              🎓 Fresher (0 yrs)
            </span>
          ) : (
            `${result?.yearsOfExperience} yrs`
          )}
        </td>

        <td className="py-3 px-4">
          <select
            value={candidate.status}
            onChange={(e) => onUpdateStatus(candidate.id, e.target.value as CandidateStatus)}
            className="bg-white border border-slate-200 rounded text-slate-700 px-2 py-1 text-xs focus:outline-none"
          >
            <option value="new">New</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview">Interview</option>
            <option value="rejected">Rejected</option>
          </select>
        </td>

        <td className="py-3 px-4 text-right">
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => generateCandidatePdf(candidate)}
              title="Download Resume PDF"
              className="p-1 text-slate-400 hover:text-teal-700 hover:bg-slate-100 rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSelectCandidate(candidate)}
              className="px-2.5 py-1 bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white border border-teal-200 rounded text-xs font-semibold transition-all flex items-center gap-1"
            >
              Analysis <ChevronRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDeleteCandidate(candidate.id)}
              title="Delete candidate"
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 hover:border-teal-500/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative overflow-hidden">
      
      {/* Top Banner accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${score >= 85 ? 'bg-emerald-500' : score >= 70 ? 'bg-teal-500' : score >= 55 ? 'bg-amber-500' : 'bg-rose-500'}`} />

      {/* Card Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={isSelectedForComparison}
              onChange={() => onToggleSelectComparison(candidate.id)}
              className="mt-1 rounded border-slate-300 bg-white text-teal-600 focus:ring-teal-500 cursor-pointer"
              title="Select for candidate comparison"
            />
            <div>
              <h3 className="text-base font-bold text-[#0d2e3b] group-hover:text-teal-700 transition-colors flex items-center gap-2">
                {candidate.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium line-clamp-1">{result?.currentRole || 'Candidate'}</p>
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
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
          {result?.executiveSummary || 'Screening complete.'}
        </p>

        {/* Candidate Meta Info */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-4 font-medium">
          <div className="flex items-center gap-1.5 truncate">
            <Briefcase className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate">
              {(result?.yearsOfExperience ?? 0) === 0
                ? '🎓 Fresher (0 yrs)'
                : `${result?.yearsOfExperience} yr${(result?.yearsOfExperience ?? 0) > 1 ? 's' : ''} exp`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate">{result?.location || 'Remote'}</span>
          </div>
        </div>

        {/* Category Scores Breakdown Progress */}
        {result?.categoryScores && (
          <div className="space-y-1.5 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Hard Skills</span>
              <span className="text-slate-800 font-bold">{result.categoryScores.hardSkills}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-teal-600 h-full rounded-full transition-all"
                style={{ width: `${result.categoryScores.hardSkills}%` }}
              />
            </div>
          </div>
        )}

        {/* Missing Required Skills Warning (If Any) */}
        {result?.missingRequiredSkills && result.missingRequiredSkills.length > 0 && (
          <div className="mb-4 flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate font-medium">Lacks: {result.missingRequiredSkills.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <select
          value={candidate.status}
          onChange={(e) => onUpdateStatus(candidate.id, e.target.value as CandidateStatus)}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-1.5 focus:outline-none cursor-pointer font-medium"
        >
          <option value="new">Status: New</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="interview">Interview</option>
          <option value="rejected">Rejected</option>
        </select>

        <div className="flex items-center gap-1">
          <button
            onClick={() => generateCandidatePdf(candidate)}
            title="Download Resume PDF"
            className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors border border-transparent"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDeleteCandidate(candidate.id)}
            title="Delete candidate"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onSelectCandidate(candidate)}
            className="px-3 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shadow-sm shadow-teal-700/20 ml-1"
          >
            View AI Analysis <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
