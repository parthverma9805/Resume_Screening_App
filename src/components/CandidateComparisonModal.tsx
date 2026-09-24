import React from 'react';
import { Candidate, JobPosting } from '../types';
import { X, Scale, CheckCircle2, XCircle } from 'lucide-react';

interface CandidateComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCandidates: Candidate[];
  activeJob: JobPosting;
}

export const CandidateComparisonModal: React.FC<CandidateComparisonModalProps> = ({
  isOpen,
  onClose,
  selectedCandidates,
  activeJob,
}) => {
  if (!isOpen || selectedCandidates.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden text-slate-800 max-h-[90vh] flex flex-col my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Side-by-Side Candidate Matrix</h3>
              <p className="text-xs text-slate-500 font-medium">Comparing {selectedCandidates.length} top candidates for <span className="text-indigo-600 font-bold">{activeJob.title}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 p-1.5 rounded-2xl hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Matrix Content */}
        <div className="p-6 overflow-x-auto overflow-y-auto flex-1 space-y-6">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-44">Criteria</th>
                {selectedCandidates.map((cand) => (
                  <th key={cand.id} className="p-4 text-center border-l border-slate-200">
                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-slate-900">{cand.name}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">{cand.screeningResult?.currentRole || 'Candidate'}</p>
                      <span className="inline-block text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
                        {cand.screeningResult?.recommendation}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-xs">
              
              {/* Overall Score Row */}
              <tr className="bg-slate-50/50">
                <td className="p-4 font-bold text-slate-900">Overall Match Score</td>
                {selectedCandidates.map((cand) => {
                  const score = cand.screeningResult?.overallScore ?? 0;
                  return (
                    <td key={cand.id} className="p-4 text-center border-l border-slate-200">
                      <span className="text-2xl font-black text-indigo-600">{score}%</span>
                    </td>
                  );
                })}
              </tr>

              {/* Years Experience */}
              <tr>
                <td className="p-4 font-semibold text-slate-700">Experience Years</td>
                {selectedCandidates.map((cand) => (
                  <td key={cand.id} className="p-4 text-center border-l border-slate-200 font-bold text-slate-800">
                    {cand.screeningResult?.yearsOfExperience ?? 0} Years
                  </td>
                ))}
              </tr>

              {/* Sub-Scores Breakdown */}
              <tr>
                <td className="p-4 font-semibold text-slate-700">Hard Skills Score</td>
                {selectedCandidates.map((cand) => (
                  <td key={cand.id} className="p-4 text-center border-l border-slate-200 font-bold text-slate-800">
                    {cand.screeningResult?.categoryScores?.hardSkills ?? 0}%
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-semibold text-slate-700">Experience Score</td>
                {selectedCandidates.map((cand) => (
                  <td key={cand.id} className="p-4 text-center border-l border-slate-200 font-bold text-slate-800">
                    {cand.screeningResult?.categoryScores?.experience ?? 0}%
                  </td>
                ))}
              </tr>

              {/* Required Skills Matrix */}
              <tr className="bg-slate-50">
                <td colSpan={selectedCandidates.length + 1} className="p-4 font-extrabold text-indigo-700 uppercase text-[11px] tracking-wider">
                  Required Skill Alignment
                </td>
              </tr>

              {(activeJob?.requiredSkills || []).map((reqSkill) => (
                <tr key={reqSkill}>
                  <td className="p-4 font-bold text-slate-800">{reqSkill}</td>
                  {selectedCandidates.map((cand) => {
                    const skillsList = cand.screeningResult?.skillMatches || (cand.screeningResult as any)?.skillsMatch || [];
                    const matchObj = skillsList.find((sm: any) => sm?.skill?.toLowerCase().includes(reqSkill.toLowerCase()));
                    const isMatched = matchObj ? matchObj.matched : false;
                    return (
                      <td key={cand.id} className="p-4 text-center border-l border-slate-200">
                        {isMatched ? (
                          <div className="flex items-center justify-center text-emerald-700 font-bold gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Matched</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center text-slate-400 font-medium gap-1">
                            <XCircle className="w-4 h-4 text-slate-400" />
                            <span>Missing</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Key Strengths */}
              <tr className="bg-slate-50/50">
                <td className="p-4 font-bold text-slate-900">Top Strengths</td>
                {selectedCandidates.map((cand) => (
                  <td key={cand.id} className="p-4 border-l border-slate-200 align-top">
                    <ul className="space-y-1.5 text-[11px] text-slate-700 font-medium list-disc list-inside">
                      {(cand.screeningResult?.keyStrengths || []).slice(0, 3).map((str, idx) => (
                        <li key={idx} className="line-clamp-2">{str}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* Red Flags / Gaps */}
              <tr>
                <td className="p-4 font-bold text-slate-900">Identified Gaps</td>
                {selectedCandidates.map((cand) => {
                  const gaps = cand.screeningResult?.redFlagsOrGaps || cand.screeningResult?.missingRequiredSkills || [];
                  return (
                    <td key={cand.id} className="p-4 border-l border-slate-200 align-top">
                      <ul className="space-y-1.5 text-[11px] text-rose-700 font-bold list-disc list-inside">
                        {gaps.length > 0 ? (
                          gaps.map((flag, idx) => (
                            <li key={idx} className="line-clamp-2">{flag}</li>
                          ))
                        ) : (
                          <li className="text-slate-400 italic">None</li>
                        )}
                      </ul>
                    </td>
                  );
                })}
              </tr>

            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-200"
          >
            Close Matrix
          </button>
        </div>

      </div>
    </div>
  );
};
