import React, { useState, useMemo } from 'react';
import { JobPosting, Candidate, EvaluationWeights, CandidateStatus } from './types';
import { INITIAL_JOBS, INITIAL_CANDIDATES } from './data/sampleData';

import { Header } from './components/Header';
import { AnalyticsBanner } from './components/AnalyticsBanner';
import { FilterBar } from './components/FilterBar';
import { CandidateCard } from './components/CandidateCard';
import { JobPostingModal } from './components/JobPostingModal';
import { ResumeUploaderModal } from './components/ResumeUploaderModal';
import { WeightsModal } from './components/WeightsModal';
import { CandidateDetailModal } from './components/CandidateDetailModal';
import { CandidateComparisonModal } from './components/CandidateComparisonModal';

import { 
  Briefcase, 
  Upload, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  PlusCircle, 
  MapPin, 
  User, 
  Award, 
  Info 
} from 'lucide-react';

export default function App() {
  const [jobs, setJobs] = useState<JobPosting[]>(INITIAL_JOBS);
  const [activeJobId, setActiveJobId] = useState<string>('job-1');
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [weights, setWeights] = useState<EvaluationWeights>({
    hardSkills: 40,
    softSkills: 20,
    experience: 30,
    education: 10,
  });

  // UI Modals state
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isWeightsModalOpen, setIsWeightsModalOpen] = useState(false);
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<Candidate | null>(null);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  // Job Description Expand Toggle
  const [showJobDetails, setShowJobDetails] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'top' | 'good' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score_desc' | 'score_asc' | 'exp_desc' | 'name_asc'>('score_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Active Job Object
  const activeJob = useMemo(
    () => jobs.find((j) => j.id === activeJobId) || jobs[0],
    [jobs, activeJobId]
  );

  // Active Candidates filtered by Job
  const jobCandidates = useMemo(
    () => candidates.filter((c) => c.jobId === activeJob.id),
    [candidates, activeJob.id]
  );

  // Filtered & Sorted Candidates
  const processedCandidates = useMemo(() => {
    return jobCandidates
      .filter((c) => {
        const res = c.screeningResult;
        const score = res?.overallScore ?? 0;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = c.name.toLowerCase().includes(q);
          const matchRole = res?.currentRole?.toLowerCase().includes(q);
          const matchSkills = res?.skillMatches.some((sm) => sm.skill.toLowerCase().includes(q));
          const matchEmail = c.email?.toLowerCase().includes(q);
          if (!matchName && !matchRole && !matchSkills && !matchEmail) return false;
        }

        // Score Filter
        if (scoreFilter === 'top' && score < 85) return false;
        if (scoreFilter === 'good' && (score < 70 || score >= 85)) return false;
        if (scoreFilter === 'low' && score >= 70) return false;

        // Status Filter
        if (statusFilter !== 'all' && c.status !== statusFilter) return false;

        return true;
      })
      .sort((a, b) => {
        const scoreA = a.screeningResult?.overallScore ?? 0;
        const scoreB = b.screeningResult?.overallScore ?? 0;
        const expA = a.screeningResult?.yearsOfExperience ?? 0;
        const expB = b.screeningResult?.yearsOfExperience ?? 0;

        if (sortBy === 'score_desc') return scoreB - scoreA;
        if (sortBy === 'score_asc') return scoreA - scoreB;
        if (sortBy === 'exp_desc') return expB - expA;
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [jobCandidates, searchQuery, scoreFilter, statusFilter, sortBy]);

  // Comparison Candidates Selection Toggle
  const handleToggleSelectComparison = (candidateId: string) => {
    setComparisonIds((prev) =>
      prev.includes(candidateId) ? prev.filter((id) => id !== candidateId) : [...prev, candidateId]
    );
  };

  // Add New Candidates from Screening
  const handleCandidatesAdded = (newCandidates: Candidate[]) => {
    setCandidates((prev) => [...newCandidates, ...prev]);
  };

  // Save New Job
  const handleSaveJob = (newJob: JobPosting) => {
    setJobs((prev) => [newJob, ...prev]);
    setActiveJobId(newJob.id);
  };

  // Update Status
  const handleUpdateStatus = (candidateId: string, newStatus: CandidateStatus) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status: newStatus } : c))
    );
  };

  // Delete Candidate
  const handleDeleteCandidate = (candidateId: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
    setComparisonIds((prev) => prev.filter((id) => id !== candidateId));
  };

  // Selected Comparison Candidates
  const selectedComparisonCandidates = useMemo(
    () => candidates.filter((c) => comparisonIds.includes(c.id)),
    [candidates, comparisonIds]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* App Header */}
      <Header
        jobs={jobs}
        activeJobId={activeJob.id}
        onSelectJob={(id) => {
          setActiveJobId(id);
          setComparisonIds([]);
        }}
        onOpenNewJobModal={() => setIsNewJobModalOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenWeightsModal={() => setIsWeightsModalOpen(true)}
        candidateCount={jobCandidates.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Active Job Posting Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-indigo-500/20 text-indigo-300 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                  {activeJob.department}
                </span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
                  {activeJob.employmentType}
                </span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
                  Min {activeJob.minYearsExperience} Yrs Experience
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white">{activeJob.title}</h2>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {activeJob.location}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowJobDetails(!showJobDetails)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>{showJobDetails ? 'Hide Job Details' : 'View Job Criteria'}</span>
                {showJobDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Screen Resumes</span>
              </button>
            </div>

          </div>

          {/* Expanded Job Description & Criteria Details */}
          {showJobDetails && (
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 animate-in fade-in duration-150 text-xs">
              <div>
                <span className="font-semibold text-slate-300 block mb-1">Required Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeJob.requiredSkills.map((s) => (
                    <span key={s} className="bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 px-2.5 py-0.5 rounded-md font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {activeJob.preferredSkills.length > 0 && (
                <div>
                  <span className="font-semibold text-slate-300 block mb-1">Preferred Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeJob.preferredSkills.map((s) => (
                      <span key={s} className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded-md font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="font-semibold text-slate-300 block mb-1">Role Summary:</span>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {activeJob.description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Analytics High-Level Metrics */}
        <AnalyticsBanner candidates={jobCandidates} />

        {/* Filters, Search & View Controls */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          scoreFilter={scoreFilter}
          onScoreFilterChange={setScoreFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedComparisonCount={comparisonIds.length}
          onOpenComparisonModal={() => setIsComparisonModalOpen(true)}
        />

        {/* Candidates List / Grid */}
        {processedCandidates.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {processedCandidates.map((cand) => (
                <CandidateCard
                  key={cand.id}
                  candidate={cand}
                  isSelectedForComparison={comparisonIds.includes(cand.id)}
                  onToggleSelectComparison={handleToggleSelectComparison}
                  onSelectCandidate={setSelectedCandidateDetail}
                  onUpdateStatus={handleUpdateStatus}
                  onDeleteCandidate={handleDeleteCandidate}
                  viewMode="grid"
                />
              ))}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-xs text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4 w-10">Select</th>
                    <th className="py-3 px-4">Candidate Name</th>
                    <th className="py-3 px-4">Match Score</th>
                    <th className="py-3 px-4">AI Rec</th>
                    <th className="py-3 px-4">Experience</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {processedCandidates.map((cand) => (
                    <CandidateCard
                      key={cand.id}
                      candidate={cand}
                      isSelectedForComparison={comparisonIds.includes(cand.id)}
                      onToggleSelectComparison={handleToggleSelectComparison}
                      onSelectCandidate={setSelectedCandidateDetail}
                      onUpdateStatus={handleUpdateStatus}
                      onDeleteCandidate={handleDeleteCandidate}
                      viewMode="table"
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No candidates found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Upload candidate resumes or adjust your active search filters to screen profiles against this job description.
              </p>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20"
            >
              Upload or Import Candidates
            </button>
          </div>
        )}

      </main>

      {/* Modals */}
      <JobPostingModal
        isOpen={isNewJobModalOpen}
        onClose={() => setIsNewJobModalOpen(false)}
        onSaveJob={handleSaveJob}
      />

      <ResumeUploaderModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        activeJob={activeJob}
        weights={weights}
        onCandidatesAdded={handleCandidatesAdded}
      />

      <WeightsModal
        isOpen={isWeightsModalOpen}
        onClose={() => setIsWeightsModalOpen(false)}
        weights={weights}
        onSaveWeights={setWeights}
      />

      <CandidateDetailModal
        candidate={selectedCandidateDetail}
        activeJob={activeJob}
        onClose={() => setSelectedCandidateDetail(null)}
      />

      <CandidateComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        selectedCandidates={selectedComparisonCandidates}
        activeJob={activeJob}
      />

    </div>
  );
}
