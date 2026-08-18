export type JobStatus = 'Active' | 'Closed' | 'Draft';
export type CandidateStage = 'Applied' | 'Screening' | 'Interview' | 'Offered' | 'Hired' | 'Rejected';

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-Time' | 'Part-Time' | 'Remote' | 'Hybrid';
  openings: number;
  applicantsCount: number;
  experienceRange: string;
  salaryRange: string;
  status: JobStatus;
  postedDate: string;
  description: string;
}

export interface Candidate {
  id: string;
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  experienceYears: number;
  currentCompany?: string;
  appliedDate: string;
  stage: CandidateStage;
  rating: number; // 1 to 5
  notes?: string;
  resumeUrl?: string;
}
