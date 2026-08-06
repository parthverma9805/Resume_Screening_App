import React from 'react';
import { Candidate } from '../types';
import { Users, Award, UserCheck, TrendingUp, Sparkles } from 'lucide-react';

interface AnalyticsBannerProps {
  candidates: Candidate[];
}

export const AnalyticsBanner: React.FC<AnalyticsBannerProps> = ({ candidates }) => {
  const total = candidates.length;
  if (total === 0) return null;

  const totalScore = candidates.reduce(
    (acc, c) => acc + (c.screeningResult?.overallScore || 0),
    0
  );
  const avgScore = Math.round(totalScore / total);

  const topHires = candidates.filter(
    (c) => (c.screeningResult?.overallScore || 0) >= 85
  ).length;

  const shortlisted = candidates.filter((c) => c.status === 'shortlisted' || c.status === 'interview').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <span className="text-2xl font-bold text-white tracking-tight">{total}</span>
          <p className="text-[11px] text-slate-400 font-medium">Total Screened</p>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <span className="text-2xl font-bold text-white tracking-tight">{avgScore}%</span>
          <p className="text-[11px] text-slate-400 font-medium">Avg Match Score</p>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <span className="text-2xl font-bold text-white tracking-tight">{topHires}</span>
          <p className="text-[11px] text-slate-400 font-medium">Top Matches (&gt;85%)</p>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="text-2xl font-bold text-white tracking-tight">{shortlisted}</span>
          <p className="text-[11px] text-slate-400 font-medium">Shortlisted / Interview</p>
        </div>
      </div>

    </div>
  );
};
