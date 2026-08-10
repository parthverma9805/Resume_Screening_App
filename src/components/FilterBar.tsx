import React from 'react';
import { Search, Filter, ArrowUpDown, LayoutGrid, List, Scale, Trash2 } from 'lucide-react';
import { CandidateStatus } from '../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  scoreFilter: 'all' | 'top' | 'good' | 'low';
  onScoreFilterChange: (filter: 'all' | 'top' | 'good' | 'low') => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  sortBy: 'score_desc' | 'score_asc' | 'exp_desc' | 'name_asc';
  onSortByChange: (sortBy: 'score_desc' | 'score_asc' | 'exp_desc' | 'name_asc') => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  selectedComparisonCount: number;
  onOpenComparisonModal: () => void;
  totalCandidatesCount?: number;
  onClearCandidates?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  scoreFilter,
  onScoreFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  selectedComparisonCount,
  onOpenComparisonModal,
  totalCandidatesCount,
  onClearCandidates,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by candidate name, skill, title, or email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Action Controls Group */}
        <div className="flex items-center gap-2 flex-wrap justify-between lg:justify-end">
          
          {/* Status Dropdown Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium">
            <Filter className="w-3.5 h-3.5 text-teal-600" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">Status: All</option>
              <option value="new">Status: New</option>
              <option value="shortlisted">Status: Shortlisted</option>
              <option value="interview">Status: Interview</option>
              <option value="rejected">Status: Rejected</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium">
            <ArrowUpDown className="w-3.5 h-3.5 text-teal-600" />
            <select
              value={sortBy}
              onChange={(e: any) => onSortByChange(e.target.value)}
              className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="score_desc">Highest Score</option>
              <option value="score_asc">Lowest Score</option>
              <option value="exp_desc">Most Experience</option>
              <option value="name_asc">Name (A-Z)</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-[#0d2e3b] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-[#0d2e3b] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Compare Button */}
          {selectedComparisonCount >= 2 && (
            <button
              onClick={onOpenComparisonModal}
              className="px-3 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-700/20 flex items-center gap-1.5 animate-bounce"
            >
              <Scale className="w-3.5 h-3.5" /> Compare ({selectedComparisonCount})
            </button>
          )}

          {/* Clear Candidates Button */}
          {onClearCandidates && totalCandidatesCount !== undefined && totalCandidatesCount > 0 && (
            <button
              onClick={onClearCandidates}
              className="px-3 py-1.5 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
              title="Clear all candidates for this job"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Candidates ({totalCandidatesCount})</span>
            </button>
          )}

        </div>
      </div>

      {/* Score Quick Filter Pills */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto text-xs font-medium">
        <span className="text-slate-400 text-[11px] shrink-0 font-semibold uppercase tracking-wider">Score Tier:</span>
        
        <button
          onClick={() => onScoreFilterChange('all')}
          className={`px-2.5 py-1 rounded-lg border transition-all shrink-0 ${
            scoreFilter === 'all'
              ? 'bg-[#0d2e3b] text-white border-[#0d2e3b] font-bold shadow-sm'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          All Candidates
        </button>

        <button
          onClick={() => onScoreFilterChange('top')}
          className={`px-2.5 py-1 rounded-lg border transition-all shrink-0 ${
            scoreFilter === 'top'
              ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Top Match (&gt;85%)
        </button>

        <button
          onClick={() => onScoreFilterChange('good')}
          className={`px-2.5 py-1 rounded-lg border transition-all shrink-0 ${
            scoreFilter === 'good'
              ? 'bg-teal-600 text-white border-teal-600 font-bold shadow-sm'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Good Match (70-84%)
        </button>

        <button
          onClick={() => onScoreFilterChange('low')}
          className={`px-2.5 py-1 rounded-lg border transition-all shrink-0 ${
            scoreFilter === 'low'
              ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-sm'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Lower Match (&lt;70%)
        </button>
      </div>

    </div>
  );
};
