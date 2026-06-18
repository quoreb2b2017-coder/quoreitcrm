import { axiosClient } from './axios';
import type {
  ApiResponse,
  User,
  LoginCredentials,
  RegisterPayload,
  AuthTokens,
  Job,
  ListJobsParams,
  CandidateProfile,
  UpdateCandidateProfilePayload,
  Application,
  ActivityNote,
  ActivityTag,
  ActivityCall,
  TimelineItem,
  Project,
  CandidateListItem,
  Client,
} from '@ats-saas/shared';

const auth = {
  login: (credentials: LoginCredentials) =>
    axiosClient.post<ApiResponse<AuthTokens>>('/auth/login', credentials),
  register: (payload: RegisterPayload) =>
    axiosClient.post<ApiResponse<AuthTokens>>('/auth/register', payload),
  logout: () => axiosClient.post<ApiResponse<{ message: string }>>('/auth/logout'),
  me: () => axiosClient.get<ApiResponse<User>>('/auth/me'),
  refresh: () => axiosClient.get<ApiResponse<AuthTokens>>('/auth/refresh'),
  googleUrl: (params?: { returnTo?: string }) =>
    axiosClient.get<ApiResponse<{ url: string }>>('/auth/google/url', { params }),
  googleDisconnect: () => axiosClient.post<ApiResponse<{ message: string }>>('/auth/google/disconnect'),
};

const upload = {
  image: (file: File, onUploadProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post<ApiResponse<{ url: string; publicId: string }>>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          onUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      },
    });
  },
  resume: (file: File, onUploadProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post<ApiResponse<{ url: string; publicId: string }>>('/upload/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          onUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      },
    });
  },
  profilePhoto: (file: File, onUploadProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post<ApiResponse<{ url: string; publicId: string }>>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          onUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      },
    });
  },
  parseResume: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post<ApiResponse<{ fileUrl: string; publicId: string; extracted: { name: string; email: string; phone: string; linkedInUrl: string }; text: string; resumeText: string; skills: string[] }>>('/upload/parse-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  parseJobDescription: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post<ApiResponse<{ text: string }>>('/upload/parse-jd', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  introVideo: (file: File, onUploadProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post<ApiResponse<{ url: string; publicId: string }>>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          onUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      },
    });
  },
  document: (file: File, onUploadProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post<ApiResponse<{ url: string; publicId: string }>>('/upload/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          onUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      },
    });
  },
  delete: (publicId: string, resourceType?: string) => axiosClient.delete<ApiResponse<{ message: string }>>(`/upload/${publicId}`),
  signedUrl: (
    publicId: string,
    resourceType: 'image' | 'raw' | 'video' = 'image',
    type: string = 'upload',
    format?: string,
    version?: number,
    download?: boolean
  ) =>
    axiosClient.get<ApiResponse<{ url: string }>>('/upload/signed-url', {
      params: {
        publicId,
        resourceType,
        type,
        ...(format ? { format } : {}),
        ...(version ? { version } : {}),
        ...(download ? { download: 1 } : {}),
      },
    }),
};

const jobs = {
  list: (params?: ListJobsParams) =>
    axiosClient.get<ApiResponse<{ items: Job[]; total: number; totalPages: number }>>('/jobs', { params }),
  get: (id: string) => axiosClient.get<ApiResponse<Job>>(`/jobs/${id}`),
  create: (data: Partial<Job>) => axiosClient.post<ApiResponse<Job>>('/jobs', data),
  update: (id: string, data: Partial<Job>) =>
    axiosClient.patch<ApiResponse<Job>>(`/jobs/${id}`, data),
  delete: (id: string) => axiosClient.delete<ApiResponse<{ message: string }>>(`/jobs/${id}`),
  assignRecruiters: (id: string, recruiterIds: string[]) =>
    axiosClient.post<ApiResponse<Job>>(`/jobs/${id}/assign`, { recruiterIds }),
  acceptJob: (id: string) => axiosClient.patch<ApiResponse<any>>(`/jobs/${id}/accept`),
  rejectJob: (id: string) => axiosClient.patch<ApiResponse<any>>(`/jobs/${id}/reject`),
  requestAccess: (id: string) => axiosClient.post<ApiResponse<any>>(`/jobs/${id}/request`),
  approveAccess: (id: string, recruiterId: string) => axiosClient.patch<ApiResponse<any>>(`/jobs/${id}/approve/${recruiterId}`),
};

const users = {
  recruiters: () => axiosClient.get<ApiResponse<User[]>>('/users/recruiters'),
  listRecruiters: () => axiosClient.get<ApiResponse<User[]>>('/users/recruiters'),
  stats: () => axiosClient.get<ApiResponse<any>>('/users/stats'),
  getRoleCounts: () => axiosClient.get<ApiResponse<any>>('/users/stats'),
  create: (data: any) => axiosClient.post<ApiResponse<User>>('/users', data),
  createUser: (data: any) => axiosClient.post<ApiResponse<User>>('/users', data),
  listUsers: () => axiosClient.get<ApiResponse<User[]>>('/users'),
  getProfile: (id: string) => axiosClient.get<ApiResponse<User>>(`/users/${id}`),
  updateProfile: (id: string, data: Partial<User>) => axiosClient.patch<ApiResponse<User>>(`/users/${id}`, data),
};

const analytics = {
  dashboard: () => axiosClient.get<ApiResponse<any>>('/analytics/dashboard'),
  getDashboard: () => axiosClient.get<ApiResponse<any>>('/analytics/dashboard'),
};

const applications = {
  list: (params?: { jobId?: string; stage?: string; source?: string; limit?: number; page?: number }) =>
    axiosClient.get<ApiResponse<Application[]>>('/applications', { params }),
  listPaginated: (params?: { jobId?: string; candidateId?: string; stage?: string; source?: string; limit?: number; page?: number }) =>
    axiosClient.get<ApiResponse<{ items: any[]; total: number; page: number; limit: number; totalPages: number }>>('/applications', { params }),
  addToPipeline: (jobId: string, crmCandidateId: string) =>
    axiosClient.post<ApiResponse<Application>>('/applications/add-to-pipeline', { jobId, crmCandidateId }),
  updateStage: (id: string, stage: string) =>
    axiosClient.patch<ApiResponse<Application>>(`/applications/${id}/stage`, { stage }),
  getResumeBlob: (id: string) => axiosClient.get<Blob>(`/applications/${id}/resume`, { responseType: 'blob' }),
};

const profile = {
  get: () => axiosClient.get<ApiResponse<CandidateProfile>>('/profile'),
  update: (data: UpdateCandidateProfilePayload) =>
    axiosClient.patch<ApiResponse<CandidateProfile>>('/profile', data),
  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post<ApiResponse<{ resumePath: string }>>('/profile/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

const notes = {
  list: (candidateId: string) =>
    axiosClient.get<ApiResponse<ActivityNote[]>>(`/notes/candidate/${candidateId}`),
  create: (data: Partial<ActivityNote>) => axiosClient.post<ApiResponse<ActivityNote>>('/notes', data),
  update: (id: string, data: Partial<ActivityNote>) =>
    axiosClient.patch<ApiResponse<ActivityNote>>(`/notes/${id}`, data),
  delete: (id: string) => axiosClient.delete<ApiResponse<{ message: string }>>(`/notes/${id}`),
};

const calls = {
  list: (candidateId: string) =>
    axiosClient.get<ApiResponse<ActivityCall[]>>(`/calls/candidate/${candidateId}`),
  listScheduled: () => axiosClient.get<ApiResponse<any[]>>('/calls/scheduled'),
  create: (data: Partial<ActivityCall>) => axiosClient.post<ApiResponse<ActivityCall>>('/calls', data),
  update: (id: string, data: Partial<ActivityCall>) =>
    axiosClient.patch<ApiResponse<ActivityCall>>(`/calls/${id}`, data),
  delete: (id: string) => axiosClient.delete<ApiResponse<{ message: string }>>(`/calls/${id}`),
};

const tags = {
  list: () => axiosClient.get<ApiResponse<ActivityTag[]>>('/tags'),
  create: (data: { name: string; color: string }) =>
    axiosClient.post<ApiResponse<ActivityTag>>('/tags', data),
};

const timeline = {
  list: (candidateId: string) =>
    axiosClient.get<ApiResponse<TimelineItem[]>>(`/timeline/candidate/${candidateId}`),
  get: (candidateId: string) =>
    axiosClient.get<ApiResponse<TimelineItem[]>>(`/timeline/candidate/${candidateId}`),
};

const emails = {
  prepareInvite: (data: {
    summary: string;
    description?: string;
    location?: string;
    startAt: string;
    endAt: string;
    createMeet?: boolean;
  }) =>
    axiosClient.post<
      ApiResponse<{ meetLink?: string; calendarEventId?: string; icsBase64: string; icsFilename: string }>
    >('/emails/prepare-invite', data),
  send: (data: {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
    attachments?: { filename: string; contentBase64: string; contentType?: string }[];
  }) =>
    axiosClient.post<ApiResponse<{ message: string; gmailMessageId: string; gmailThreadId?: string }>>(
      '/emails/send',
      data
    ),
  listSent: (params: { candidateEmail: string; limit?: number }) =>
    axiosClient.get<ApiResponse<{ items: any[] }>>('/emails/sent', { params }),
  gmailSentProof: (emailLogId: string) =>
    axiosClient.get<
      ApiResponse<{
        gmailMessageId: string;
        onGmail: boolean;
        hasSentLabel: boolean;
        labelIds: string[];
        note: string;
      }>
    >(`/emails/sent/${encodeURIComponent(emailLogId)}/gmail-proof`),
  syncInbox: (data?: { maxResults?: number; query?: string }) =>
    axiosClient.post<ApiResponse<{ synced: number }>>('/emails/inbox/sync', data ?? {}),
  inboxThreads: (params?: { limit?: number }) =>
    axiosClient.get<
      ApiResponse<{
        items: Array<{
          threadId: string;
          subject: string;
          snippet: string;
          lastMessageAt: string;
          messageCount: number;
          unreadCount: number;
          lastSender: string;
        }>;
      }>
    >('/emails/inbox', { params }),
  inboxThread: (threadId: string) =>
    axiosClient.get<
      ApiResponse<{
        threadId: string;
        messages: Array<{
          id: string;
          gmailMessageId: string;
          sender: string;
          receiver: string[];
          subject: string;
          message: string;
          snippet?: string;
          isRead: boolean;
          internalDate: string;
        }>;
      }>
    >(`/emails/inbox/thread/${encodeURIComponent(threadId)}`),
};

const activity = {
  list: () => axiosClient.get<ApiResponse<any[]>>('/activity'),
  getCandidates: () => axiosClient.get<ApiResponse<any[]>>('/activity/candidates'),
};

const projects = {
  list: () => axiosClient.get<ApiResponse<Project[]>>('/projects'),
  create: (data: { name: string }) => axiosClient.post<ApiResponse<Project>>('/projects', data),
  delete: (id: string) => axiosClient.delete<ApiResponse<{ message: string }>>(`/projects/${id}`),
};

const candidates = {
  list: (params?: { page?: number; limit?: number; search?: string; projectId?: string; jobId?: string; statusGroup?: string; location?: string; tags?: string; fundingRound?: string; talentDensity?: string; likelinessToRespond?: string }) =>
    axiosClient.get<ApiResponse<{
      items: CandidateListItem[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      counts: { all: number; activeCandidates: number; highlyRated: number; likelyToRespond: number; expressedInterest: number };
    }>>('/candidates', { params }),
  get: (id: string) => axiosClient.get<ApiResponse<CandidateListItem>>(`/candidates/${id}`),
  create: (data: any) => axiosClient.post<ApiResponse<CandidateListItem>>('/candidates', data),
  update: (id: string, data: any) => axiosClient.patch<ApiResponse<CandidateListItem>>(`/candidates/${id}`, data),
  syncLinkedIn: (id: string) => axiosClient.post<ApiResponse<{ candidate: CandidateListItem; scraped: any; syncedAt: string }>>(`/candidates/${id}/sync-linkedin`),
  delete: (id: string) => axiosClient.delete<ApiResponse<{ message: string }>>(`/candidates/${id}`),
  exportCandidates: () => axiosClient.get<Blob>('/candidates/export', { responseType: 'blob' }),
  getFilters: () => axiosClient.get<ApiResponse<{ locations: string[]; tags: string[] }>>('/candidates/filters'),
};

const clients = {
  list: () => axiosClient.get<ApiResponse<Client[]>>('/clients'),
  create: (data: Partial<Client>) => axiosClient.post<ApiResponse<Client>>('/clients', data),
};

type ChatMessage = {
  id: string;
  jobId: string;
  senderId: string;
  senderName: string;
  message: string;
  encryptedMessage?: string;
  createdAt: string;
};

type ChatJob = {
  id: string;
  title: string;
  companyName: string;
  location: string;
  recruiters: { id: string; name: string; email: string }[];
};

const messages = {
  listJobs: () => axiosClient.get<ApiResponse<ChatJob[]>>('/messages/jobs'),
  history: (jobId: string) =>
    axiosClient.get<ApiResponse<ChatMessage[]>>('/messages', { params: { jobId } }),
  send: (jobId: string, message: string) =>
    axiosClient.post<ApiResponse<ChatMessage>>('/messages', { jobId, message }),
  delete: (id: string) => axiosClient.delete<ApiResponse<{ message: string }>>(`/messages/${id}`),
};

export const api = {
  auth,
  upload,
  jobs,
  users,
  analytics,
  applications,
  profile,
  notes,
  calls,
  tags,
  timeline,
  emails,
  activity,
  projects,
  candidates,
  clients,
  messages,
};

export default api;
