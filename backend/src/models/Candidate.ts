import mongoose, { Schema, type Model } from 'mongoose';

export interface ICandidate {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  projectId?: mongoose.Types.ObjectId | null;
  /** Job (role) – admin-created job; title shows in candidate Role dropdown */
  jobId?: mongoose.Types.ObjectId | null;
  recruiterId: mongoose.Types.ObjectId;
  /** When true, only admin can see; recruiters cannot list or view this candidate */
  isBlocked?: boolean;
  /** Cloudinary URL – optional; profile can exist without image */
  avatar?: string | null;
  avatarPublicId?: string | null;
  status?: string;
  location?: string;
  tags?: string[];
  fundingRound?: string;
  talentDensity?: string;
  likelinessToRespond?: string;
  resumeUrl?: string | null;
  resumePublicId?: string | null;
  resumeText?: string;
  skills?: string[];
  experiences?: { title: string; company: string; description?: string; startDate?: string; endDate?: string }[];
  activities?: { type: string; description: string; date: Date }[];
  internalNotes?: { id: number; text: string; date: string; createdAt: number }[];
  createdAt: Date;
  updatedAt: Date;
}

const candidateSchema = new Schema<ICandidate>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: '', trim: true },
    linkedInUrl: { type: String, default: '', trim: true },
    githubUrl: { type: String, default: '', trim: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', default: null },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', default: null },
    recruiterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isBlocked: { type: Boolean, default: false },
    avatar: { type: String, default: null },
    avatarPublicId: { type: String, default: null },
    status: { type: String, default: 'Sourced', trim: true },
    location: { type: String, default: '', trim: true },
    tags: { type: [String], default: [] },
    fundingRound: { type: String, default: '', trim: true },
    talentDensity: { type: String, default: '', trim: true },
    likelinessToRespond: { type: String, default: '', trim: true },
    experiences: [
      {
        title: { type: String, required: true },
        company: { type: String, required: true },
        description: { type: String },
        startDate: { type: String },
        endDate: { type: String },
      }
    ],
    resumeUrl: { type: String, default: null },
    resumePublicId: { type: String, default: null },
    resumeText: { type: String, default: '' },
    skills: { type: [String], default: [] },
    activities: [
      {
        type: { type: String, required: true },
        description: { type: String, required: true },
        date: { type: Date, default: Date.now },
      }
    ],
    internalNotes: [
      {
        id: { type: Number, required: true },
        text: { type: String, required: true },
        date: { type: String, required: true },
        createdAt: { type: Number, required: true },
      }
    ],
  },
  { timestamps: true }
);

candidateSchema.index({ recruiterId: 1, createdAt: -1 });
candidateSchema.index({ recruiterId: 1, isBlocked: 1 });
candidateSchema.index({ email: 1, recruiterId: 1 });
candidateSchema.index({ jobId: 1, recruiterId: 1 });
candidateSchema.index({ email: 1 });
candidateSchema.index({ status: 1, recruiterId: 1 });
candidateSchema.index({ tags: 1, recruiterId: 1 });
candidateSchema.index({ location: 1, recruiterId: 1 });

export const Candidate: Model<ICandidate> =
  (mongoose.models.Candidate as Model<ICandidate>) ?? mongoose.model<ICandidate>('Candidate', candidateSchema);
