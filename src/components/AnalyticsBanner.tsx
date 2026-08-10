import React from 'react';
import { Candidate } from '../types';
import { Users, Award, UserCheck, TrendingUp } from 'lucide-react';

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
      
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm hover:shadow transition-shadow">
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200/80">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <span className="text-2xl font-extrabold text-[#0d2e3b] tracking-tight">{total}</span>
          <p className="text-[11px] text-slate-500 font-semibold">Total Screened</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm hover:shadow transition-shadow">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/80">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <span className="text-2xl font-extrabold text-[#0d2e3b] tracking-tight">{avgScore}%</span>
          <p className="text-[11px] text-slate-500 font-semibold">Avg Match Score</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm hover:shadow transition-shadow">
        <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 border border-sky-200/80">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <span className="text-2xl font-extrabold text-[#0d2e3b] tracking-tight">{topHires}</span>
          <p className="text-[11px] text-slate-500 font-semibold">Top Matches (&gt;85%)</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm hover:shadow transition-shadow">
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200/80">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="text-2xl font-extrabold text-[#0d2e3b] tracking-tight">{shortlisted}</span>
          <p className="text-[11px] text-slate-500 font-semibold">Shortlisted / Interview</p>
        </div>
      </div>

    </div>
  );
};
