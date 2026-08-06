import React from 'react';
import { Search, Filter, ArrowUpDown, LayoutGrid, List, Scale } from 'lucide-react';
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
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by candidate name, skill, title, or email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Action Controls Group */}
        <div className="flex items-center gap-2 flex-wrap justify-between lg:justify-end">
          
          {/* Status Dropdown Filter */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-slate-900">Status: All</option>
              <option value="new" className="bg-slate-900">Status: New</option>
              <option value="shortlisted" className="bg-slate-900">Status: Shortlisted</option>
              <option value="interview" className="bg-slate-900">Status: Interview</option>
              <option value="rejected" className="bg-slate-900">Status: Rejected</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={sortBy}
              onChange={(e: any) => onSortByChange(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer pr-1"
            >
              <option value="score_desc" className="bg-slate-900">Highest Score</option>
              <option value="score_asc" className="bg-slate-900">Lowest Score</option>
              <option value="exp_desc" className="bg-slate-900">Most Experience</option>
              <option value="name_asc" className="bg-slate-900">Name (A-Z)</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
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
              className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 animate-bounce"
            >
              <Scale className="w-3.5 h-3.5" /> Compare ({selectedComparisonCount})
            </button>
          )}

        </div>
      </div>

      {/* Score Quick Filter Pills */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 overflow-x-auto text-xs font-medium">
        <span className="text-slate-400 text-[11px] shrink-0 font-semibold uppercase tracking-wider">Score Tier:</span>
        
        <button
          onClick={() => onScoreFilterChange('all')}
          className={`px-2.5 py-1 rounded-lg border transition-all shrink-0 ${
            scoreFilter === 'all'
              ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 font-bold'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          All Candidates
        </button>

        <button
          onClick={() => onScoreFilterChange('top')}
          className={`px-2.5 py-1 rounded-lg border transition-all shrink-0 ${
            scoreFilter === 'top'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          Top Match (&gt;85%)
        </button>

        <button
          onClick={() => onScoreFilterChange('good')}
          className={`px-2.5 py-1 rounded-lg border transition-all shrink-0 ${
            scoreFilter === 'good'
              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-bold'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          Good Match (70-84%)
        </button>

        <button
          onClick={() => onScoreFilterChange('low')}
          className={`px-2.5 py-1 rounded-lg border transition-all shrink-0 ${
            scoreFilter === 'low'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          Lower Match (&lt;70%)
        </button>
      </div>

    </div>
  );
};
