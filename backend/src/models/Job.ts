import mongoose, { Schema, type Model } from 'mongoose';

export interface IJob {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  skills: string[];
  salary: string;
  location: string;
  requirements: string[];
  customFields: { name: string; value: string }[];
  recruiterIds: mongoose.Types.ObjectId[];
  recruiterAssignments: {
    recruiterId: mongoose.Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected' | 'requested';
    acceptedAt?: Date;
  }[];
  status: 'draft' | 'published' | 'closed';
  benefits: string[];
  personalQuestions: { question: string; required: boolean }[];
  workplaceType?: string;
  roleType?: string;
  companyName?: string;
  companyLogo?: string;
  reward?: string;
  idealCandidate?: {
    seniority?: string;
    experience?: string;
    education?: string;
  };
  stats?: {
    totalCandidates: number;
    interviewing: number;
    openings: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, default: '' },
    skills: { type: [String], default: [] },
    salary: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    requirements: { type: [String], default: [] },
    customFields: {
      type: [
        {
          name: { type: String, trim: true },
          value: { type: String, trim: true },
        },
      ],
      default: [],
    },
    recruiterIds: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
    recruiterAssignments: {
      type: [
        {
          recruiterId: { type: Schema.Types.ObjectId, ref: 'User' },
          status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'requested'],
            default: 'pending',
          },
          acceptedAt: { type: Date },
        },
      ],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'draft',
    },
    benefits: { type: [String], default: [] },
    personalQuestions: {
      type: [
        {
          question: { type: String, trim: true },
          required: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
    workplaceType: { type: String, trim: true, default: '' },
    roleType: { type: String, trim: true, default: '' },
    companyName: { type: String, trim: true, default: '' },
    companyLogo: { type: String, default: '' },
    reward: { type: String, default: '' }, // e.g., "22.5% first year + bonus"
    idealCandidate: {
      seniority: { type: String, default: '' },
      experience: { type: String, default: '' },
      education: { type: String, default: '' },
    },
    stats: {
      totalCandidates: { type: Number, default: 0 },
      interviewing: { type: Number, default: 0 },
      openings: { type: Number, default: 1 },
    },
  },
  { timestamps: true }
);

jobSchema.index({ recruiterIds: 1, status: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ title: 1, description: 1 });

export const Job: Model<IJob> =
  (mongoose.models.Job as Model<IJob>) ?? mongoose.model<IJob>('Job', jobSchema);
