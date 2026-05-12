/**
 * Shared types for the ATS / Quoreit CRM monorepo.
 *
 * These types are consumed by both the backend (Express + Mongoose) and the
 * frontend (Next.js) via `import type { ... } from '@ats-saas/shared'`.
 *
 * All imports of this package are type-only, so the runtime cost is zero.
 * Types are intentionally permissive (optional fields, index signatures on
 * complex objects) so they can describe values flowing across the API
 * boundary without forcing every call site to handle every field.
 */

// ============================================================================
// Generic API envelopes
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// Auth / Users
// ============================================================================

export type UserRole = 'admin' | 'recruiter' | 'candidate';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  company?: string;
  bio?: string;
  introVideoUrl?: string;
  phoneNumbers?: string[];
  phoneConnected?: boolean;
  googleConnected?: boolean;
  googleEmail?: string;
  gmailConnected?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface JwtPayload {
  userId: string;
  email: string;
  name?: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ============================================================================
// Cloudinary / Files
// ============================================================================

export interface CloudinaryFile {
  url: string;
  publicId: string;
  secureUrl: string;
  resourceType?: 'image' | 'raw' | 'video' | string;
  format?: string;
  bytes?: number;
  version?: number;
}

// ============================================================================
// Jobs
// ============================================================================

export type JobStatus = 'draft' | 'open' | 'published' | 'closed';

export interface JobIdealCandidate {
  seniority?: string;
  experience?: string;
  education?: string;
}

export interface JobStats {
  totalCandidates: number;
  interviewing: number;
  openings: number;
}

export interface JobCustomField {
  name: string;
  value: string;
}

export interface JobPersonalQuestion {
  question: string;
  required: boolean;
}

export interface JobRecruiterAssignment {
  recruiterId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'requested';
  acceptedAt?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  skills: string[];
  salary: string;
  location: string;
  requirements: string[];
  customFields?: JobCustomField[];
  recruiterIds: string[];
  recruiterAssignments?: JobRecruiterAssignment[];
  status: JobStatus;
  benefits: string[];
  personalQuestions?: JobPersonalQuestion[];
  workplaceType?: string;
  roleType?: string;
  companyName?: string;
  companyLogo?: string;
  reward?: string;
  idealCandidate?: JobIdealCandidate;
  stats?: JobStats;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface JobListItem extends Job {}

export interface ListJobsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: JobStatus;
  recruiterId?: string;
  [key: string]: unknown;
}

export interface Applicant {
  id: string;
  jobId: string;
  candidateId?: string;
  name: string;
  email: string;
  status: string;
  appliedAt: string;
  [key: string]: unknown;
}

// ============================================================================
// Applications
// ============================================================================

export type ApplicationStage =
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offered'
  | 'hired'
  | 'rejected';

export interface Application {
  id: string;
  jobId: string;
  candidateId?: string | null;
  crmCandidateId?: string | null;
  candidate?: {
    id?: string;
    name?: string;
    email?: string;
    [key: string]: unknown;
  } | null;
  resumeUrl?: string | null;
  stage: ApplicationStage;
  status?: ApplicationStage;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

// ============================================================================
// Candidates (CRM)
// ============================================================================

export interface CandidateExperience {
  title?: string;
  company: string;
  role?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface CandidateEducation {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  phone: string;
  headline: string;
  summary: string;
  resumePath: string | null;
  resumePublicId?: string | null;
  skills: string[];
  experience: CandidateExperience[];
  education: CandidateEducation[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCandidateProfilePayload {
  phone?: string;
  headline?: string;
  summary?: string;
  resumePath?: string | null;
  resumePublicId?: string | null;
  skills?: string[];
  experience?: CandidateExperience[];
  education?: CandidateEducation[];
}

export interface CandidateListItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  projectId?: string | null;
  jobId?: string | null;
  recruiterId?: string;
  isBlocked?: boolean;
  avatar?: string | null;
  avatarPublicId?: string | null;
  status: string;
  /** Optional convenience field populated by some list endpoints when a job is linked. */
  jobTitle?: string;
  /** Optional convenience field populated by some list endpoints when a project is linked. */
  projectName?: string;
  /** Display name of the recruiter who owns this candidate (joined by some endpoints). */
  recruiterName?: string;
  location?: string;
  tags?: string[];
  fundingRound?: string;
  talentDensity?: string;
  likelinessToRespond?: string;
  resumeUrl?: string | null;
  resumePublicId?: string | null;
  resumeText?: string;
  skills?: string[];
  experiences?: CandidateExperience[];
  activities?: { type: string; description: string; date: string }[];
  internalNotes?: { id: number; text: string; date: string; createdAt: number }[];
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

// ============================================================================
// Projects / Clients
// ============================================================================

export interface Project {
  id: string;
  name: string;
  recruiterId?: string;
  /** Optional convenience counters populated by list endpoints. */
  candidateCount?: number;
  jobCount?: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  company?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

// ============================================================================
// Activity (Notes / Tags / Calls / Timeline)
// ============================================================================

export interface ActivityNote {
  id: string;
  candidateId: string;
  authorId?: string;
  authorName?: string;
  title: string;
  description?: string;
  content?: string;
  isPinned?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface ActivityTag {
  id: string;
  name: string;
  color: string;
  [key: string]: unknown;
}

export interface ActivityCall {
  id: string;
  candidateId: string;
  authorId?: string;
  authorName?: string;
  callType?: 'incoming' | 'outgoing';
  callStatus?: 'completed' | 'missed' | 'scheduled' | 'no-answer' | string;
  scheduledAt?: string;
  completedAt?: string;
  duration?: number;
  durationMinutes?: number;
  outcome?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

/**
 * Entry in the candidate activity timeline.
 *
 * This is intentionally a flat, permissive interface (rather than a discriminated
 * union of `ActivityNote | ActivityCall`) because the timeline view freely mixes
 * synthetic items (emails, status changes, internal notes) that don't fit either
 * shape. The `type` discriminator distinguishes notes vs. calls at render time.
 */
export interface TimelineItem {
  id: string;
  type: 'note' | 'call' | string;
  candidateId?: string;
  authorId?: string;
  authorName?: string;
  recruiterName?: string;
  title?: string;
  description?: string;
  notes?: string;
  isPinned?: boolean;
  /** Note tags populated as full objects when joined by the backend. */
  tags?: ActivityTag[];
  /** Call fields. */
  callType?: 'incoming' | 'outgoing';
  callStatus?: string;
  outcome?: string;
  duration?: number;
  durationMinutes?: number;
  scheduledAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: unknown;
}

// ============================================================================
// Analytics / Dashboard
// ============================================================================

export interface PipelineStatusItem {
  status: string;
  count: number;
}

export interface HiresPerMonthItem {
  /** 4-digit year (e.g. 2026). */
  year: number;
  /** 1-12 month number. */
  month: number;
  /** Optional pre-formatted label (e.g. "2026-05"). */
  label?: string;
  count: number;
}

export interface DashboardAnalytics {
  totalJobs?: number;
  openJobs?: number;
  totalProjects?: number;
  totalCandidates?: number;
  totalApplicants?: number;
  totalApplications?: number;
  totalHires?: number;
  totalInterviews?: number;
  pipeline?: PipelineStatusItem[];
  pipelineStatus?: PipelineStatusItem[];
  hiresPerMonth?: HiresPerMonthItem[];
  [key: string]: unknown;
}
