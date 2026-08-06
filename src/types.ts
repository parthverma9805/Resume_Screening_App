export type CandidateStatus = 'new' | 'shortlisted' | 'interview' | 'rejected';

export interface SkillMatch {
  skill: string;
  matched: boolean;
  notes?: string;
}

export interface CategoryScores {
  hardSkills: number; // 0-100
  softSkills: number; // 0-100
  experience: number; // 0-100
  education: number; // 0-100
}

export interface ScreeningResult {
  candidateId: string;
  candidateName: string;
  email?: string;
  phone?: string;
  location?: string;
  currentRole?: string;
  yearsOfExperience: number;
  
  overallScore: number; // 0-100
  recommendation: 'Strong Hire' | 'Interview' | 'Potential Match' | 'Keep on File' | 'Not a Match';
  categoryScores: CategoryScores;
  
  executiveSummary: string;
  keyStrengths: string[];
  missingRequiredSkills: string[];
  skillMatches: SkillMatch[];
  redFlagsOrGaps: string[];
  
  extractedExperience: {
    title: string;
    company: string;
    duration: string;
    description: string;
  }[];
  extractedEducation: {
    degree: string;
    institution: string;
    year?: string;
  }[];
  
  tailoredInterviewQuestions: {
    question: string;
    focusArea: string;
    expectedAnswerDetails: string;
  }[];

  resumeText?: string;
  fileName?: string;
  screenedAt: string;
}

export interface Candidate {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  fileName?: string;
  resumeText: string;
  status: CandidateStatus;
  uploadedAt: string;
  screeningResult?: ScreeningResult;
  notes?: string;
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  experienceLevel: 'Entry Level' | 'Mid Level' | 'Senior' | 'Lead' | 'Executive';
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minYearsExperience: number;
  educationRequirement: string;
  createdAt: string;
}

export interface EvaluationWeights {
  hardSkills: number; // e.g. 40
  softSkills: number; // e.g. 20
  experience: number; // e.g. 30
  education: number;  // e.g. 10
}

export interface QAMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
