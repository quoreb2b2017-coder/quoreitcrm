import mongoose, { Schema, type Model } from 'mongoose';

export type ApplicationStatus =
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offered'
  | 'hired'
  | 'rejected';

export type ApplicationSource = 'public' | 'crm' | 'portal';

export interface IApplication {
  _id: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  /** Set when candidate (User) applies; used for pipeline + resume from CandidateProfile */
  candidateId?: mongoose.Types.ObjectId | null;
  /** Set when recruiter adds/assigns CRM candidate to job; pipeline shows Candidate name/email */
  crmCandidateId?: mongoose.Types.ObjectId | null;
  /** Public website applicant (no CRM account) */
  source?: ApplicationSource;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  resumeUrl?: string;
  coverLetter?: string;
  questionAnswers?: { question: string; answer: string }[];
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    candidateId: { type: Schema.Types.ObjectId, ref: 'User', required: false, default: null },
    crmCandidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', required: false, default: null },
    source: { type: String, enum: ['public', 'crm', 'portal'], default: 'crm' },
    firstName: { type: String, trim: true, default: '' },
    lastName: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    resumeUrl: { type: String, default: '' },
    coverLetter: { type: String, default: '' },
    questionAnswers: {
      type: [{ question: { type: String, trim: true }, answer: { type: String, default: '' } }],
      default: [],
    },
    status: {
      type: String,
      enum: ['applied', 'screening', 'interview', 'offered', 'hired', 'rejected'],
      default: 'applied',
    },
  },
  { timestamps: true }
);

applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: 1 });
applicationSchema.index({ jobId: 1, status: 1 });
applicationSchema.index({ crmCandidateId: 1, jobId: 1 });
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true, partialFilterExpression: { candidateId: { $type: 'objectId' } } });
applicationSchema.index({ jobId: 1, crmCandidateId: 1 }, { unique: true, partialFilterExpression: { crmCandidateId: { $type: 'objectId' } } });
applicationSchema.index({ jobId: 1, email: 1 }, { unique: true, partialFilterExpression: { source: 'public', email: { $type: 'string', $ne: '' } } });
applicationSchema.index({ source: 1, createdAt: -1 });

export const Application: Model<IApplication> =
  (mongoose.models.Application as Model<IApplication>) ??
  mongoose.model<IApplication>('Application', applicationSchema);
