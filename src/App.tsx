import React, { useState, useMemo, useEffect } from 'react';
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
  Info,
  Trash2,
  Edit3,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  // Load saved job profiles from localStorage
  const [jobs, setJobs] = useState<JobPosting[]>(() => {
    try {
      const saved = localStorage.getItem('ai_screener_jobs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {
      console.error('Failed to load saved job profiles:', err);
    }
    return INITIAL_JOBS;
  });

  const [activeJobId, setActiveJobId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('ai_screener_active_job_id');
      if (saved) return saved;
    } catch (e) {}
    return jobs[0]?.id || 'job-1';
  });

  // Load saved candidates from localStorage
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    try {
      const saved = localStorage.getItem('ai_screener_candidates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out pre-given mock candidates if present
          return parsed.filter((c: Candidate) => !['cand-1', 'cand-2', 'cand-3'].includes(c.id));
        }
      }
    } catch (err) {
      console.error('Failed to load saved candidates:', err);
    }
    return [];
  });

  const [weights, setWeights] = useState<EvaluationWeights>({
    hardSkills: 40,
    softSkills: 20,
    experience: 30,
    education: 10,
  });

  // Save jobs to localStorage whenever jobs state updates
  useEffect(() => {
    try {
      localStorage.setItem('ai_screener_jobs', JSON.stringify(jobs));
    } catch (err) {
      console.error('Failed to save jobs to storage:', err);
    }
  }, [jobs]);

  // Save activeJobId to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ai_screener_active_job_id', activeJobId);
    } catch (err) {
      console.error('Failed to save activeJobId:', err);
    }
  }, [activeJobId]);

  // Save candidates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ai_screener_candidates', JSON.stringify(candidates));
    } catch (err) {
      console.error('Failed to save candidates:', err);
    }
  }, [candidates]);

  // UI Modals state
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isWeightsModalOpen, setIsWeightsModalOpen] = useState(false);
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<Candidate | null>(null);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

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

  // Save / Update Job Profile
  const handleSaveJob = (jobToSave: JobPosting) => {
    setJobs((prev) => {
      const exists = prev.some((j) => j.id === jobToSave.id);
      if (exists) {
        return prev.map((j) => (j.id === jobToSave.id ? jobToSave : j));
      } else {
        return [jobToSave, ...prev];
      }
    });
    setActiveJobId(jobToSave.id);
    setEditingJob(null);
  };

  // Delete Job Profile
  const handleDeleteJob = (jobId: string) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    const title = targetJob?.title || 'this job profile';

    setConfirmModal({
      isOpen: true,
      title: 'Delete Job Profile',
      message: `Are you sure you want to delete "${title}"? All candidate evaluations for this job will also be removed.`,
      onConfirm: () => {
        const remaining = jobs.filter((j) => j.id !== jobId);

        // Clean up candidates for deleted job
        setCandidates((prev) => prev.filter((c) => c.jobId !== jobId));
        setComparisonIds((prev) =>
          prev.filter((id) => {
            const cand = candidates.find((c) => c.id === id);
            return cand && cand.jobId !== jobId;
          })
        );

        if (remaining.length === 0) {
          // If all job profiles were deleted, auto-create a clean new job profile template
          const defaultJob: JobPosting = {
            id: `job-${Date.now()}`,
            title: 'Software Engineer',
            department: 'Engineering',
            location: 'Remote',
            employmentType: 'Full-time',
            experienceLevel: 'Senior',
            minYearsExperience: 3,
            educationRequirement: "Bachelor's degree in Computer Science or related field",
            description: 'Define key responsibilities, requirements, and tech stack for this role.',
            requiredSkills: ['React', 'TypeScript', 'Node.js'],
            preferredSkills: ['Cloud Architecture', 'GraphQL'],
            createdAt: new Date().toISOString(),
          };
          setJobs([defaultJob]);
          setActiveJobId(defaultJob.id);
        } else {
          setJobs(remaining);
          if (activeJobId === jobId) {
            setActiveJobId(remaining[0].id);
          }
        }
        setEditingJob(null);
        setIsNewJobModalOpen(false);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
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

  // Clear All Candidates for active job
  const handleClearCandidates = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Clear All Candidates',
      message: `Are you sure you want to clear all candidates for "${activeJob.title}"?`,
      onConfirm: () => {
        setCandidates((prev) => prev.filter((c) => c.jobId !== activeJob.id));
        setComparisonIds([]);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Selected Comparison Candidates
  const selectedComparisonCandidates = useMemo(
    () => candidates.filter((c) => comparisonIds.includes(c.id)),
    [candidates, comparisonIds]
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col selection:bg-teal-500 selection:text-white">
      
      {/* App Header */}
      <Header
        jobs={jobs}
        activeJobId={activeJob.id}
        onSelectJob={(id) => {
          setActiveJobId(id);
          setComparisonIds([]);
        }}
        onDeleteJob={handleDeleteJob}
        onOpenNewJobModal={() => {
          setEditingJob(null);
          setIsNewJobModalOpen(true);
        }}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenWeightsModal={() => setIsWeightsModalOpen(true)}
        candidateCount={jobCandidates.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Active Job Posting Banner */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-teal-50 text-teal-700 font-bold px-2.5 py-0.5 rounded-full border border-teal-200/80">
                  {activeJob.department}
                </span>
                <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2.5 py-0.5 rounded-full border border-slate-200">
                  {activeJob.employmentType}
                </span>
                <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2.5 py-0.5 rounded-full border border-slate-200">
                  Min {activeJob.minYearsExperience} Yrs Experience
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-[#0d2e3b]">{activeJob.title}</h2>
              <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-teal-600" /> {activeJob.location}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={() => setShowJobDetails(!showJobDetails)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap"
              >
                <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>{showJobDetails ? 'Hide Job Details' : 'View Job Criteria'}</span>
                {showJobDetails ? <ChevronUp className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
              </button>

              <button
                onClick={() => {
                  setEditingJob(activeJob);
                  setIsNewJobModalOpen(true);
                }}
                title="Edit Job Profile"
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap"
              >
                <Edit3 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="hidden sm:inline">Edit Role</span>
              </button>

              <button
                onClick={() => handleDeleteJob(activeJob.id)}
                title="Delete Job Profile"
                className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="hidden sm:inline">Delete Job</span>
              </button>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-3.5 sm:px-4 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-700/20 transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap"
              >
                <Upload className="w-3.5 h-3.5 shrink-0" />
                <span>Screen Resumes</span>
              </button>
            </div>

          </div>

          {/* Expanded Job Description & Criteria Details */}
          {showJobDetails && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-in fade-in duration-150 text-xs">
              <div>
                <span className="font-semibold text-slate-700 block mb-1">Required Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeJob.requiredSkills.map((s) => (
                    <span key={s} className="bg-teal-50 text-teal-800 border border-teal-200/80 px-2.5 py-0.5 rounded-md font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {activeJob.preferredSkills.length > 0 && (
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Preferred Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeJob.preferredSkills.map((s) => (
                      <span key={s} className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-md font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="font-semibold text-slate-700 block mb-1">Role Summary:</span>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-200/80">
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
          totalCandidatesCount={jobCandidates.length}
          onClearCandidates={handleClearCandidates}
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
            <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase tracking-wider font-semibold">
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
          <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-100">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0d2e3b]">No candidates found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Upload candidate resumes or adjust your active search filters to screen profiles against this job description.
              </p>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-700/20"
            >
              Upload or Import Candidates
            </button>
          </div>
        )}

      </main>

      {/* Modals */}
      <JobPostingModal
        isOpen={isNewJobModalOpen}
        onClose={() => {
          setIsNewJobModalOpen(false);
          setEditingJob(null);
        }}
        onSaveJob={handleSaveJob}
        initialJob={editingJob}
        onDeleteJob={handleDeleteJob}
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

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{confirmModal.title}</h3>
                <p className="text-xs text-slate-500">Action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{confirmModal.message}</p>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmModal.onConfirm()}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
